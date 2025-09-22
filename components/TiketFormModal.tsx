import React, { useState } from 'react';
import { Tiket } from '../types';
import Modal from './Modal';

interface TiketFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (tiket: Omit<Tiket, 'id' | 'pembuat' | 'tanggalDibuat' | 'tanggalUpdate' | 'status' | 'balasan'>) => void;
}

const TiketFormModal: React.FC<TiketFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [kategori, setKategori] = useState<'Masalah Teknis' | 'Permintaan Data' | 'Saran Fitur' | 'Lainnya'>('Masalah Teknis');
    const [prioritas, setPrioritas] = useState<'Rendah' | 'Sedang' | 'Tinggi'>('Sedang');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (judul.trim() && deskripsi.trim()) {
            onSubmit({ judul, deskripsi, kategori, prioritas });
            onClose();
            // Reset form
            setJudul('');
            setDeskripsi('');
            setKategori('Masalah Teknis');
            setPrioritas('Sedang');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Buat Tiket Bantuan Baru" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Judul</label>
                    <input type="text" value={judul} onChange={e => setJudul(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Contoh: Gagal mengunggah lampiran" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Kategori</label>
                        <select value={kategori} onChange={e => setKategori(e.target.value as any)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <option value="Masalah Teknis">Masalah Teknis</option>
                            <option value="Permintaan Data">Permintaan Data</option>
                            <option value="Saran Fitur">Saran Fitur</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Prioritas</label>
                        <select value={prioritas} onChange={e => setPrioritas(e.target.value as any)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <option value="Rendah">Rendah</option>
                            <option value="Sedang">Sedang</option>
                            <option value="Tinggi">Tinggi</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Deskripsi Masalah</label>
                    <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={5} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Jelaskan masalah atau permintaan Anda sedetail mungkin..."></textarea>
                </div>
                {/* Simple attachment placeholder */}
                <div>
                    <label className="block text-sm font-medium text-slate-700">Lampiran (Opsional)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                            <div className="flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500"><span>Unggah file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" /></label><p className="pl-1">atau seret dan lepas</p></div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 10MB</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        Kirim Tiket
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TiketFormModal;