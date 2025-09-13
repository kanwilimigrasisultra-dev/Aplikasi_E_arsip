import React, { useState, useEffect } from 'react';
import { KebijakanRetensi, KategoriSurat } from '../types';
import { PlusIcon, ArchiveBoxArrowDownIcon, PencilIcon, TrashIcon } from './icons';
import Modal from './Modal';

interface ManajemenRetensiProps {
    kebijakanList: KebijakanRetensi[];
    kategoriList: KategoriSurat[];
    onCreate: (item: Omit<KebijakanRetensi, 'id'>) => void;
    onUpdate: (item: KebijakanRetensi) => void;
    onDelete: (id: string) => void;
}

const KebijakanFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: Omit<KebijakanRetensi, 'id'> | KebijakanRetensi) => void;
    itemToEdit?: KebijakanRetensi | null;
    kategoriList: KategoriSurat[];
    kebijakanList: KebijakanRetensi[];
}> = ({ isOpen, onClose, onSubmit, itemToEdit, kategoriList, kebijakanList }) => {
    const [kategoriId, setKategoriId] = useState('');
    const [masaRetensiAktif, setMasaRetensiAktif] = useState(1);
    const [masaRetensiInaktif, setMasaRetensiInaktif] = useState(5);
    const [tindakanFinal, setTindakanFinal] = useState<'Musnahkan' | 'Permanen'>('Musnahkan');
    
    // Filter out categories that already have a policy, unless we are editing it
    const availableKategori = kategoriList.filter(k => 
        !kebijakanList.some(p => p.kategoriId === k.id) || (itemToEdit && itemToEdit.kategoriId === k.id)
    );

    useEffect(() => {
        if (itemToEdit) {
            setKategoriId(itemToEdit.kategoriId);
            setMasaRetensiAktif(itemToEdit.masaRetensiAktif);
            setMasaRetensiInaktif(itemToEdit.masaRetensiInaktif);
            setTindakanFinal(itemToEdit.tindakanFinal);
        } else {
            setKategoriId(availableKategori[0]?.id || '');
            setMasaRetensiAktif(1);
            setMasaRetensiInaktif(5);
            setTindakanFinal('Musnahkan');
        }
    }, [itemToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (kategoriId) {
            const data = { kategoriId, masaRetensiAktif, masaRetensiInaktif, tindakanFinal };
            if (itemToEdit) {
                onSubmit({ ...data, id: itemToEdit.id });
            } else {
                onSubmit(data);
            }
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? 'Edit Kebijakan Retensi' : 'Tambah Kebijakan Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="kategoriId" className="block text-sm font-medium text-slate-700">Kategori Surat</label>
                    <select id="kategoriId" value={kategoriId} onChange={e => setKategoriId(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" disabled={!!itemToEdit}>
                        {itemToEdit && <option value={itemToEdit.kategoriId}>{kategoriList.find(k => k.id === itemToEdit.kategoriId)?.nama}</option>}
                        {availableKategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                    { !itemToEdit && availableKategori.length === 0 && <p className="text-xs text-amber-600 mt-1">Semua kategori sudah memiliki kebijakan.</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="masaRetensiAktif" className="block text-sm font-medium text-slate-700">Masa Retensi Aktif (Tahun)</label>
                        <input type="number" id="masaRetensiAktif" min="0" value={masaRetensiAktif} onChange={e => setMasaRetensiAktif(parseInt(e.target.value))} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
                    </div>
                    <div>
                        <label htmlFor="masaRetensiInaktif" className="block text-sm font-medium text-slate-700">Masa Retensi Inaktif (Tahun)</label>
                        <input type="number" id="masaRetensiInaktif" min="0" value={masaRetensiInaktif} onChange={e => setMasaRetensiInaktif(parseInt(e.target.value))} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Tindakan Final</label>
                    <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                            <input id="musnahkan" name="tindakanFinal" type="radio" value="Musnahkan" checked={tindakanFinal === 'Musnahkan'} onChange={() => setTindakanFinal('Musnahkan')} className="focus:ring-slate-500 h-4 w-4 text-slate-600 border-gray-300" />
                            <label htmlFor="musnahkan" className="ml-3 block text-sm font-medium text-gray-700">Musnahkan</label>
                        </div>
                        <div className="flex items-center">
                            <input id="permanen" name="tindakanFinal" type="radio" value="Permanen" checked={tindakanFinal === 'Permanen'} onChange={() => setTindakanFinal('Permanen')} className="focus:ring-slate-500 h-4 w-4 text-slate-600 border-gray-300" />
                            <label htmlFor="permanen" className="ml-3 block text-sm font-medium text-gray-700">Arsip Permanen</label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        {itemToEdit ? 'Simpan Perubahan' : 'Simpan Kebijakan'}
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

const ManajemenRetensi: React.FC<ManajemenRetensiProps> = ({ kebijakanList, kategoriList, onCreate, onUpdate, onDelete }) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<KebijakanRetensi | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleOpenAddModal = () => {
        setItemToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (item: KebijakanRetensi) => {
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

    const handleSubmit = (item: Omit<KebijakanRetensi, 'id'> | KebijakanRetensi) => {
        if ('id' in item) {
            onUpdate(item as KebijakanRetensi);
        } else {
            onCreate(item);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center">
                        <ArchiveBoxArrowDownIcon className="w-6 h-6 mr-3 text-slate-700" />
                        <h3 className="text-lg font-semibold text-slate-800">Kebijakan Retensi Arsip</h3>
                    </div>
                    <button onClick={handleOpenAddModal} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Tambah Kebijakan
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Kategori Surat</th>
                                <th scope="col" className="px-6 py-3 text-center">Retensi Aktif</th>
                                <th scope="col" className="px-6 py-3 text-center">Retensi Inaktif</th>
                                <th scope="col" className="px-6 py-3">Total Retensi</th>
                                <th scope="col" className="px-6 py-3">Tindakan Final</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kebijakanList.map(item => {
                                const kategori = kategoriList.find(k => k.id === item.kategoriId);
                                const totalRetensi = item.masaRetensiAktif + item.masaRetensiInaktif;
                                return (
                                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{kategori?.nama || 'N/A'}</td>
                                    <td className="px-6 py-4 text-center">{item.masaRetensiAktif} Tahun</td>
                                    <td className="px-6 py-4 text-center">{item.masaRetensiInaktif} Tahun</td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">{totalRetensi} Tahun</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.tindakanFinal === 'Permanen' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.tindakanFinal}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-4">
                                        <button onClick={() => handleOpenEditModal(item)} className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
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

            <KebijakanFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleSubmit}
                itemToEdit={itemToEdit}
                kategoriList={kategoriList}
                kebijakanList={kebijakanList}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Apakah Anda yakin ingin menghapus kebijakan retensi ini?`}
            />
        </div>
    );
};

export default ManajemenRetensi;
