import React from 'react';
import { SuratMasuk, User, KopSuratSettings, UnitKerja } from '../types';
import Modal from './Modal';
import { PrinterIcon } from './icons';

interface LembarDisposisiPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk;
  currentUser: User;
  kopSuratSettings: KopSuratSettings;
  unitKerjaList: UnitKerja[];
}

const LembarDisposisiPrintModal: React.FC<LembarDisposisiPrintModalProps> = ({ isOpen, onClose, surat, currentUser, kopSuratSettings, unitKerjaList }) => {

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    const lastDisposisi = surat.disposisi.length > 0 ? surat.disposisi[surat.disposisi.length - 1] : null;
    const allTujuan = [...new Set(surat.disposisi.map(d => d.tujuan.nama))];
    const pembuatDisposisiAwal = surat.disposisi[0]?.pembuat || currentUser;

    const suratUnitKerja = unitKerjaList.find(uk => uk.id === surat.unitKerjaId);

    const renderKopSurat = () => {
        if (!suratUnitKerja) {
            return (
                <header className="text-center border-b-4 border-black pb-2">
                    <p>Error: Data Unit Kerja tidak ditemukan.</p>
                </header>
            );
        }

        const isCabang = suratUnitKerja.tipe === 'Cabang';
        const indukUnitKerja = isCabang ? unitKerjaList.find(uk => uk.id === suratUnitKerja.indukId) : null;

        return (
            <header className="flex items-start justify-center text-center border-b-4 border-black pb-2">
                {kopSuratSettings.logoUrl && <img src={kopSuratSettings.logoUrl} alt="Logo" className="h-24 w-24 object-contain mr-4"/>}
                <div className="flex-1">
                    <h1 className="text-lg font-bold uppercase">{kopSuratSettings.namaKementerian}</h1>
                    <h2 className="text-xl font-bold uppercase">{kopSuratSettings.namaDirektorat}</h2>
                    
                    {isCabang && indukUnitKerja && (
                        <h3 className="text-2xl uppercase">{indukUnitKerja.nama}</h3>
                    )}
                    <h3 className="text-2xl font-bold uppercase">{suratUnitKerja.nama}</h3>
                    
                    <p className="text-xs mt-1">{suratUnitKerja.alamat}</p>
                    <p className="text-xs">Laman: {suratUnitKerja.website}, {suratUnitKerja.kontak}</p>
                </div>
            </header>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl transform transition-all flex flex-col h-[95vh]">
                 <div className="p-4 border-b flex justify-between items-center no-print relative z-10 bg-white">
                    <h3 className="text-lg font-semibold text-slate-800">Pratinjau Cetak Lembar Disposisi</h3>
                    <div className="space-x-2">
                         <button onClick={handlePrint} className="inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700">
                            <PrinterIcon className="w-5 h-5 mr-2" />
                            Cetak
                        </button>
                        <button onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Tutup</button>
                    </div>
                </div>
                <div className="p-2 bg-slate-200 overflow-y-auto flex-1">
                     <div id="printable-area" className="printable-area bg-white p-12 mx-auto" style={{width: '210mm', minHeight: '297mm'}}>
                        {/* KOP SURAT */}
                        {renderKopSurat()}
                        
                        <main className="mt-6 text-sm">
                            <h4 className="text-center font-bold underline text-lg mb-6">LEMBAR DISPOSISI</h4>

                            {/* DETAIL SURAT */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                <div className="flex"><span className="w-28">Surat dari</span>: {surat.pengirim}</div>
                                <div className="flex"><span className="w-32">Diterima Tanggal</span>: {new Date(surat.tanggalDiterima).toLocaleDateString('id-ID')}</div>
                                <div className="flex"><span className="w-28">Nomor Surat</span>: {surat.nomorSurat}</div>
                                <div className="flex"><span className="w-32">Nomor Agenda</span>: -</div>
                                <div className="flex"><span className="w-28">Tanggal Surat</span>: {new Date(surat.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</div>
                                <div></div>
                                <div className="flex col-span-2"><span className="w-28">Perihal</span>: {surat.perihal}</div>
                            </div>
                            
                            {/* INSTRUKSI & TUJUAN */}
                            <div className="mt-4 border-2 border-black">
                                <div className="grid grid-cols-2">
                                    <div className="border-r-2 border-black">
                                        <h5 className="text-center font-bold p-1 border-b-2 border-black bg-slate-100">INSTRUKSI / INFORMASI</h5>
                                        <div className="p-4 h-64">
                                            {lastDisposisi && (
                                                <>
                                                    <p><span className="font-bold">Sifat:</span> {lastDisposisi.sifat}</p>
                                                    <p className="mt-2"><span className="font-bold">Catatan:</span></p>
                                                    <p>{lastDisposisi.catatan}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                         <h5 className="text-center font-bold p-1 border-b-2 border-black bg-slate-100">DITERUSKAN KEPADA</h5>
                                         <div className="p-4 h-64">
                                            <ul className="list-disc list-inside">
                                                {allTujuan.map(nama => <li key={nama}>{nama}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TTD */}
                            <div className="flex justify-end mt-12">
                                <div className="text-center">
                                    <p>{pembuatDisposisiAwal.jabatan},</p>
                                    <div className="h-20"></div>
                                    <p className="font-bold underline">{pembuatDisposisiAwal.nama}</p>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LembarDisposisiPrintModal;