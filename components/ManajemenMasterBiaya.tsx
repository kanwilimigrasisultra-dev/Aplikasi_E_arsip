import React, { useState, useEffect } from 'react';
import { MasterBiaya } from '../types';
import { PlusIcon, GlobeAltIcon, PencilIcon, TrashIcon } from './icons';
import Modal from './Modal';

interface ManajemenMasterBiayaProps {
    masterBiayaList: MasterBiaya[];
    onCreate: (item: Omit<MasterBiaya, 'id'>) => void;
    onUpdate: (item: MasterBiaya) => void;
    onDelete: (id: string) => void;
}

const MasterBiayaFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: Omit<MasterBiaya, 'id'> | MasterBiaya) => void;
    itemToEdit?: MasterBiaya | null;
}> = ({ isOpen, onClose, onSubmit, itemToEdit }) => {
    const [namaBiaya, setNamaBiaya] = useState('');
    const [satuan, setSatuan] = useState('');
    const [tarifDefault, setTarifDefault] = useState(0);

    useEffect(() => {
        if (itemToEdit) {
            setNamaBiaya(itemToEdit.namaBiaya);
            setSatuan(itemToEdit.satuan);
            setTarifDefault(itemToEdit.tarifDefault);
        } else {
            setNamaBiaya('');
            setSatuan('');
            setTarifDefault(0);
        }
    }, [itemToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (namaBiaya.trim() && satuan.trim()) {
            const data = { namaBiaya, satuan, tarifDefault };
            if (itemToEdit) {
                onSubmit({ ...data, id: itemToEdit.id });
            } else {
                onSubmit(data);
            }
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? 'Edit Master Biaya' : 'Tambah Master Biaya Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Nama Komponen Biaya</label>
                    <input type="text" value={namaBiaya} onChange={e => setNamaBiaya(e.target.value)} required placeholder="cth: Uang Harian Gol. III" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="block text-sm font-medium text-slate-700">Satuan</label>
                         <input type="text" value={satuan} onChange={e => setSatuan(e.target.value)} required placeholder="cth: Hari, Malam, Tiket" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700">Tarif Default (Rp)</label>
                         <input type="number" value={tarifDefault} onChange={e => setTarifDefault(Number(e.target.value))} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
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


const ManajemenMasterBiaya: React.FC<ManajemenMasterBiayaProps> = ({ masterBiayaList, onCreate, onUpdate, onDelete }) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<MasterBiaya | null>(null);

    const handleOpenAddModal = () => {
        setItemToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (item: MasterBiaya) => {
        setItemToEdit(item);
        setFormModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center">
                        <GlobeAltIcon className="w-6 h-6 mr-3 text-slate-700" />
                        <h3 className="text-lg font-semibold text-slate-800">Master Biaya Perjalanan Dinas</h3>
                    </div>
                    <button onClick={handleOpenAddModal} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Tambah Komponen Biaya
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Biaya</th>
                                <th scope="col" className="px-6 py-3">Satuan</th>
                                <th scope="col" className="px-6 py-3">Tarif Default</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {masterBiayaList.map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.namaBiaya}</td>
                                    <td className="px-6 py-4">{item.satuan}</td>
                                    <td className="px-6 py-4">{item.tarifDefault.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                    <td className="px-6 py-4 text-center space-x-4">
                                        <button onClick={() => handleOpenEditModal(item)} className="font-medium text-blue-600 hover:text-blue-800">
                                            <PencilIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                        <button onClick={() => onDelete(item.id)} className="font-medium text-red-600 hover:text-red-800">
                                            <TrashIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <MasterBiayaFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={itemToEdit ? onUpdate : onCreate}
                itemToEdit={itemToEdit}
            />
        </div>
    );
};

export default ManajemenMasterBiaya;
