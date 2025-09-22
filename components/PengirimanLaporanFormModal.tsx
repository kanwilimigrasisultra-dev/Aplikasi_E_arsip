
import React, { useState } from 'react';
import { PermintaanLaporan, PengirimanLaporan, User, Attachment } from '../types';
import Modal from './Modal';
import { PaperClipIcon, XIcon } from './icons';

interface PengirimanLaporanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (pengiriman: Omit<PengirimanLaporan, 'id'|'dikirimOleh'|'tanggalPengiriman'|'status'>) => void;
    permintaan: PermintaanLaporan;
    currentUser: User;
}

const PengirimanLaporanFormModal: React.FC<PengirimanLaporanFormModalProps> = ({
    isOpen, onClose, onSubmit, permintaan, currentUser
}) => {
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const [catatan, setCatatan] = useState('');
    const [periodeLaporan, setPeriodeLaporan] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const newAttachment: Attachment = {
                    id: `att-lap-${Date.now()}`,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    content: event.target?.result as string,
                };
                setAttachment(newAttachment);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (attachment && periodeLaporan) {
            const pengirimanData: Omit<PengirimanLaporan, 'id'|'dikirimOleh'|'tanggalPengiriman'|'status'> = {
                permintaanId: permintaan.id,
                unitKerjaId: currentUser.unitKerjaId,
                periodeLaporan,
                attachment,
                catatan,
            };
            onSubmit(pengirimanData);
            onClose();
        } else {
            alert("Harap isi periode laporan dan lampirkan file laporan.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Kirim Laporan: ${permintaan.nama}`} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 border rounded-md text-sm">
                    <p><span className="font-semibold">Deskripsi:</span> {permintaan.deskripsi}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Periode Laporan</label>
                    <input 
                        type="text" 
                        value={periodeLaporan} 
                        onChange={e => setPeriodeLaporan(e.target.value)} 
                        required 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                        placeholder={`Contoh: ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Lampirkan File Laporan</label>
                    {!attachment ? (
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-slate-600 hover:text-slate-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-slate-500">
                                        <span>Unggah file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">atau seret dan lepas</p>
                                </div>
                                <p className="text-xs text-gray-500">PDF, DOCX, XLSX</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 flex items-center justify-between p-2 bg-slate-100 rounded text-sm">
                            <span className="truncate font-medium">{attachment.name}</span>
                            <button type="button" onClick={removeAttachment} className="ml-2 text-red-500 hover:text-red-700">
                                <XIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Catatan (Opsional)</label>
                    <textarea 
                        value={catatan} 
                        onChange={e => setCatatan(e.target.value)} 
                        rows={3} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" 
                        placeholder="Tambahkan catatan jika ada...">
                    </textarea>
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

export default PengirimanLaporanFormModal;
