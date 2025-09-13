import React, { useState, useEffect } from 'react';
import { KategoriSurat } from '../types';
import { PlusIcon, TagIcon, PencilIcon, TrashIcon } from './icons';
import Modal from './Modal';

interface ManajemenKategoriProps {
    kategoriList: KategoriSurat[];
    onCreateKategori: (kategori: Omit<KategoriSurat, 'id'>) => void;
    onUpdateKategori: (kategori: KategoriSurat) => void;
    onDeleteKategori: (kategoriId: string) => void;
}

const KategoriFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (kategori: Omit<KategoriSurat, 'id'> | KategoriSurat) => void;
    kategoriToEdit?: KategoriSurat | null;
}> = ({ isOpen, onClose, onSubmit, kategoriToEdit }) => {
    const [nama, setNama] = useState('');

    useEffect(() => {
        if (kategoriToEdit) {
            setNama(kategoriToEdit.nama);
        } else {
            setNama('');
        }
    }, [kategoriToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nama.trim()) {
            const kategoriData = { nama };
            if (kategoriToEdit) {
                onSubmit({ ...kategoriData, id: kategoriToEdit.id });
            } else {
                onSubmit(kategoriData);
            }
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={kategoriToEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="nama" className="block text-sm font-medium text-slate-700">Nama Kategori</label>
                    <input type="text" id="nama" value={nama} onChange={e => setNama(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700">
                        {kategoriToEdit ? 'Simpan Perubahan' : 'Simpan Kategori'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">{message}</p>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="button" onClick={onConfirm} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                        Hapus
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const ManajemenKategori: React.FC<ManajemenKategoriProps> = ({ kategoriList, onCreateKategori, onUpdateKategori, onDeleteKategori }) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [kategoriToEdit, setKategoriToEdit] = useState<KategoriSurat | null>(null);
    const [kategoriToDelete, setKategoriToDelete] = useState<string | null>(null);

    const handleOpenAddModal = () => {
        setKategoriToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (kategori: KategoriSurat) => {
        setKategoriToEdit(kategori);
        setFormModalOpen(true);
    };

    const handleOpenDeleteModal = (kategoriId: string) => {
        setKategoriToDelete(kategoriId);
        setConfirmModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (kategoriToDelete) {
            onDeleteKategori(kategoriToDelete);
            setConfirmModalOpen(false);
            setKategoriToDelete(null);
        }
    }

    const handleSubmitKategori = (kategori: Omit<KategoriSurat, 'id'> | KategoriSurat) => {
        if ('id' in kategori) {
            onUpdateKategori(kategori as KategoriSurat);
        } else {
            onCreateKategori(kategori);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center">
                        <TagIcon className="w-6 h-6 mr-3 text-sky-700" />
                        <h3 className="text-lg font-semibold text-slate-800">Daftar Kategori Surat</h3>
                    </div>
                    <button onClick={handleOpenAddModal} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Tambah Kategori
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Kategori</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kategoriList.map(kategori => (
                                <tr key={kategori.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{kategori.nama}</td>
                                    <td className="px-6 py-4 text-center space-x-4">
                                        <button onClick={() => handleOpenEditModal(kategori)} className="font-medium text-sky-600 hover:text-sky-800 transition-colors">
                                            <PencilIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(kategori.id)} className="font-medium text-red-600 hover:text-red-800 transition-colors">
                                            <TrashIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <KategoriFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleSubmitKategori}
                kategoriToEdit={kategoriToEdit}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    );
};

export default ManajemenKategori;