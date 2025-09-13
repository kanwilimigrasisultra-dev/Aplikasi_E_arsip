
import React, { useState, useMemo, useEffect } from 'react';
import { SuratKeluar as TSuratKeluar, KategoriSurat, SifatSurat, User, AnySurat, KopSuratSettings, AppSettings, FolderArsip, UnitKerja, MasalahUtama, KlasifikasiSurat, PenomoranSettings, TipeSurat, SuratMasuk as TSuratMasuk } from '../types';
import { PlusIcon, SearchIcon, RefreshIcon } from './icons';
import SuratFormModal from './SuratFormModal';
import SuratDetailModal from './SuratDetailModal';
import PilihFolderArsipModal from './PilihFolderArsipModal';

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

interface SuratKeluarProps {
    suratList: TSuratKeluar[];
    kategoriList: KategoriSurat[];
    masalahUtamaList: MasalahUtama[];
    klasifikasiList: KlasifikasiSurat[];
    unitKerjaList: UnitKerja[];
    currentUser: User;
    allSurat: AnySurat[];
    kopSuratSettings: KopSuratSettings;
    appSettings: AppSettings;
    penomoranSettings: PenomoranSettings;
    folders: FolderArsip[];
    onSubmit: (surat: Omit<AnySurat, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'disposisi' | 'status'>) => void;
    onUpdate: (surat: AnySurat) => void;
    onArchive: (suratId: string, folderId: string) => void;
    onTambahTandaTangan: (suratId: string, signatureDataUrl?: string) => void;
    initialData?: (Partial<TSuratKeluar> & { suratAsli?: TSuratMasuk }) | null;
    clearInitialData: () => void;
}

const SuratKeluar: React.FC<SuratKeluarProps> = (props) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);
    const [selectedSurat, setSelectedSurat] = useState<TSuratKeluar | null>(null);
    const [suratToEdit, setSuratToEdit] = useState<TSuratKeluar | null>(null);
    const [suratToArchive, setSuratToArchive] = useState<string | null>(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sifatFilter, setSifatFilter] = useState('');
    const [kategoriFilter, setKategoriFilter] = useState('');
    const [unitKerjaFilter, setUnitKerjaFilter] = useState('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    useEffect(() => {
        if (props.initialData) {
            setSuratToEdit(null); // Ensure we are not in edit mode
            setFormModalOpen(true);
        }
    }, [props.initialData]);
    
    const handleCloseFormModal = () => {
        setFormModalOpen(false);
        if (props.initialData) {
            props.clearInitialData();
        }
    };

    const filteredSurat = useMemo(() => {
        return props.suratList
            .filter(s => {
                const searchLower = debouncedSearchTerm.toLowerCase();
                return (
                    s.perihal.toLowerCase().includes(searchLower) ||
                    s.nomorSurat.toLowerCase().includes(searchLower) ||
                    s.tujuan.toLowerCase().includes(searchLower)
                );
            })
            .filter(s => sifatFilter === '' || s.sifat === sifatFilter)
            .filter(s => kategoriFilter === '' || s.kategoriId === kategoriFilter)
             .filter(s => {
                if (unitKerjaFilter === '') return true;
                // Check internal mail destination ID
                if (s.tujuanUnitKerjaId === unitKerjaFilter) return true;
                // Check external mail destination name against unit name
                const tujuanUnit = props.unitKerjaList.find(u => u.id === unitKerjaFilter);
                return tujuanUnit ? s.tujuan === tujuanUnit.nama : false;
            })
            .filter(s => {
                if (!startDate || !endDate) return true;
                const suratDate = new Date(s.tanggal);
                return suratDate >= new Date(startDate) && suratDate <= new Date(endDate);
            });
    }, [props.suratList, debouncedSearchTerm, sifatFilter, kategoriFilter, unitKerjaFilter, startDate, endDate, props.unitKerjaList]);


    const handleOpenDetail = (surat: TSuratKeluar) => {
        setSelectedSurat(surat);
        setDetailModalOpen(true);
    };

    const handleOpenEdit = (surat: TSuratKeluar) => {
        setSuratToEdit(surat);
        setFormModalOpen(true);
    };

    const handleOpenArchive = (suratId: string) => {
        setSuratToArchive(suratId);
        setArchiveModalOpen(true);
    };
    
    const handleConfirmArchive = (folderId: string) => {
        if(suratToArchive) {
            props.onArchive(suratToArchive, folderId);
        }
        setArchiveModalOpen(false);
        setSuratToArchive(null);
    };
    
    const handleResetFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setSifatFilter('');
        setKategoriFilter('');
        setUnitKerjaFilter('');
    };
    
    const handleFormSubmit = (suratData: Omit<AnySurat, 'id' | 'isArchived' | 'disposisi' | 'fileUrl' | 'unitKerjaId' | 'status'> | AnySurat) => {
        if ('id' in suratData) {
            props.onUpdate(suratData as AnySurat);
        } else {
            props.onSubmit(suratData as Omit<TSuratKeluar, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'disposisi' | 'status'>);
        }
        handleCloseFormModal();
    };

    const getSifatBadge = (sifat: SifatSurat) => {
        const colorMap = {
            [SifatSurat.BIASA]: 'bg-slate-100 text-slate-800',
            [SifatSurat.PENTING]: 'bg-sky-100 text-sky-800',
            [SifatSurat.SANGAT_PENTING]: 'bg-amber-100 text-amber-800',
            [SifatSurat.RAHASIA]: 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[sifat]}`}>{sifat}</span>;
    }

    const getStatusBadge = (status: 'Draf' | 'Terkirim') => {
        const colorMap = {
            'Draf': 'bg-amber-100 text-amber-800',
            'Terkirim': 'bg-emerald-100 text-emerald-800',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[status]}`}>{status}</span>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h3 className="text-xl font-bold text-slate-800">Daftar Surat Keluar</h3>
                    <button onClick={() => { setSuratToEdit(null); setFormModalOpen(true); }} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Buat Surat Keluar
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end mb-4 p-4 bg-slate-50 rounded-lg border">
                    <div className="col-span-1 lg:col-span-2 xl:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cari</label>
                        <div className="relative">
                           <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                           <input type="text" placeholder="Perihal, nomor, tujuan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Surat (Mulai)</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Surat (Akhir)</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" />
                    </div>
                     <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sifat</label>
                        <select value={sifatFilter} onChange={e => setSifatFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white">
                            <option value="">Semua Sifat</option>
                            {Object.values(SifatSurat).map(s => <option key={s as string} value={s as string}>{s}</option>)}
                        </select>
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                        <select value={kategoriFilter} onChange={e => setKategoriFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white">
                            <option value="">Semua Kategori</option>
                            {props.kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                        </select>
                    </div>
                     <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Unit Kerja Tujuan</label>
                        <select value={unitKerjaFilter} onChange={e => setUnitKerjaFilter(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white">
                            <option value="">Semua Unit</option>
                            {props.unitKerjaList.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                        </select>
                    </div>
                     <div className="col-span-full xl:col-span-1">
                        <button onClick={handleResetFilters} className="w-full flex items-center justify-center bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors shadow">
                            <RefreshIcon className="w-5 h-5 mr-2" />
                            Atur Ulang
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nomor Surat</th>
                                <th scope="col" className="px-6 py-3">Perihal</th>
                                <th scope="col" className="px-6 py-3">Tujuan</th>
                                <th scope="col" className="px-6 py-3">Tanggal Surat</th>
                                <th scope="col" className="px-6 py-3">Sifat</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSurat.map(surat => (
                                <tr key={surat.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{surat.nomorSurat}</td>
                                    <td className="px-6 py-4 max-w-xs truncate">{surat.perihal}</td>
                                    <td className="px-6 py-4">{surat.tujuan}</td>
                                    <td className="px-6 py-4">{new Date(surat.tanggal).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{getSifatBadge(surat.sifat)}</td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(surat.status)}
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => handleOpenDetail(surat)} className="font-medium text-blue-600 hover:text-blue-800">Detail</button>
                                        <button onClick={() => handleOpenEdit(surat)} className="font-medium text-amber-600 hover:text-amber-800">Edit</button>
                                        <button onClick={() => handleOpenArchive(surat.id)} className="font-medium text-emerald-600 hover:text-emerald-800">Arsip</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SuratFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSubmit={handleFormSubmit}
                tipe={TipeSurat.KELUAR}
                kategoriList={props.kategoriList}
                masalahUtamaList={props.masalahUtamaList}
                klasifikasiList={props.klasifikasiList}
                unitKerjaList={props.unitKerjaList}
                currentUser={props.currentUser}
                allSurat={props.allSurat}
                penomoranSettings={props.penomoranSettings}
                suratToEdit={suratToEdit}
                initialData={props.initialData}
            />

            {selectedSurat && (
                <SuratDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setDetailModalOpen(false)}
                    surat={selectedSurat}
                    kategoriList={props.kategoriList}
                    allUsers={[]} // Not needed for Surat Keluar detail
                    currentUser={props.currentUser}
                    onArchive={() => handleOpenArchive(selectedSurat.id)}
                    onAddDisposisi={() => {}} // Not applicable
                    onUpdateDisposisiStatus={() => {}} // Not applicable
                    onTambahTandaTangan={props.onTambahTandaTangan}
                    onReplyWithAI={() => {}} // Not applicable here
                    kopSuratSettings={props.kopSuratSettings}
                    appSettings={props.appSettings}
                    allSurat={props.allSurat}
                    unitKerjaList={props.unitKerjaList}
                    // Pass these lists for displaying classification details
                    masalahUtamaList={props.masalahUtamaList}
                    klasifikasiList={props.klasifikasiList}
                />
            )}

            <PilihFolderArsipModal
                isOpen={isArchiveModalOpen}
                onClose={() => setArchiveModalOpen(false)}
                onSubmit={handleConfirmArchive}
                folders={props.folders}
            />
        </div>
    );
};

export default SuratKeluar;