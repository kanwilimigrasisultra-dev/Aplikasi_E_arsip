import React, { useState } from 'react';
import Modal from './Modal';
import { ShieldExclamationIcon } from './icons';

interface ManajemenDataProps {
    onResetData: () => void;
}

const ManajemenData: React.FC<ManajemenDataProps> = ({ onResetData }) => {
    const [isResetModalOpen, setResetModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const CONFIRMATION_PHRASE = 'RESET DATA';

    const handleResetClick = () => {
        if (isConfirmed) {
            setResetModalOpen(true);
        }
    };

    const handleConfirmReset = () => {
        if (confirmText === CONFIRMATION_PHRASE) {
            onResetData();
            setResetModalOpen(false);
            // Reset local state
            setConfirmText('');
            setIsConfirmed(false);
        }
    };

    return (
        <>
            <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200">
                <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold text-slate-800">Manajemen Data Aplikasi</h3>
                    <div className="mt-6 p-4 border-2 border-dashed border-red-400 rounded-lg bg-red-50">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <ShieldExclamationIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h4 className="text-lg font-bold text-red-800">Zona Berbahaya</h4>
                                <div className="mt-2 text-sm text-red-700 space-y-2">
                                    <p>Tindakan di bawah ini bersifat destruktif dan tidak dapat dibatalkan. Harap berhati-hati.</p>
                                    <p className="font-semibold">Reset Data Surat: Menghapus semua data Surat Masuk, Surat Keluar, dan Nota Dinas beserta Disposisi dan Tugas yang terkait secara permanen. Data pengguna dan pengaturan sistem tidak akan terpengaruh.</p>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="confirm-reset"
                                                name="confirm-reset"
                                                type="checkbox"
                                                checked={isConfirmed}
                                                onChange={(e) => setIsConfirmed(e.target.checked)}
                                                className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="confirm-reset" className="font-medium text-red-900">
                                                Saya mengerti bahwa tindakan ini akan menghapus data secara permanen dan tidak dapat dibatalkan.
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleResetClick}
                                        disabled={!isConfirmed}
                                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
                                    >
                                        Reset Data Surat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isResetModalOpen} onClose={() => setResetModalOpen(false)} title="Konfirmasi Akhir Reset Data">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Ini adalah langkah konfirmasi terakhir. Untuk melanjutkan, ketik frasa <strong className="font-mono text-red-700">{CONFIRMATION_PHRASE}</strong> di kolom bawah ini.
                    </p>
                    <div>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleConfirmReset}
                            disabled={confirmText !== CONFIRMATION_PHRASE}
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                            Saya Yakin, Hapus Data Sekarang
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ManajemenData;