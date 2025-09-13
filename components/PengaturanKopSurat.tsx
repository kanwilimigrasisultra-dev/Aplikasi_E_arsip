

import React, { useState, useEffect } from 'react';
import { KopSuratSettings } from '../types';
import { ClipboardListIcon, CheckCircleIcon, OfficeBuildingIcon } from './icons';

interface PengaturanKopSuratProps {
    settings: KopSuratSettings;
    onSave: (newSettings: KopSuratSettings) => void;
}

const PengaturanKopSurat: React.FC<PengaturanKopSuratProps> = ({ settings, onSave }) => {
    const [formState, setFormState] = useState<KopSuratSettings>(settings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormState(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000); // Hide notification after 3s
    };

    return (
         <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center mb-4">
                <ClipboardListIcon className="w-6 h-6 mr-3 text-sky-700" />
                <h3 className="text-lg font-semibold text-slate-800">Pengaturan Kop Surat Global</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">Pengaturan ini berlaku untuk semua unit kerja. Detail spesifik seperti alamat dan kontak diatur di menu Administrasi &gt; Manajemen Unit Kerja.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <h4 className="font-medium text-slate-700">Pratinjau Logo</h4>
                        <p className="text-sm text-slate-500">Logo akan tampil di sini.</p>
                        <div className="mt-2 p-2 border rounded-md bg-slate-50 flex items-center justify-center h-24">
                            {formState.logoUrl ? (
                                <img src={formState.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <OfficeBuildingIcon className="w-8 h-8 mx-auto" />
                                    <p className="text-xs mt-1">Logo belum diunggah</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Lampirkan File Logo</label>
                         <div className="mt-1 flex items-center">
                            <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                                <span>Pilih File</span>
                                <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                            </label>
                             <span className="ml-3 text-sm text-slate-500">
                                {formState.logoUrl ? 'Ganti logo saat ini' : 'Pilih file gambar untuk logo.'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <h4 className="font-medium text-slate-700">Nama Instansi Global</h4>
                            <p className="text-sm text-slate-500">Isi nama kementerian dan direktorat.</p>
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            <div>
                                <label htmlFor="namaKementerian" className="block text-sm font-medium text-slate-700">Baris 1 (Kementerian)</label>
                                <input type="text" name="namaKementerian" id="namaKementerian" value={formState.namaKementerian} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                            </div>
                             <div>
                                <label htmlFor="namaDirektorat" className="block text-sm font-medium text-slate-700">Baris 2 (Direktorat)</label>
                                <input type="text" name="namaDirektorat" id="namaDirektorat" value={formState.namaDirektorat} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <div className="flex items-center space-x-4">
                         {isSaved && (
                            <div className="flex items-center text-sm text-emerald-600 transition-opacity duration-300">
                                <CheckCircleIcon className="w-5 h-5 mr-1"/>
                                <span>Tersimpan!</span>
                            </div>
                        )}
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PengaturanKopSurat;