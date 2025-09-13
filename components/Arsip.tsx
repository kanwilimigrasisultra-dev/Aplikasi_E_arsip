import React, { useState, useEffect } from 'react';
import { AnySurat, FolderArsip, TipeSurat, KategoriSurat, SifatSurat, User } from '../types';
import { FolderIcon, PlusIcon, SearchIcon, PaperClipIcon } from './icons';
import Modal from './Modal';
import FileViewerModal from './FileViewerModal';

// Debounce hook to delay processing of search input
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

interface ArsipProps {
    suratList: AnySurat[];
    folders: FolderArsip[];
    kategoriList: KategoriSurat[];
    currentUser: User;
    onCreateFolder: (nama: string) => void;
}

const NewFolderModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim());
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat Folder Arsip Baru">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="folderName" className="block text-sm font-medium text-slate-700">Nama Folder</label>
                    <input type="text" id="folderName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        Buat Folder
                    </button>
                </div>
            </form>
        </Modal>
    );
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

const Arsip: React.FC<ArsipProps> = ({ suratList, folders, kategoriList, currentUser, onCreateFolder }) => {
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>('folder-3'); // Default to 'Dokumen Proyek'
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [kategoriFilter, setKategoriFilter] = useState('');
    const [isViewerOpen, setViewerOpen] = useState(false);
    const [selectedSuratForView, setSelectedSuratForView] = useState<AnySurat | null>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const filteredSurat = suratList
        .filter(s => s.folderId === selectedFolderId)
        .filter(s => 
            debouncedSearchTerm === '' ||
            s.perihal.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
            s.nomorSurat.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
        .filter(s => kategoriFilter === '' || s.kategoriId === kategoriFilter);

    const handleOpenFileView = (surat: AnySurat) => {
        setSelectedSuratForView(surat);
        setViewerOpen(true);
    };

    return (
        <div className="flex h-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            {/* Folder Sidebar */}
            <div className="w-1/4 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800">Rak Arsip</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {folders.map(folder => (
                        <button key={folder.id} onClick={() => setSelectedFolderId(folder.id)} className={`w-full flex items-center p-3 my-1 rounded-lg text-left transition-colors duration-200 ${selectedFolderId === folder.id ? 'bg-slate-200 text-slate-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <FolderIcon className="w-5 h-5 mr-3 text-slate-600" />
                            <span>{folder.nama}</span>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-200">
                    <button onClick={() => setModalOpen(true)} className="w-full flex items-center justify-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Folder Baru
                    </button>
                </div>
            </div>

            {/* Surat List */}
            <div className="w-3/4 flex flex-col">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-lg font-semibold text-slate-800">{folders.find(f => f.id === selectedFolderId)?.nama || 'Pilih Folder'}</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input 
                                type="text" 
                                placeholder="Cari perihal, nomor..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                className="pl-10 pr-4 py-2 w-52 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all" 
                            />
                        </div>
                        <select
                            aria-label="Filter Kategori"
                            value={kategoriFilter}
                            onChange={(e) => setKategoriFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all text-sm text-slate-600 bg-white"
                        >
                            <option value="">Semua Kategori</option>
                            {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredSurat.length > 0 ? (
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Tipe</th>
                                        <th scope="col" className="px-6 py-3">Nomor Surat</th>
                                        <th scope="col" className="px-6 py-3">Kategori</th>
                                        <th scope="col" className="px-6 py-3">Sifat Surat</th>
                                        <th scope="col" className="px-6 py-3">Perihal</th>
                                        <th scope="col" className="px-6 py-3">Tanggal</th>
                                        <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSurat.map(surat => {
                                        const kategori = kategoriList.find(k => k.id === surat.kategoriId);
                                        return (
                                            <tr key={surat.id} className="bg-white border-b hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${surat.tipe === TipeSurat.MASUK ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
                                                        {surat.tipe === TipeSurat.MASUK ? 'Masuk' : 'Keluar'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900">{surat.nomorSurat}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                        {kategori ? kategori.nama : 'Tanpa Kategori'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{getSifatBadge(surat.sifat)}</td>
                                                <td className="px-6 py-4">{surat.perihal}</td>
                                                <td className="px-6 py-4">{new Date(surat.tanggal).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => handleOpenFileView(surat)} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                                                        <PaperClipIcon className="w-4 h-4 mr-1" /> Lihat
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <PaperClipIcon className="w-12 h-12 mx-auto text-slate-300" />
                            <p className="mt-2 text-slate-500">
                                {searchTerm || kategoriFilter ? `Tidak ada surat ditemukan dengan filter yang diterapkan.` : (selectedFolderId ? 'Folder ini kosong.' : 'Pilih folder untuk melihat arsip.')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <NewFolderModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={onCreateFolder} />
            {selectedSuratForView && (
                <FileViewerModal
                    isOpen={isViewerOpen}
                    onClose={() => setViewerOpen(false)}
                    surat={selectedSuratForView}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

export default Arsip;
