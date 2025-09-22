import React, { useState, useEffect } from 'react';
import { TemplateSurat, KategoriSurat, MasalahUtama, SifatSurat } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ClipboardListIcon } from './icons';
import Modal from './Modal';
import RichTextEditor from './RichTextEditor';

interface ManajemenTemplateProps {
    templateList: TemplateSurat[];
    kategoriList: KategoriSurat[];
    masalahUtamaList: MasalahUtama[];
    onSubmit: (template: Omit<TemplateSurat, 'id'> | TemplateSurat) => void;
    onDelete: (id: string) => void;
}

const TemplateFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (template: Omit<TemplateSurat, 'id'> | TemplateSurat) => void;
    itemToEdit?: TemplateSurat | null;
    kategoriList: KategoriSurat[];
    masalahUtamaList: MasalahUtama[];
}> = ({ isOpen, onClose, onSubmit, itemToEdit, kategoriList, masalahUtamaList }) => {
    
    const getInitialState = () => ({
        nama: '',
        perihal: '',
        kategoriId: kategoriList[0]?.id || '',
        sifat: SifatSurat.BIASA,
        jenisSuratKeluar: 'Biasa' as 'Biasa' | 'SK' | 'SPPD',
        masalahUtamaId: masalahUtamaList[0]?.id || '',
        ringkasan: '',
    });

    const [formState, setFormState] = useState(getInitialState());

    useEffect(() => {
        if (itemToEdit) {
            setFormState({
                nama: itemToEdit.nama,
                perihal: itemToEdit.perihal,
                kategoriId: itemToEdit.kategoriId,
                sifat: itemToEdit.sifat,
                jenisSuratKeluar: itemToEdit.jenisSuratKeluar,
                masalahUtamaId: itemToEdit.masalahUtamaId,
                ringkasan: itemToEdit.ringkasan,
            });
        } else {
            // Check if lists are available before accessing index 0
            setFormState({
                nama: '',
                perihal: '',
                kategoriId: kategoriList.length > 0 ? kategoriList[0].id : '',
                sifat: SifatSurat.BIASA,
                jenisSuratKeluar: 'Biasa' as 'Biasa' | 'SK' | 'SPPD',
                masalahUtamaId: masalahUtamaList.length > 0 ? masalahUtamaList[0].id : '',
                ringkasan: '',
            });
        }
    }, [itemToEdit, isOpen, kategoriList, masalahUtamaList]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleRingkasanChange = (html: string) => {
        setFormState(prev => ({ ...prev, ringkasan: html }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.nama.trim() && formState.perihal.trim()) {
            if (itemToEdit) {
                onSubmit({ ...itemToEdit, ...formState });
            } else {
                onSubmit(formState);
            }
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={itemToEdit ? 'Edit Template Surat' : 'Buat Template Baru'} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nama Template</label>
                        <input type="text" name="nama" value={formState.nama} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Perihal Surat</label>
                        <input type="text" name="perihal" value={formState.perihal} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Kategori</label>
                        <select name="kategoriId" value={formState.kategoriId} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Sifat Surat</label>
                        <select name="sifat" value={formState.sifat} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                           {Object.values(SifatSurat).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Jenis Surat Keluar</label>
                        <select name="jenisSuratKeluar" value={formState.jenisSuratKeluar} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                           <option value="Biasa">Biasa</option>
                           <option value="SK">Surat Keputusan (SK)</option>
                           <option value="SPPD">Surat Perintah Perjalanan Dinas (SPPD)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Masalah Utama</label>
                        <select name="masalahUtamaId" value={formState.masalahUtamaId} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            {masalahUtamaList.map(m => <option key={m.id} value={m.id}>{m.kode} - {m.deskripsi}</option>)}
                        </select>
                    </div>
                 </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Konten Template</label>
                    <RichTextEditor value={formState.ringkasan} onChange={handleRingkasanChange} />
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        {itemToEdit ? 'Simpan Perubahan' : 'Simpan Template'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const ManajemenTemplate: React.FC<ManajemenTemplateProps> = ({ templateList, kategoriList, masalahUtamaList, onSubmit, onDelete }) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<TemplateSurat | null>(null);
    // Confirmation modal state could be added here if needed

    const handleOpenAddModal = () => {
        setItemToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (item: TemplateSurat) => {
        setItemToEdit(item);
        setFormModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center">
                        <ClipboardListIcon className="w-6 h-6 mr-3 text-slate-700" />
                        <h3 className="text-lg font-semibold text-slate-800">Manajemen Template Surat</h3>
                    </div>
                    <button onClick={handleOpenAddModal} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Tambah Template
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Template</th>
                                <th scope="col" className="px-6 py-3">Perihal</th>
                                <th scope="col" className="px-6 py-3">Jenis</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templateList.map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.nama}</td>
                                    <td className="px-6 py-4">{item.perihal}</td>
                                    <td className="px-6 py-4">{item.jenisSuratKeluar}</td>
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

            <TemplateFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={onSubmit}
                itemToEdit={itemToEdit}
                kategoriList={kategoriList}
                masalahUtamaList={masalahUtamaList}
            />
        </div>
    );
};

export default ManajemenTemplate;
