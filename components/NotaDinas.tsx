import React, { useState, useMemo } from 'react';
import { NotaDinas as TNotaDinas, KategoriSurat, SifatSurat, User, AnySurat, KopSuratSettings, FolderArsip, UnitKerja, TipeSurat, Tugas, AppSettings } from '../types';
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

interface NotaDinasProps {
    suratList: TNotaDinas[];
    kategoriList: KategoriSurat[];
    unitKerjaList: UnitKerja[];
    currentUser: User;
    allUsers: User[];
    kopSuratSettings: KopSuratSettings;
    appSettings: AppSettings;
    folders: FolderArsip[];
    onSubmit: (surat: Omit<AnySurat, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'disposisi' | 'status' | 'komentar' | 'tugasTerkait' | 'dokumenTerkait'>) => void;
    onUpdate: (surat: AnySurat) => void;
    onArchive: (suratId: string, folderId: string) => void;
    onAddKomentar: (suratId: string, teks: string) => void;
    onAddTask: (tugas: Omit<Tugas, 'id'>) => void;
}

const NotaDinasComponent: React.FC<NotaDinasProps> = (props) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);
    const [selectedSurat, setSelectedSurat] = useState<TNotaDinas | null>(null);
    const [suratToEdit, setSuratToEdit] = useState<TNotaDinas | null>(null);
    const [suratToArchive, setSuratToArchive] = useState<string | null>(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const filteredSurat = useMemo(() => {
        return props.suratList.filter(s => {
            const searchLower = debouncedSearchTerm.toLowerCase();
            const tujuanNames = s.tujuanUserIds.map(id => props.allUsers.find(u => u.id === id)?.nama || '').join(' ').toLowerCase();
            return (
                s.perihal.toLowerCase().includes(searchLower) ||
                s.nomorSurat.toLowerCase().includes(searchLower) ||
                tujuanNames.includes(searchLower)
            );
        });
    }, [props.suratList, debouncedSearchTerm, props.allUsers]);

    const handleOpenDetail = (surat: TNotaDinas) => {
        setSelectedSurat(surat);
        setDetailModalOpen(true);
    };

    const handleOpenEdit = (surat: TNotaDinas) => {
        setSuratToEdit(surat);
        setFormModalOpen(true);
    };

    const handleOpenArchive = (suratId: string) => {
        setSuratToArchive(suratId);
        setArchiveModalOpen(true);
    };
    
    const handleConfirmArchive = (folderId: string) => {
        if(suratToArchive) props.onArchive(suratToArchive, folderId);
        setArchiveModalOpen(false);
        setSuratToArchive(null);
    };
    
    const handleFormSubmit = (suratData: Omit<AnySurat, 'id' | 'isArchived' | 'disposisi' | 'fileUrl' | 'unitKerjaId' | 'status' | 'komentar' | 'tugasTerkait' | 'dokumenTerkait'> | AnySurat) => {
        if ('id' in suratData) {
            props.onUpdate(suratData as AnySurat);
        } else {
            props.onSubmit(suratData as Omit<TNotaDinas, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'status' | 'komentar' | 'tugasTerkait' | 'dokumenTerkait' | 'pembuat'>);
        }
        setFormModalOpen(false);
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

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <h3 className="text-xl font-bold text-slate-800">Daftar Nota Dinas</h3>
                    <button onClick={() => { setSuratToEdit(null); setFormModalOpen(true); }} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Buat Nota Dinas
                    </button>
                </div>

                <div className="relative mb-4">
                   <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   <input type="text" placeholder="Cari perihal, nomor, atau tujuan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full max-w-md pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nomor Surat</th>
                                <th scope="col" className="px-6 py-3">Perihal</th>
                                <th scope="col" className="px-6 py-3">Tujuan Internal</th>
                                <th scope="col" className="px-6 py-3">Tanggal</th>
                                <th scope="col" className="px-6 py-3">Sifat</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSurat.map(surat => {
                                const canEdit = surat.status === 'Draf' && surat.pembuat.id === props.currentUser.id;
                                const tujuanNames = surat.tujuanUserIds.map(id => props.allUsers.find(u => u.id === id)?.nama).filter(Boolean).join(', ');
                                return (
                                <tr key={surat.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{surat.nomorSurat}</td>
                                    <td className="px-6 py-4 max-w-xs truncate">{surat.perihal}</td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={tujuanNames}>{tujuanNames}</td>
                                    <td className="px-6 py-4">{new Date(surat.tanggal).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{getSifatBadge(surat.sifat)}</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => handleOpenDetail(surat)} className="font-medium text-blue-600 hover:text-blue-800">Detail</button>
                                        <button onClick={() => handleOpenEdit(surat)} className="font-medium text-amber-600 hover:text-amber-800 disabled:text-slate-400 disabled:cursor-not-allowed" disabled={!canEdit}>Edit</button>
                                        <button onClick={() => handleOpenArchive(surat.id)} className="font-medium text-emerald-600 hover:text-emerald-800">Arsip</button>
                                    </td>
                                </tr>
                                )}
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SuratFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                tipe={TipeSurat.NOTA_DINAS}
                kategoriList={props.kategoriList}
                unitKerjaList={props.unitKerjaList}
                currentUser={props.currentUser}
                // FIX: Pass `allUsers` prop to SuratFormModal for selecting recipients.
                allUsers={props.allUsers}
                suratToEdit={suratToEdit}
            />

            {selectedSurat && (
                <SuratDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setDetailModalOpen(false)}
                    surat={selectedSurat}
                    kategoriList={props.kategoriList}
                    allUsers={props.allUsers} 
                    currentUser={props.currentUser}
                    onArchive={() => handleOpenArchive(selectedSurat.id)}
                    onAddDisposisi={() => {}} // Not applicable
                    onUpdateDisposisiStatus={() => {}} // Not applicable
                    onTambahTandaTangan={() => {}} // Not applicable
                    onAddKomentar={props.onAddKomentar}
                    onReplyWithAI={() => {}} // Not applicable
                    kopSuratSettings={props.kopSuratSettings}
                    // FIX: Pass the required `appSettings` prop.
                    appSettings={props.appSettings}
                    allSurat={[]}
                    unitKerjaList={props.unitKerjaList}
                    onAddTask={props.onAddTask}
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

export default NotaDinasComponent;
