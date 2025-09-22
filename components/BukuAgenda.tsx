import React, { useState, useMemo } from 'react';
import { AnySurat, User, TipeSurat, SuratMasuk, SuratKeluar, NotaDinas } from '../types';
import { BookOpenIcon, SearchIcon } from './icons';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}


interface BukuAgendaProps {
    allSurat: AnySurat[];
    allUsers: User[];
}

const BukuAgenda: React.FC<BukuAgendaProps> = ({ allSurat, allUsers }) => {
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tipeFilter, setTipeFilter] = useState('');
    
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const filteredSurat = useMemo(() => {
        // Sort by nomorAgenda descending
        const sorted = [...allSurat].sort((a, b) => (b.nomorAgenda || 0) - (a.nomorAgenda || 0));

        return sorted
            .filter(s => {
                const searchLower = debouncedSearchTerm.toLowerCase();
                const dariKepada = s.tipe === TipeSurat.MASUK 
                    ? (s as SuratMasuk).pengirim.toLowerCase()
                    : (s.tipe === TipeSurat.KELUAR 
                        ? (s as SuratKeluar).tujuan.toLowerCase()
                        : (s as NotaDinas).tujuanUserIds.map(id => allUsers.find(u => u.id === id)?.nama).join(' ').toLowerCase()
                    );
                return (
                    s.perihal.toLowerCase().includes(searchLower) ||
                    s.nomorSurat.toLowerCase().includes(searchLower) ||
                    dariKepada.includes(searchLower)
                );
            })
            .filter(s => tipeFilter === '' || s.tipe === tipeFilter)
            .filter(s => {
                if (!startDate || !endDate) return true;
                const suratDate = new Date(s.tanggal);
                return suratDate >= new Date(startDate) && suratDate <= new Date(endDate);
            });
    }, [allSurat, debouncedSearchTerm, tipeFilter, startDate, endDate, allUsers]);

    const getDariKepada = (surat: AnySurat) => {
        if (surat.tipe === TipeSurat.MASUK) {
            return { label: 'Dari', value: surat.pengirim };
        }
        if (surat.tipe === TipeSurat.KELUAR) {
            return { label: 'Kepada', value: surat.tujuan };
        }
        if (surat.tipe === TipeSurat.NOTA_DINAS) {
            const tujuanNames = surat.tujuanUserIds.map(id => allUsers.find(u => u.id === id)?.nama).filter(Boolean).join(', ');
            return { label: 'Kepada', value: tujuanNames };
        }
        return { label: '-', value: '-'};
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center">
                        <BookOpenIcon className="w-6 h-6 mr-3 text-slate-700" />
                        <h3 className="text-xl font-bold text-slate-800">Buku Agenda Digital</h3>
                    </div>
                     <button onClick={() => alert("Fitur ekspor sedang dalam pengembangan.")} className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors shadow text-sm font-medium">
                        Ekspor ke PDF
                    </button>
                </div>
                <p className="text-sm text-slate-500 mb-4">Mencatat seluruh riwayat korespondensi yang masuk dan keluar secara kronologis.</p>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-4 p-4 bg-slate-50 rounded-lg border">
                    <div className="col-span-1 lg:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cari Perihal, Nomor, Dari/Kepada</label>
                        <div className="relative">
                           <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                           <input type="text" placeholder="Masukkan kata kunci..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Surat</label>
                        <select value={tipeFilter} onChange={e => setTipeFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white">
                            <option value="">Semua Tipe</option>
                            <option value={TipeSurat.MASUK}>Surat Masuk</option>
                            <option value={TipeSurat.KELUAR}>Surat Keluar</option>
                            <option value={TipeSurat.NOTA_DINAS}>Nota Dinas</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rentang Tanggal Surat</label>
                        <div className="flex items-center space-x-2">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" />
                             <span>-</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">No. Agenda</th>
                                <th scope="col" className="px-6 py-3">Tipe</th>
                                <th scope="col" className="px-6 py-3">Tgl. Terima/Kirim</th>
                                <th scope="col" className="px-6 py-3">No. & Tgl. Surat</th>
                                <th scope="col" className="px-6 py-3">Dari/Kepada</th>
                                <th scope="col" className="px-6 py-3">Perihal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSurat.map(surat => {
                                const dariKepada = getDariKepada(surat);
                                return (
                                <tr key={surat.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-slate-800 text-center">{surat.nomorAgenda}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ surat.tipe === TipeSurat.MASUK ? 'bg-sky-100 text-sky-800' : (surat.tipe === TipeSurat.KELUAR ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800') }`}>{surat.tipe}</span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(surat.tanggal).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">{surat.nomorSurat}</p>
                                        <p className="text-xs text-slate-500">{new Date(surat.tanggal).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">{dariKepada.value}</p>
                                        <p className="text-xs text-slate-500">{dariKepada.label}</p>
                                    </td>
                                    <td className="px-6 py-4 max-w-sm truncate">{surat.perihal}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                     {filteredSurat.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>Tidak ada data yang cocok dengan filter Anda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BukuAgenda;