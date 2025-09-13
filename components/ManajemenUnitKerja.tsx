import React, { useState, useEffect } from 'react';
import { UnitKerja } from '../types';
import { PlusIcon, OfficeBuildingIcon, PencilIcon, TrashIcon } from './icons';
import Modal from './Modal';

interface ManajemenUnitKerjaProps {
    unitKerjaList: UnitKerja[];
    onCreateUnitKerja: (unit: Omit<UnitKerja, 'id'>) => void;
    onUpdateUnitKerja: (unit: UnitKerja) => void;
    onDeleteUnitKerja: (unitId: string) => void;
    initialFilterId?: string | null;
}

const UnitKerjaFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (unit: Omit<UnitKerja, 'id'> | UnitKerja) => void;
    unitToEdit?: UnitKerja | null;
    unitKerjaList: UnitKerja[];
}> = ({ isOpen, onClose, onSubmit, unitToEdit, unitKerjaList }) => {
    const [nama, setNama] = useState('');
    const [kode, setKode] = useState('');
    const [tipe, setTipe] = useState<'Pusat' | 'Cabang'>('Cabang');
    const [indukId, setIndukId] = useState<string | undefined>('');
    const [alamat, setAlamat] = useState('');
    const [kontak, setKontak] = useState('');
    const [website, setWebsite] = useState('');

    useEffect(() => {
        if (unitToEdit) {
            setNama(unitToEdit.nama);
            setKode(unitToEdit.kode);
            setTipe(unitToEdit.tipe);
            setIndukId(unitToEdit.indukId);
            setAlamat(unitToEdit.alamat);
            setKontak(unitToEdit.kontak);
            setWebsite(unitToEdit.website);
        } else {
            setNama('');
            setKode('');
            setTipe('Cabang');
            setIndukId('');
            setAlamat('');
            setKontak('');
            setWebsite('');
        }
    }, [unitToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nama.trim() && kode.trim()) {
            const unitData = { 
                nama, 
                kode: kode.trim().toUpperCase(),
                tipe, 
                indukId: tipe === 'Cabang' ? indukId : undefined,
                alamat,
                kontak,
                website
            };
            if (unitToEdit) {
                onSubmit({ ...unitData, id: unitToEdit.id });
            } else {
                onSubmit(unitData);
            }
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={unitToEdit ? 'Edit Unit Kerja' : 'Tambah Unit Kerja Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-slate-700">Nama Unit Kerja</label>
                        <input type="text" id="nama" value={nama} onChange={e => setNama(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    <div>
                        <label htmlFor="kode" className="block text-sm font-medium text-slate-700">Kode Unit</label>
                        <input type="text" id="kode" value={kode} onChange={e => setKode(e.target.value)} required placeholder="cth: WIM.27" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                </div>
                <div>
                    <label htmlFor="tipe" className="block text-sm font-medium text-slate-700">Tipe Unit</label>
                    <select id="tipe" value={tipe} onChange={e => setTipe(e.target.value as 'Pusat' | 'Cabang')} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                        <option value="Pusat">Pusat / Wilayah</option>
                        <option value="Cabang">Cabang / Unit</option>
                    </select>
                </div>
                {tipe === 'Cabang' && (
                    <div>
                        <label htmlFor="indukId" className="block text-sm font-medium text-slate-700">Unit Induk (Wilayah)</label>
                        <select id="indukId" value={indukId} onChange={e => setIndukId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                            <option value="">Pilih Unit Induk</option>
                            {unitKerjaList.filter(u => u.tipe === 'Pusat').map(unit => (
                                <option key={unit.id} value={unit.id}>{unit.nama}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="border-t pt-4 space-y-4">
                     <div>
                        <label htmlFor="alamat" className="block text-sm font-medium text-slate-700">Alamat</label>
                        <input type="text" id="alamat" value={alamat} onChange={e => setAlamat(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                     <div>
                        <label htmlFor="website" className="block text-sm font-medium text-slate-700">Website</label>
                        <input type="text" id="website" value={website} onChange={e => setWebsite(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                     <div>
                        <label htmlFor="kontak" className="block text-sm font-medium text-slate-700">Kontak (Email/Telepon)</label>
                        <input type="text" id="kontak" value={kontak} onChange={e => setKontak(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700">
                        {unitToEdit ? 'Simpan Perubahan' : 'Simpan Unit Kerja'}
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

const ManajemenUnitKerja: React.FC<ManajemenUnitKerjaProps> = ({ unitKerjaList, onCreateUnitKerja, onUpdateUnitKerja, onDeleteUnitKerja, initialFilterId }) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [unitToEdit, setUnitToEdit] = useState<UnitKerja | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
    const [filterId, setFilterId] = useState(initialFilterId);

    useEffect(() => {
        setFilterId(initialFilterId);
    }, [initialFilterId]);

    const handleOpenAddModal = () => {
        setUnitToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (unit: UnitKerja) => {
        setUnitToEdit(unit);
        setFormModalOpen(true);
    };

    const handleOpenDeleteModal = (unitId: string) => {
        setUnitToDelete(unitId);
        setConfirmModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (unitToDelete) {
            onDeleteUnitKerja(unitToDelete);
            setConfirmModalOpen(false);
            setUnitToDelete(null);
        }
    }

    const handleSubmitUnitKerja = (unit: Omit<UnitKerja, 'id'> | UnitKerja) => {
        if ('id' in unit) {
            onUpdateUnitKerja(unit as UnitKerja);
        } else {
            onCreateUnitKerja(unit);
        }
    };

    const getIndukName = (indukId?: string) => {
        if (!indukId) return '-';
        return unitKerjaList.find(u => u.id === indukId)?.nama || 'Tidak Ditemukan';
    }
    
    const displayedUnits = unitKerjaList.filter(unit => !filterId || unit.id === filterId);
    const filteredUnitName = filterId ? unitKerjaList.find(u => u.id === filterId)?.nama : null;

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                    <div className="flex items-center">
                        <OfficeBuildingIcon className="w-6 h-6 mr-3 text-sky-700" />
                        <div>
                             <h3 className="text-lg font-semibold text-slate-800">
                                {filterId ? 'Menampilkan Unit Kerja Terfilter' : 'Daftar Unit Kerja'}
                            </h3>
                            {filteredUnitName && (
                                <p className="text-sm text-slate-500">
                                    Hanya menampilkan: <span className="font-semibold">{filteredUnitName}</span>
                                </p>
                            )}
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        {filterId && (
                            <button 
                                onClick={() => setFilterId(null)} 
                                className="flex items-center bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors shadow-sm text-sm font-medium"
                            >
                                Hapus Filter
                            </button>
                        )}
                        <button onClick={handleOpenAddModal} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors shadow">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Tambah Unit Kerja
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Unit</th>
                                <th scope="col" className="px-6 py-3">Kode</th>
                                <th scope="col" className="px-6 py-3">Tipe</th>
                                <th scope="col" className="px-6 py-3">Unit Induk</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedUnits.map(unit => (
                                <tr key={unit.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{unit.nama}</td>
                                    <td className="px-6 py-4 font-mono text-slate-700">{unit.kode}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${unit.tipe === 'Pusat' ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'}`}>
                                            {unit.tipe}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{getIndukName(unit.indukId)}</td>
                                    <td className="px-6 py-4 text-center space-x-4">
                                        <button onClick={() => handleOpenEditModal(unit)} className="font-medium text-sky-600 hover:text-sky-800 transition-colors">
                                            <PencilIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(unit.id)} className="font-medium text-red-600 hover:text-red-800 transition-colors">
                                            <TrashIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UnitKerjaFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleSubmitUnitKerja}
                unitToEdit={unitToEdit}
                unitKerjaList={unitKerjaList}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Apakah Anda yakin ingin menghapus unit kerja ini? Pastikan tidak ada pengguna yang terikat dengan unit ini sebelum menghapus.`}
            />
        </div>
    );
};

export default ManajemenUnitKerja;