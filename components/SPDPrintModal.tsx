import React from 'react';
import { PerjalananDinas, SuratKeluar, KopSuratSettings, UnitKerja, User } from '../types';
import { PrinterIcon } from './icons';
import SPDPrintView from './SPDPrintView';

interface SPDPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  pd: PerjalananDinas;
  suratTugas: SuratKeluar;
  allUsers: User[];
  kopSuratSettings: KopSuratSettings;
  unitKerjaList: UnitKerja[];
}

const SPDPrintModal: React.FC<SPDPrintModalProps> = (props) => {
    const { isOpen, onClose } = props;

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl transform transition-all flex flex-col h-[95vh]">
                 <div className="p-4 border-b flex justify-between items-center no-print">
                    <h3 className="text-lg font-semibold text-slate-800">Pratinjau Cetak SPD</h3>
                    <div className="space-x-2">
                         <button onClick={handlePrint} className="inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700">
                            <PrinterIcon className="w-5 h-5 mr-2" />
                            Cetak
                        </button>
                        <button onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Tutup</button>
                    </div>
                </div>
                <div className="p-2 bg-slate-200 overflow-y-auto flex-1">
                     <div className="printable-area mx-auto">
                        <SPDPrintView {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SPDPrintModal;
