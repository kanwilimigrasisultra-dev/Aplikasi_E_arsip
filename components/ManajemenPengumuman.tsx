import React, { useState, useEffect } from 'react';
import { Pengumuman, User } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';

interface ManajemenPengumumanProps {
    pengumumanList: Pengumuman[];
    onSubmit: (item: Omit<Pengumuman, 'id' | 'pembuat' | 'timestamp' | 'isActive'> | Pengumuman) => void;
    onDelete: (id: string) => void;
    currentUser: User;
}

const PengumumanFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: Omit<Pengumuman, 'id' | 'pembuat' | 'timestamp' | 'isActive'> | Pengumuman) => void;
    itemToEdit?: Pengumuman | null;
}> = ({ isOpen, onClose, onSubmit, itemToEdit }) => {
    
    const getInitialState = () => ({
        teks: '',
        tanggalMulai: new Date().toISOString().split('T')[0],
        tanggalSelesai: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Default to 7 days from now
    });

    const [formState, setFormState] = useState(getInitialState());

    useEffect(() => {
        if (itemToEdit) {
            setFormState({
                teks: itemToEdit.teks,
                tanggalMulai: itemToEdit.tanggalMulai,
                tanggalSelesai: itemToEdit.tanggalSelesai,
            });
        } else {
            setFormState(getInitialState());
        }
    }, [itemToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.teks.trim() && formState.tanggalMulai && formState.tanggalSelesai) {
            if (itemToEdit) {
                onSubmit({ ...itemToEdit, ...formState });
            } else {
                onSubmit(formState);
            }
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Teks Pengumuman</label>
                    <textarea name="teks" value={formState.teks} onChange={handleChange} rows={4} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Tuliskan informasi yang ingin disampaikan..."></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tanggal Mulai Tayang</label>
                        <input type="date" name="tanggalMulai" value={formState.tanggalMulai} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tanggal Selesai Tayang</label>
                        <input type="date" name="tanggalSelesai" value={formState.tanggalSelesai} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        {itemToEdit ? 'Simpan Perubahan' : 'Simpan Pengumuman'}
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


const ManajemenPengumuman: React.FC<ManajemenPengumumanProps> = ({ pengumumanList, onSubmit, onDelete, currentUser }) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<Pengumuman | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleOpenAddModal = () => {
        setItemToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (item: Pengumuman) => {
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
    };
    
    const handleToggleActive = (item: Pengumuman) => {
        onSubmit({ ...item, isActive: !item.isActive });
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center">
                        <MegaphoneIcon className="w-6 h-6 mr-3 text-slate-700" />
                        <h3 className="text-lg font-semibold text-slate-800">Daftar Pengumuman</h3>
                    </div>
                    <button onClick={handleOpenAddModal} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Buat Pengumuman
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Teks Pengumuman</th>
                                <th scope="col" className="px-6 py-3">Periode Tayang</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pengumumanList.map(item => {
                                const now = new Date();
                                const endDate = new Date(item.tanggalSelesai);
                                endDate.setHours(23, 59, 59, 999);
                                const isExpired = now > endDate;
                                const statusText = isExpired ? 'Kedaluwarsa' : (item.isActive ? 'Aktif' : 'Nonaktif');
                                const statusColor = isExpired ? 'bg-slate-100 text-slate-800' : (item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800');

                                return (
                                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 max-w-md">
                                        <p className="truncate" title={item.teks}>{item.teks}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(item.tanggalMulai).toLocaleDateString()} - {new Date(item.tanggalSelesai).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{statusText}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => handleOpenEditModal(item)} className="font-medium text-blue-600 hover:text-blue-800">
                                            <PencilIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                        <button onClick={() => handleToggleActive(item)} className={`font-medium px-2 py-1 text-xs rounded ${item.isActive ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`} title={item.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                                            {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(item.id)} className="font-medium text-red-600 hover:text-red-800">
                                            <TrashIcon className="w-5 h-5 inline-block" />
                                        </button>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <PengumumanFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={onSubmit}
                itemToEdit={itemToEdit}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Hapus Pengumuman"
                message="Apakah Anda yakin ingin menghapus pengumuman ini secara permanen? Tindakan ini tidak dapat dibatalkan."
            />
        </div>
    );
};

export default ManajemenPengumuman;