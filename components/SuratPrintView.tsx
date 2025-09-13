import React from 'react';
import { AnySurat, KopSuratSettings, SifatSurat, SuratKeluar, SuratMasuk, TipeSurat, UnitKerja } from '../types';

interface SuratPrintViewProps {
    surat: AnySurat;
    kopSuratSettings: KopSuratSettings;
    unitKerjaList: UnitKerja[];
}

const getSifatBadgePlain = (sifat: SifatSurat) => {
    return <span className="border px-2 py-0.5 text-xs rounded-full border-black">{sifat}</span>;
}

const SuratPrintView: React.FC<SuratPrintViewProps> = ({ surat, kopSuratSettings, unitKerjaList }) => {
    const isSuratMasuk = surat.tipe === TipeSurat.MASUK;
    const suratMasuk = isSuratMasuk ? (surat as SuratMasuk) : null;
    const suratKeluar = !isSuratMasuk ? (surat as SuratKeluar) : null;

    const suratUnitKerja = unitKerjaList.find(uk => uk.id === surat.unitKerjaId);

    const renderKopSurat = () => {
        if (!suratUnitKerja) {
            return (
                <header className="text-center border-b-[3px] border-black pb-2">
                    <p>Error: Data Unit Kerja tidak ditemukan.</p>
                </header>
            );
        }

        const isCabang = suratUnitKerja.tipe === 'Cabang';
        const indukUnitKerja = isCabang ? unitKerjaList.find(uk => uk.id === suratUnitKerja.indukId) : null;

        return (
            <header className="flex items-start justify-center text-center border-b-[3px] border-black pb-2">
                {kopSuratSettings.logoUrl && <img src={kopSuratSettings.logoUrl} alt="Logo" className="h-24 w-24 object-contain mr-4" />}
                <div className="flex-1">
                    <h1 className="text-sm font-bold uppercase tracking-wide">{kopSuratSettings.namaKementerian}</h1>
                    <h2 className="text-md font-bold uppercase tracking-wide">{kopSuratSettings.namaDirektorat}</h2>
                    
                    {isCabang && indukUnitKerja && (
                        <h3 className="text-lg uppercase tracking-wide">{indukUnitKerja.nama}</h3>
                    )}
                    <h3 className="text-lg font-bold uppercase tracking-wide">{suratUnitKerja.nama}</h3>
                    
                    <p className="text-[10px] mt-1">{suratUnitKerja.alamat}</p>
                    <p className="text-[10px]">Laman: {suratUnitKerja.website}, {suratUnitKerja.kontak}</p>
                </div>
            </header>
        );
    }

    return (
        <div className="bg-white p-12 font-serif text-black" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* KOP SURAT */}
            {renderKopSurat()}
            
            <main className="mt-6 text-sm">
                {/* METADATA SURAT */}
                <h4 className="text-center font-bold underline text-md mb-4">DETAIL SURAT</h4>
                <table className="w-full text-left text-xs mb-6">
                    <tbody>
                        <tr className="border-b">
                            <td className="py-1 pr-2 font-bold w-1/4">Nomor Surat</td>
                            <td className="py-1">: {surat.nomorSurat}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-1 pr-2 font-bold">Tanggal Surat</td>
                            <td className="py-1">: {new Date(surat.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        </tr>
                         {isSuratMasuk && (
                             <tr className="border-b">
                                <td className="py-1 pr-2 font-bold">Tanggal Diterima</td>
                                <td className="py-1">: {new Date(suratMasuk!.tanggalDiterima).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                            </tr>
                         )}
                        <tr className="border-b">
                            <td className="py-1 pr-2 font-bold">{isSuratMasuk ? 'Pengirim' : 'Tujuan'}</td>
                            <td className="py-1">: {isSuratMasuk ? surat.pengirim : surat.tujuan}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-1 pr-2 font-bold align-top">Perihal</td>
                            <td className="py-1 align-top">: {surat.perihal}</td>
                        </tr>
                         <tr className="border-b">
                            <td className="py-1 pr-2 font-bold">Sifat</td>
                            <td className="py-1">: {getSifatBadgePlain(surat.sifat)}</td>
                        </tr>
                    </tbody>
                </table>
                
                {/* ISI SURAT */}
                {surat.isi && (
                    <div className="mt-4 border-t pt-4">
                        <h5 className="font-bold text-md mb-2">Isi Surat:</h5>
                        <div className="text-xs whitespace-pre-wrap leading-relaxed">{surat.isi}</div>
                    </div>
                )}
                
                {/* TANDA TANGAN */}
                {suratKeluar?.tandaTangan && (
                     <div className="mt-8 pt-4 flex justify-end">
                        <div className="text-center w-64">
                            <p>{suratKeluar.tandaTangan.jabatanPenandaTangan},</p>
                            <div className="my-2 h-20 flex justify-center items-center">
                                 <img src={suratKeluar.tandaTangan.signatureDataUrl} alt="Tanda Tangan Digital" className="h-20 object-contain"/>
                            </div>
                            <p className="font-bold underline">{suratKeluar.tandaTangan.namaPenandaTangan}</p>
                            <p className="text-[10px] mt-1 italic">Ditandatangani secara elektronik pada {new Date(suratKeluar.tandaTangan.timestamp).toLocaleString('id-ID')}</p>
                            {suratKeluar.tandaTangan.verifikasiUrl && (
                                <p className="text-[9px] mt-1 text-slate-600 break-all">{suratKeluar.tandaTangan.verifikasiUrl}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* RIWAYAT DISPOSISI */}
                {suratMasuk && suratMasuk.disposisi.length > 0 && (
                     <div className="mt-8 border-t pt-4">
                         <h4 className="text-center font-bold underline text-md mb-4">RIWAYAT DISPOSISI</h4>
                         <table className="w-full text-xs border-collapse border border-black">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border border-black p-2">Tanggal</th>
                                    <th className="border border-black p-2">Dari</th>
                                    <th className="border border-black p-2">Kepada</th>
                                    <th className="border border-black p-2">Instruksi</th>
                                    <th className="border border-black p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suratMasuk.disposisi.map(d => (
                                    <tr key={d.id}>
                                        <td className="border border-black p-2 align-top">{new Date(d.tanggalDisposisi).toLocaleDateString('id-ID')}</td>
                                        <td className="border border-black p-2 align-top">{d.pembuat.nama}</td>
                                        <td className="border border-black p-2 align-top">{d.tujuan.nama}</td>
                                        <td className="border border-black p-2 align-top">{d.catatan}</td>
                                        <td className="border border-black p-2 align-top">{d.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                )}

            </main>
        </div>
    );
};

export default SuratPrintView;