import React, { useState } from 'react';
import { PerjalananDinas, User, SuratKeluar, UnitKerja, KopSuratSettings } from '../types';
import Modal from './Modal';
import { CalendarIcon, UsersIcon, ClipboardListIcon, PaperClipIcon, PrinterIcon } from './icons';
import SPDPrintModal from './SPDPrintModal';

interface PerjalananDinasDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    pd: PerjalananDinas;
    suratTugas?: SuratKeluar;
    allUsers: User[];
    kopSuratSettings: KopSuratSettings;
    unitKerjaList: UnitKerja[];
}

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <p className="text-sm text-slate-800">{value}</p>
    </div>
);


const PerjalananDinasDetailModal: React.FC<PerjalananDinasDetailModalProps> = (props) => {
    const { isOpen, onClose, pd, suratTugas, allUsers } = props;
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    
    const pegawaiUtama = allUsers.find(u => u.id === pd.pegawaiUtamaId);
    const pengikut = pd.pengikut.map(p => allUsers.find(u => u.id === p.userId)).filter(Boolean) as User[];
    const peserta = pegawaiUtama ? [pegawaiUtama, ...pengikut] : pengikut;

    const totalBiaya = pd.rincianBiaya.reduce((acc, item) => acc + (item.jumlah * item.hargaSatuan), 0);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Detail Perjalanan Dinas" size="2xl">
                <div className="space-y-6">
                    
                    <div className="flex justify-end">
                         <button onClick={() => setIsPrintModalOpen(true)} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                            <PrinterIcon className="w-5 h-5 mr-2" />
                            Cetak SPD
                        </button>
                    </div>

                    {/* Main Info */}
                    <div className="p-4 bg-slate-50 rounded-lg border">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{pd.tujuanPerjalanan}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InfoItem label="Kota Tujuan" value={pd.kotaTujuan} />
                            <InfoItem label="Tanggal" value={`${new Date(pd.tanggalBerangkat).toLocaleDateString()} - ${new Date(pd.tanggalKembali).toLocaleDateString()}`} />
                            <InfoItem label="Status" value={pd.status} />
                        </div>
                         {suratTugas && <InfoItem label="Surat Tugas" value={suratTugas.nomorSurat} />}
                    </div>

                    {/* Peserta */}
                    <div>
                        <h4 className="font-semibold text-slate-800 flex items-center mb-2"><UsersIcon className="w-5 h-5 mr-2 text-slate-500"/> Peserta</h4>
                        <div className="space-y-2">
                            {peserta.map(p => (
                                <div key={p.id} className="p-2 bg-slate-100 rounded-md text-sm">{p.nama} - <span className="text-slate-600">{p.jabatan}</span></div>
                            ))}
                        </div>
                    </div>

                    {/* Rincian Biaya */}
                    <div>
                        <h4 className="font-semibold text-slate-800 flex items-center mb-2"><ClipboardListIcon className="w-5 h-5 mr-2 text-slate-500"/> Rincian Biaya</h4>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="p-2 text-left">Deskripsi</th>
                                        <th className="p-2 text-center">Jumlah</th>
                                        <th className="p-2 text-left">Satuan</th>
                                        <th className="p-2 text-right">Harga Satuan</th>
                                        <th className="p-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pd.rincianBiaya.map(item => (
                                        <tr key={item.id} className="border-t">
                                            <td className="p-2">{item.deskripsi}</td>
                                            <td className="p-2 text-center">{item.jumlah}</td>
                                            <td className="p-2">{item.satuan}</td>
                                            <td className="p-2 text-right">{item.hargaSatuan.toLocaleString('id-ID')}</td>
                                            <td className="p-2 text-right font-semibold">{(item.jumlah * item.hargaSatuan).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-100 font-bold">
                                    <tr>
                                        <td colSpan={4} className="p-2 text-right">Total Estimasi Biaya</td>
                                        <td className="p-2 text-right">{totalBiaya.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Laporan */}
                    {pd.laporan && (
                         <div>
                            <h4 className="font-semibold text-slate-800 mb-2">Laporan Hasil Perjalanan</h4>
                             <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-3">
                                 <InfoItem label="Dikirim Oleh" value={`${pd.laporan.dikirimOleh.nama} pada ${new Date(pd.laporan.tanggalPengiriman).toLocaleString('id-ID')}`} />
                                 <div>
                                    <p className="text-sm font-semibold text-slate-600">Ringkasan Hasil</p>
                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{pd.laporan.ringkasanHasil}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-600 mb-1">Lampiran Laporan</p>
                                    {pd.laporan.attachments.map(att => (
                                         <a href={att.content} download={att.name} key={att.id} className="flex items-center text-sm p-2 bg-white rounded-md border hover:bg-slate-50 transition-colors">
                                            <PaperClipIcon className="w-4 h-4 mr-2 flex-shrink-0 text-slate-500"/>
                                            <span className="truncate text-slate-700">{att.name}</span>
                                        </a>
                                    ))}
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </Modal>
            {isPrintModalOpen && suratTugas && (
                 <SPDPrintModal 
                    isOpen={isPrintModalOpen} 
                    onClose={() => setIsPrintModalOpen(false)} 
                    {...props}
                    suratTugas={suratTugas}
                 />
            )}
        </>
    );
};

export default PerjalananDinasDetailModal;