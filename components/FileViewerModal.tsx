
import React from 'react';
import { AnySurat, TipeSurat, User } from '../types';
import Modal from './Modal';
import { PaperClipIcon } from './icons';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: AnySurat;
  currentUser: User;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ isOpen, onClose, surat, currentUser }) => {
  if (!isOpen) return null;

  const watermarkText = `Diakses oleh: ${currentUser.nama} pada ${new Date().toLocaleString('id-ID')}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pratinjau Dokumen: ${surat.nomorSurat}`} size="4xl">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800">Perihal: {surat.perihal}</h4>
          <p className="text-sm text-slate-500">
            {surat.tipe === TipeSurat.MASUK
              ? `Dari: ${surat.pengirim} | Kepada: (Unit Internal)`
              : `Dari: ${surat.pembuat.nama} | Kepada: ${surat.tujuan}`
            } | Tanggal: {new Date(surat.tanggal).toLocaleDateString('id-ID')}
          </p>
        </div>
        <div className="relative w-full h-[65vh] bg-slate-200 rounded-lg flex items-center justify-center border overflow-hidden">
          {/* Watermark Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="text-4xl text-black opacity-10 font-bold rotate-[-30deg] select-none whitespace-nowrap">
                  {watermarkText}
              </span>
          </div>

          {/* Mock PDF Viewer */}
          <div className="text-center text-slate-500">
              <PaperClipIcon className="w-16 h-16 mx-auto text-slate-400" />
              <p className="mt-2 font-semibold">Pratinjau File Tidak Tersedia</p>
              <p className="text-sm">Ini adalah simulasi tampilan dokumen.</p>
              <a href={surat.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-medium text-sky-600 hover:text-sky-800">
                  Unduh Dokumen (Simulasi)
              </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FileViewerModal;
