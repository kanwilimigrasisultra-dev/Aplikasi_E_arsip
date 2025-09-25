import React, { useState } from 'react';
import { LaporanPerjalananDinas, PerjalananDinas, Attachment } from '../types';
import Modal from './Modal';
import { PaperClipIcon, XIcon } from './icons';

interface LaporanPerjalananDinasModalProps {
    isOpen: boolean;
    onClose: () => void;
    pd: PerjalananDinas;
    onSubmit: (perjalananDinasId: string, laporan: Omit<LaporanPerjalananDinas, 'id' | 'tanggalPengiriman' | 'dikirimOleh'>) => void;
}

const LaporanPerjalananDinasModal: React.FC<LaporanPerjalananDinasModalProps> = ({ isOpen, onClose, pd, onSubmit }) => {
    const [ringkasanHasil, setRingkasanHasil] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newAttachment: Attachment = {
                        id: `att-lpd-${Date.now()}-${file.name}`,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: event.target?.result as string,
                    };
                    setAttachments(prev => [...prev, newAttachment]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ringkasanHasil.trim()) {
            const laporanData = { ringkasanHasil, attachments };
            onSubmit(pd.id, laporanData);
        } else {
            alert('Ringkasan hasil wajib diisi.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Kirim Laporan Perjalanan Dinas">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Ringkasan Hasil Perjalanan</label>
                    <textarea 
                        value={ringkasanHasil} 
                        onChange={e => setRingkasanHasil(e.target.value)} 
                        rows={6} 
                        required 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                        placeholder="Jelaskan secara singkat hasil, temuan, atau tindak lanjut dari perjalanan dinas yang telah dilaksanakan...">
                    </textarea>
                </div>
                 <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Lampiran (Kuitansi, Dokumentasi, dll.)</label>
                    <div className="mt-1">
                        <label htmlFor="lpd-file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                            <PaperClipIcon className="w-4 h-4 mr-2 inline-block"/>
                            <span>Tambah File</span>
                            <input id="lpd-file-upload" name="lpd-file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple/>
                        </label>
                    </div>
                    <div className="space-y-2">
                        {attachments.map(att => (
                            <div key={att.id} className="flex items-center justify-between p-2 bg-slate-100 rounded text-sm">
                                <span className="truncate">{att.name}</span>
                                <button type="button" onClick={() => removeAttachment(att.id)} className="ml-2 text-red-500 hover:text-red-700"><XIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        Kirim Laporan
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default LaporanPerjalananDinasModal;
