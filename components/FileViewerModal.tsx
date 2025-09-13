import React from 'react';
import { AnySurat } from '../types';
import Modal from './Modal';
import { PaperClipIcon } from './icons';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: AnySurat;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ isOpen, onClose, surat }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pratinjau Dokumen: ${surat.nomorSurat}`} size="xl">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800">Perihal: {surat.perihal}</h4>
          <p className="text-sm text-slate-500">
            Dari: {surat.pengirim} | Kepada: {surat.tujuan} | Tanggal: {new Date(surat.tanggal).toLocaleDateString('id-ID')}
          </p>
        </div>
        <div className="w-full h-[60vh] bg-slate-200 rounded-lg flex items-center justify-center border">
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
