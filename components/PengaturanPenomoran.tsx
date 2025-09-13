import React, { useState, useEffect } from 'react';
import { PenomoranSettings } from '../types';
import { CheckCircleIcon, CogIcon } from './icons';

interface PengaturanPenomoranProps {
    settings: PenomoranSettings;
    onSave: (newSettings: PenomoranSettings) => void;
}

const PengaturanPenomoran: React.FC<PengaturanPenomoranProps> = ({ settings, onSave }) => {
    const [formState, setFormState] = useState<PenomoranSettings>(settings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormState(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };
    
    const placeholders = [
      { tag: '[KODE_UNIT_KERJA_LENGKAP]', desc: 'Kode lengkap unit kerja, termasuk induk jika ada (cth: WIM.27 atau WIM.27.IMI.1).' },
      { tag: '[KODE_KLASIFIKASI_ARSIP]', desc: 'Kode klasifikasi arsip lengkap (cth: PR.01.01).' },
      { tag: '[NOMOR_URUT_PER_MASALAH]', desc: 'Nomor urut per masalah utama (PR, GR, dll), reset tahunan.' },
      { tag: '[TAHUN_SAAT_INI]', desc: 'Tahun empat digit (cth: 2024).' },
    ];

    return (
         <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center mb-4">
                <CogIcon className="w-6 h-6 mr-3 text-slate-700" />
                <h3 className="text-lg font-semibold text-slate-800">Pengaturan Penomoran Surat Otomatis</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="biasa" className="block text-sm font-medium text-slate-700">Format Surat Biasa</label>
                    <input 
                        type="text" 
                        name="biasa" 
                        id="biasa" 
                        value={formState.biasa} 
                        onChange={handleChange} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500 font-mono" 
                    />
                </div>
                
                 <div>
                    <label htmlFor="sk" className="block text-sm font-medium text-slate-700">Format Surat Keputusan (SK)</label>
                    <input 
                        type="text" 
                        name="sk" 
                        id="sk" 
                        value={formState.sk} 
                        onChange={handleChange} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500 font-mono" 
                    />
                </div>
                
                <div className="p-4 bg-slate-50 border rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Placeholder Tersedia:</h4>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs">
                        {placeholders.map(p => (
                             <div key={p.tag} className="flex items-baseline">
                                <code className="font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">{p.tag}</code>
                                <span className="ml-2 text-slate-600">{p.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="resetSequence" className="block text-sm font-medium text-slate-700">Reset Nomor Urut</label>
                     <select 
                        name="resetSequence" 
                        id="resetSequence" 
                        value={formState.resetSequence} 
                        onChange={handleChange} 
                        className="mt-1 block w-full max-w-xs shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                    >
                        <option value="yearly">Setiap Tahun</option>
                        <option value="monthly" disabled>Setiap Bulan (Belum Tersedia)</option>
                    </select>
                    <p className="mt-2 text-xs text-slate-500">Nomor urut akan di-reset berdasarkan pengaturan ini.</p>
                </div>

                <div className="flex justify-end pt-4">
                    <div className="flex items-center space-x-4">
                         {isSaved && (
                            <div className="flex items-center text-sm text-emerald-600 transition-opacity duration-300">
                                <CheckCircleIcon className="w-5 h-5 mr-1"/>
                                <span>Tersimpan!</span>
                            </div>
                        )}
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                            Simpan Pengaturan
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PengaturanPenomoran;