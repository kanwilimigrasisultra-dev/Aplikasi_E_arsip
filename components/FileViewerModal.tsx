import React from 'react';
import { AnySurat, TipeSurat, User } from '../types';
import Modal from './Modal';
import { PaperClipIcon, SparklesIcon } from './icons';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: AnySurat;
  currentUser: User;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ isOpen, onClose, surat, currentUser }) => {
  if (!isOpen) return null;

  const watermarkText = `Diakses oleh: ${currentUser.nama} pada ${new Date().toLocaleString('id-ID')}`;

  const mockContent = `
    <p><strong>Paragraf 1:</strong> Ini adalah paragraf pembuka dari dokumen simulasi. Fitur komentar langsung memungkinkan pengguna untuk memberikan masukan pada bagian spesifik dari teks.</p>
    <p><strong>Paragraf 2:</strong> Setiap paragraf dapat memiliki utas diskusinya sendiri, membuat kolaborasi menjadi lebih terstruktur dan kontekstual. Klik ikon komentar untuk mencoba.</p>
    <p><strong>Paragraf 3:</strong> Tentu saja, ini adalah demonstrasi visual. Dalam aplikasi nyata, komentar akan disimpan dan ditautkan ke lokasi yang tepat di dalam dokumen digital.</p>
  `;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pratinjau Dokumen: ${surat.nomorSurat}`} size="4xl">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800">Perihal: {surat.perihal}</h4>
          <p className="text-sm text-slate-500">
            {surat.tipe === TipeSurat.MASUK
              ? `Dari: ${surat.pengirim} | Kepada: (Unit Internal)`
              : `Dari: ${(surat as any).pembuat.nama} | Kepada: ${(surat as any).tujuan}`
            } | Tanggal: {new Date(surat.tanggal).toLocaleDateString('id-ID')}
          </p>
        </div>
        <div className="relative w-full h-[65vh] bg-slate-100 rounded-lg flex items-center justify-center border overflow-hidden">
          {/* Watermark Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="text-4xl text-black opacity-10 font-bold rotate-[-30deg] select-none whitespace-nowrap">
                  {watermarkText}
              </span>
          </div>

          {/* Mock PDF Viewer with simulated direct comments */}
           <div className="w-full h-full bg-white p-8 overflow-y-auto">
                <h3 className="text-lg font-bold mb-4 text-center">{surat.perihal}</h3>
                <div className="text-sm space-y-4 relative group">
                    {mockContent.split('</p>').filter(p => p.trim()).map((p, index) => (
                         <div key={index} className="relative group/paragraph flex items-start gap-2">
                             <div 
                                className="flex-grow" 
                                dangerouslySetInnerHTML={{ __html: p + '</p>' }} 
                             />
                              <button 
                                onClick={() => alert('Fitur komentar langsung pada dokumen sedang dalam pengembangan.')}
                                className="opacity-0 group-hover/paragraph:opacity-100 transition-opacity absolute -right-4 top-0 text-sky-500 hover:text-sky-700"
                                title="Tambah komentar di sini"
                              >
                                 <SparklesIcon className="w-5 h-5" />
                              </button>
                         </div>
                    ))}
                </div>
                 <div className="text-center text-slate-500 mt-8">
                    <p className="text-xs">--- Akhir dari dokumen simulasi ---</p>
                    <a href={surat.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-sky-600 hover:text-sky-800">
                        Unduh Dokumen Asli (Simulasi)
                    </a>
                </div>
           </div>
        </div>
      </div>
    </Modal>
  );
};

export default FileViewerModal;