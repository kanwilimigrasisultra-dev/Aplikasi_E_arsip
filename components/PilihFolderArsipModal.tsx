import React, { useState, useEffect } from 'react';
import { FolderArsip } from '../types';
import Modal from './Modal';
import { ArchiveIcon } from './icons';

interface PilihFolderArsipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderId: string) => void;
  folders: FolderArsip[];
}

const PilihFolderArsipModal: React.FC<PilihFolderArsipModalProps> = ({ isOpen, onClose, onSubmit, folders }) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  useEffect(() => {
    // Set a default folder when the modal opens and folders are available
    if (isOpen && folders.length > 0) {
      setSelectedFolderId(folders[0].id);
    }
  }, [isOpen, folders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFolderId) {
      onSubmit(selectedFolderId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Folder Arsip">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="folder-select" className="block text-sm font-medium text-slate-700">
            Pindahkan surat ke dalam folder:
          </label>
          <select
            id="folder-select"
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
          >
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Batal
            </button>
            <button type="submit" className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400" disabled={!selectedFolderId}>
                <ArchiveIcon className="w-4 h-4 mr-2" />
                Simpan ke Arsip
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default PilihFolderArsipModal;
