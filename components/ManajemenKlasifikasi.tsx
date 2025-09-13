import React, { useState, useEffect } from 'react';
import { KlasifikasiSurat, MasalahUtama } from '../types';
import { PlusIcon, TagIcon, PencilIcon, TrashIcon } from './icons';
import Modal from './Modal';

interface ManajemenKlasifikasiProps {
    klasifikasiList: KlasifikasiSurat[];
    masalahUtamaList: MasalahUtama[];
    onCreateKlasifikasi: (klasifikasi: Omit<KlasifikasiSurat, 'id'>) => void;
    onUpdateKlasifikasi: (klasifikasi: KlasifikasiSurat) => void;
    onDeleteKlasifikasi: (klasifikasiId: string) => void;
}

const KlasifikasiFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (klasifikasi: Omit<KlasifikasiSurat, 'id'> | KlasifikasiSurat) => void;
    klasifikasiToEdit?: KlasifikasiSurat | null;
    masalahUtamaList: MasalahUtama[];
}> = ({ isOpen, onClose, onSubmit, klasifikasiToEdit, masalahUtamaList }) => {
    const [kode, setKode] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [masalahUtamaId, setMasalahUtamaId] = useState('');

    useEffect(() => {
        if (klasifikasiToEdit) {
            setKode(klasifikasiToEdit.kode);
            setDeskripsi(klasifikasiToEdit.deskripsi);
            setMasalahUtamaId(klasifikasiToEdit.masalahUtamaId);
        } else {
            setKode('');
            setDeskripsi('');
            setMasalahUtamaId(masalahUtamaList[0]?.id || '');
        }
    }, [klasifikasiToEdit, isOpen, masalahUtamaList]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (kode.trim() && deskripsi.trim() && masalahUtamaId) {
            const klasifikasiData = { kode, deskripsi, masalahUtamaId };
            if (klasifikasiToEdit) {
                onSubmit({ ...klasifikasiData, id: klasifikasiToEdit.id });
            } else {
                onSubmit(klasifikasiData);
            }
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={klasifikasiToEdit ? 'Edit Klasifikasi' : 'Tambah Klasifikasi Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="masalahUtamaId" className="block text-sm font-medium text-slate-700">Masalah Utama</label>
                    <select id="masalahUtamaId" value={masalahUtamaId} onChange={e => setMasalahUtamaId(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500">
                        <option value="">Pilih Masalah Utama...</option>
                        {masalahUtamaList.map(mu => <option key={mu.id} value={mu.id}>{mu.kode} - {mu.deskripsi}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="kode" className="block text-sm font-medium text-slate-700">Kode Klasifikasi</label>
                    <input type="text" id="kode" value={kode} onChange={e => setKode(e.target.value)} required placeholder="cth: PR.01.01" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div>
                    <label htmlFor="deskripsi" className="block text-sm font-medium text-slate-700">Deskripsi</label>
                    <input type="text" id="deskripsi" value={deskripsi} onChange={e => setDeskripsi(e.target.value)} required placeholder="cth: Rencana Strategis" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700">
                        {klasifikasiToEdit ? 'Simpan Perubahan' : 'Simpan Klasifikasi'}
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

const ManajemenKlasifikasi: React.FC<ManajemenKlasifikasiProps> = ({ klasifikasiList, masalahUtamaList, onCreateKlasifikasi, onUpdateKlasifikasi, onDeleteKlasifikasi }) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [klasifikasiToEdit, setKlasifikasiToEdit] = useState<KlasifikasiSurat | null>(null);
    const [klasifikasiToDelete, setKlasifikasiToDelete] = useState<string | null>(null);

    const handleOpenAddModal = () => {
        setKlasifikasiToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (klasifikasi: KlasifikasiSurat) => {
        setKlasifikasiToEdit(klasifikasi);
        setFormModalOpen(true);
    };

    const handleOpenDeleteModal = (klasifikasiId: string) => {
        setKlasifikasiToDelete(klasifikasiId);
        setConfirmModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (klasifikasiToDelete) {
            onDeleteKlasifikasi(klasifikasiToDelete);
            setConfirmModalOpen(false);
            setKlasifikasiToDelete(null);
        }
    }

    const handleSubmitKlasifikasi = (klasifikasi: Omit<KlasifikasiSurat, 'id'> | KlasifikasiSurat) => {
        if ('id' in klasifikasi) {
            onUpdateKlasifikasi(klasifikasi as KlasifikasiSurat);
        } else {
            onCreateKlasifikasi(klasifikasi);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center">
                        <TagIcon className="w-6 h-6 mr-3 text-sky-700" />
                        <h3 className="text-lg font-semibold text-slate-800">Daftar Kode Klasifikasi Surat</h3>
                    </div>
                    <button onClick={handleOpenAddModal} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Tambah Klasifikasi
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Masalah Utama</th>
                                <th scope="col" className="px-6 py-3">Kode Klasifikasi</th>
                                <th scope="col" className="px-6 py-3">Deskripsi</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {klasifikasiList.map(item => {
                                const masalahUtama = masalahUtamaList.find(m => m.id === item.masalahUtamaId);
                                return (
                                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                     <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                          {masalahUtama?.kode || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.kode}</td>
                                    <td className="px-6 py-4">{item.deskripsi}</td>
                                    <td className="px-6 py-4 text-center space-x-4">
                                        <button onClick={() => handleOpenEditModal(item)} className="font-medium text-sky-600 hover:text-sky-800 transition-colors">
                                            <PencilIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(item.id)} className="font-medium text-red-600 hover:text-red-800 transition-colors">
                                            <TrashIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <KlasifikasiFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleSubmitKlasifikasi}
                klasifikasiToEdit={klasifikasiToEdit}
                masalahUtamaList={masalahUtamaList}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Apakah Anda yakin ingin menghapus kode klasifikasi ini? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    );
};

export default ManajemenKlasifikasi;