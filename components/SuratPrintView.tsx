
import React from 'react';
import { AnySurat, KopSuratSettings, UnitKerja, TipeSurat, SuratKeluar, User } from '../types';

interface SuratPrintViewProps {
  surat: AnySurat;
  kopSuratSettings: KopSuratSettings;
  unitKerjaList: UnitKerja[];
  currentUser: User;
}

const SuratPrintView: React.FC<SuratPrintViewProps> = ({ surat, kopSuratSettings, unitKerjaList, currentUser }) => {
    const suratUnitKerja = unitKerjaList.find(uk => uk.id === surat.unitKerjaId);
    const watermarkText = `DOKUMEN INI DICETAK OLEH ${currentUser.nama.toUpperCase()} PADA ${new Date().toLocaleString('id-ID')}`;

    const renderKopSurat = () => {
        if (!suratUnitKerja) {
            return (
                <header className="text-center border-b-4 border-black pb-2 mb-8">
                    <p>Error: Data Unit Kerja tidak ditemukan.</p>
                </header>
            );
        }

        const isCabang = suratUnitKerja.tipe === 'Cabang';
        const indukUnitKerja = isCabang ? unitKerjaList.find(uk => uk.id === suratUnitKerja.indukId) : null;

        return (
            <header className="flex items-start justify-center text-center border-b-4 border-black pb-2 mb-8">
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
    };
    
    const renderTandaTangan = () => {
        if (surat.tipe !== TipeSurat.KELUAR) return null;
        const s = surat as SuratKeluar;
        if (!s.tandaTangan) return null;
        
        return (
            <div className="flex justify-end mt-16">
                <div className="text-center w-64">
                    <p>{s.pembuat.jabatan},</p>
                     <div className="h-24 flex items-center justify-center">
                        {s.tandaTangan.startsWith('data:image') ? (
                            <img src={s.tandaTangan} alt="Tanda Tangan" className="h-20" />
                        ) : (
                            <div className="text-sm text-slate-500">[QR Code Placeholder]</div>
                        )}
                    </div>
                    <p className="font-bold underline">{s.pembuat.nama}</p>
                </div>
            </div>
        )
    }

    const renderIsiSurat = () => {
        if(surat.tipe === TipeSurat.KELUAR) {
            // Treat ringkasan as HTML content for rich text
            return <div className="space-y-4" dangerouslySetInnerHTML={{ __html: surat.ringkasan.replace(/\n/g, '<br />') }} />;
        }
        // Fallback for Surat Masuk
        return (
             <div className="space-y-4">
                <p>Dengan hormat,</p>
                <p>
                    Sehubungan dengan surat Saudara nomor {surat.nomorSurat} tanggal {new Date(surat.tanggal).toLocaleDateString('id-ID')} perihal {surat.perihal}, dengan ini kami sampaikan bahwa... 
                    [Ini adalah konten isi surat yang disimulasikan].
                </p>
                <p>
                    Demikian disampaikan, atas perhatian dan kerja sama Saudara, kami ucapkan terima kasih.
                </p>
            </div>
        )
    }


    return (
        <div className="relative bg-white p-12 A4-size" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-7xl text-black opacity-[0.07] font-bold rotate-[-45deg] select-none whitespace-nowrap">
                  {watermarkText}
              </span>
            </div>
            {/* Content */}
            <div className="relative z-10">
                {renderKopSurat()}
                <main className="text-base leading-relaxed">
                    <div className="flex justify-between mb-8">
                        <div>
                            <p>Nomor: {surat.nomorSurat}</p>
                            <p>Sifat: {surat.sifat}</p>
                            <p>Lampiran: {surat.attachments?.length || 0} Berkas</p>
                            <p>Perihal: {surat.perihal}</p>
                        </div>
                        <div>
                            <p>{suratUnitKerja?.nama}, {new Date(surat.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <p>Kepada Yth.</p>
                        <p className="font-bold">{surat.tipe === TipeSurat.KELUAR ? surat.tujuan : surat.pengirim}</p>
                        <p>di Tempat</p>
                    </div>

                    {renderIsiSurat()}
                    
                    {renderTandaTangan()}
                </main>
            </div>
        </div>
    );
};

export default SuratPrintView;
