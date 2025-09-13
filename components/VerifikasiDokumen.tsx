import React, { useState } from 'react';
import { SuratKeluar } from '../types';
import { ShieldCheckIcon, ShieldExclamationIcon } from './icons';

interface VerifikasiDokumenProps {
    suratKeluarList: SuratKeluar[];
}

type VerificationStatus = 'idle' | 'checking' | 'valid' | 'invalid';

const VerifikasiDokumen: React.FC<VerifikasiDokumenProps> = ({ suratKeluarList }) => {
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [verifiedSurat, setVerifiedSurat] = useState<SuratKeluar | null>(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFileName(file.name);
            setStatus('checking');
            setVerifiedSurat(null);

            // --- SIMULATION LOGIC ---
            // In a real app, you would parse the file (e.g., a QR code in a PDF)
            // to get a unique document ID and then query the database.
            // Here, we'll simulate this by picking a signed document from our mock data.
            setTimeout(() => {
                const signedSurat = suratKeluarList.find(s => s.id === 'sk-2'); // Let's check against a specific signed letter

                if (signedSurat && file.name.includes('Balasan')) { // Simulate a match
                    setVerifiedSurat(signedSurat);
                    setStatus('valid');
                } else {
                    setStatus('invalid');
                }
            }, 2000);
        }
    };

    const renderStatus = () => {
        switch (status) {
            case 'checking':
                return (
                    <div className="text-center text-slate-500">
                        <svg className="animate-spin h-8 w-8 text-sky-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-3">Memeriksa keaslian dokumen...</p>
                    </div>
                );
            case 'valid':
                return (
                    <div className="text-center p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <ShieldCheckIcon className="w-16 h-16 text-emerald-500 mx-auto" />
                        <h4 className="mt-4 text-lg font-bold text-emerald-800">Dokumen Asli dan Terverifikasi</h4>
                        <p className="text-sm text-emerald-700 mt-1">Tanda tangan digital pada dokumen ini sah.</p>
                        {verifiedSurat && (
                             <div className="mt-4 text-left text-sm text-slate-700 bg-white p-3 border rounded-md space-y-1">
                                <p><span className="font-semibold">Nomor Surat:</span> {verifiedSurat.nomorSurat}</p>
                                <p><span className="font-semibold">Perihal:</span> {verifiedSurat.perihal}</p>
                                <p><span className="font-semibold">Ditandatangani oleh:</span> {verifiedSurat.pembuat.nama} ({verifiedSurat.pembuat.jabatan})</p>
                                <p><span className="font-semibold">Tanggal Surat:</span> {new Date(verifiedSurat.tanggal).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                );
            case 'invalid':
                return (
                    <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
                        <ShieldExclamationIcon className="w-16 h-16 text-red-500 mx-auto" />
                        <h4 className="mt-4 text-lg font-bold text-red-800">Dokumen Tidak Dikenali</h4>
                        <p className="text-sm text-red-700 mt-1">Kami tidak dapat memverifikasi keaslian dokumen ini. Tanda tangan digital tidak valid atau dokumen mungkin telah diubah.</p>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center text-slate-500">
                        <ShieldCheckIcon className="w-16 h-16 text-slate-300 mx-auto" />
                        <p className="mt-2 font-semibold">Sistem Verifikasi Dokumen</p>
                        <p className="text-sm">Unggah file surat (PDF/Gambar) untuk memeriksa keaslian tanda tangan digitalnya.</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-center mb-2">
                    <ShieldCheckIcon className="w-6 h-6 mr-3 text-emerald-700" />
                    <h3 className="text-xl font-bold text-slate-800">Verifikasi Dokumen</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6">Pastikan keaslian surat keluar dengan memvalidasi tanda tangan digital yang tertera.</p>
                
                <div className="flex flex-col items-center justify-center w-full">
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Klik untuk mengunggah</span> atau seret file ke sini</p>
                            <p className="text-xs text-slate-500">PDF, PNG, atau JPG (Simulasi)</p>
                        </div>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                    </label>
                    {fileName && <p className="mt-2 text-sm text-slate-600">File yang dipilih: {fileName}</p>}
                </div>
            </div>

             <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 min-h-[300px] flex items-center justify-center">
                {renderStatus()}
             </div>
        </div>
    );
};

export default VerifikasiDokumen;
