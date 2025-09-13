
import React, { useState, useEffect } from 'react';
import { BrandingSettings } from '../types';
import { CheckCircleIcon, OfficeBuildingIcon, PaperClipIcon } from './icons';

interface PengaturanBrandingProps {
    settings: BrandingSettings;
    onSave: (newSettings: BrandingSettings) => void;
}

const PengaturanBranding: React.FC<PengaturanBrandingProps> = ({ settings, onSave }) => {
    const [formState, setFormState] = useState<BrandingSettings>(settings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormState(settings);
    }, [settings]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof BrandingSettings) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState(prev => ({ ...prev, [key]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const LogoInput: React.FC<{
      logoKey: keyof BrandingSettings;
      label: string;
      description: string;
    }> = ({ logoKey, label, description }) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-b border-slate-100 last:border-b-0">
            <div className="md:col-span-1">
                <h4 className="font-medium text-slate-700">{label}</h4>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
                 <div className="w-24 h-24 p-2 border rounded-md bg-slate-50 flex items-center justify-center">
                    {formState[logoKey] ? (
                        <img src={formState[logoKey]} alt={`${label} Preview`} className="max-h-full max-w-full object-contain" />
                    ) : (
                        <div className="text-center text-slate-400">
                            <OfficeBuildingIcon className="w-8 h-8 mx-auto" />
                            <p className="text-xs mt-1">Logo</p>
                        </div>
                    )}
                </div>
                <label htmlFor={`${logoKey}-upload`} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                    <PaperClipIcon className="w-4 h-4 mr-2 inline-block" />
                    <span>{formState[logoKey] ? 'Ganti Logo' : 'Pilih File'}</span>
                    <input id={`${logoKey}-upload`} name={`${logoKey}-upload`} type="file" className="sr-only" onChange={(e) => handleFileChange(e, logoKey)} accept="image/*" />
                </label>
            </div>
        </div>
    );

    return (
         <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Pengaturan Branding & Logo</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <LogoInput 
                    logoKey="appLogoUrl" 
                    label="Logo Aplikasi (Sidebar)" 
                    description="Logo ini akan muncul di pojok kiri atas menggantikan tulisan 'STAR E-ARSIM SULTRA'. Ukuran rekomendasi: 128x32 piksel." 
                />
                <LogoInput 
                    logoKey="loginLogo1Url" 
                    label="Logo Halaman Login 1" 
                    description="Logo pertama yang tampil di halaman login." 
                />
                 <LogoInput 
                    logoKey="loginLogo2Url" 
                    label="Logo Halaman Login 2" 
                    description="Logo kedua yang tampil di halaman login." 
                />
                 <LogoInput 
                    logoKey="loginLogo3Url" 
                    label="Logo Halaman Login 3" 
                    description="Logo ketiga yang tampil di halaman login." 
                />

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

export default PengaturanBranding;
