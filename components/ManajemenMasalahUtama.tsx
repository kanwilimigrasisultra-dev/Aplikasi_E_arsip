import React, { useState, useEffect } from 'react';
import { MasalahUtama } from '../types';
import { PlusIcon, TagIcon, PencilIcon, TrashIcon } from './icons';
import Modal from './Modal';

interface ManajemenMasalahUtamaProps {
    masalahUtamaList: MasalahUtama[];
    onCreate: (item: Omit<MasalahUtama, 'id'>) => void;
    onUpdate: (item: MasalahUtama) => void;
    onDelete: (id: string) => void;
}

const MasalahUtamaFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: Omit<MasalahUtama, 'id'> | MasalahUtama) => void;
    itemToEdit?: MasalahUtama | null;
}> = ({ isOpen, onClose, onSubmit, itemToEdit }) => {
    const [kode, setKode] = useState('');
    const [deskripsi, setDeskripsi] = useState('');

    useEffect(() => {
        if (itemToEdit) {
            setKode(itemToEdit.kode);
            setDeskripsi(itemToEdit.deskripsi);
        } else {
            setKode('');
            setDeskripsi('');
        }
    }, [itemToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (kode.trim() && deskripsi.trim()) {
            const data = { kode: kode.trim().toUpperCase(), deskripsi };
            if (itemToEdit) {
                onSubmit({ ...data, id: itemToEdit.id });
            } else {
                onSubmit(data);
            }
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? 'Edit Masalah Utama' : 'Tambah Masalah Utama Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="kode" className="block text-sm font-medium text-slate-700">Kode Masalah</label>
                    <input type="text" id="kode" value={kode} onChange={e => setKode(e.target.value)} required placeholder="cth: PR" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
                </div>
                 <div>
                    <label htmlFor="deskripsi" className="block text-sm font-medium text-slate-700">Deskripsi</label>
                    <input type="text" id="deskripsi" value={deskripsi} onChange={e => setDeskripsi(e.target.value)} required placeholder="cth: Perencanaan" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        {itemToEdit ? 'Simpan Perubahan' : 'Simpan'}
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

const ManajemenMasalahUtama: React.FC<ManajemenMasalahUtamaProps> = ({ masalahUtamaList, onCreate, onUpdate, onDelete }) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<MasalahUtama | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleOpenAddModal = () => {
        setItemToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (item: MasalahUtama) => {
        setItemToEdit(item);
        setFormModalOpen(true);
    };

    const handleOpenDeleteModal = (id: string) => {
        setItemToDelete(id);
        setConfirmModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onDelete(itemToDelete);
            setConfirmModalOpen(false);
            setItemToDelete(null);
        }
    }

    const handleSubmit = (item: Omit<MasalahUtama, 'id'> | MasalahUtama) => {
        if ('id' in item) {
            onUpdate(item as MasalahUtama);
        } else {
            onCreate(item);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center">
                        <TagIcon className="w-6 h-6 mr-3 text-slate-700" />
                        <h3 className="text-lg font-semibold text-slate-800">Daftar Masalah Utama (Fasilitatif/Substantif)</h3>
                    </div>
                    <button onClick={handleOpenAddModal} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Tambah Masalah Utama
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Kode</th>
                                <th scope="col" className="px-6 py-3">Deskripsi</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {masalahUtamaList.map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 font-mono">{item.kode}</td>
                                    <td className="px-6 py-4">{item.deskripsi}</td>
                                    <td className="px-6 py-4 text-center space-x-4">
                                        <button onClick={() => handleOpenEditModal(item)} className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                            <PencilIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(item.id)} className="font-medium text-red-600 hover:text-red-800 transition-colors">
                                            <TrashIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <MasalahUtamaFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleSubmit}
                itemToEdit={itemToEdit}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Apakah Anda yakin ingin menghapus masalah utama ini? Menghapus ini akan mempengaruhi klasifikasi arsip yang terkait.`}
            />
        </div>
    );
};

export default ManajemenMasalahUtama;