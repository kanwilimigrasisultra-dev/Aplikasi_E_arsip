

import React, { useEffect, useRef } from 'react';
import { AnySurat, KopSuratSettings, UnitKerja, TipeSurat, SuratKeluar, User, SuratMasuk, NotaDinas } from '../types';

declare const QRCode: any;

interface SuratPrintViewProps {
  surat: AnySurat;
  kopSuratSettings: KopSuratSettings;
  unitKerjaList: UnitKerja[];
  currentUser: User;
}

const SuratPrintView: React.FC<SuratPrintViewProps> = ({ surat, kopSuratSettings, unitKerjaList, currentUser }) => {
    const suratUnitKerja = unitKerjaList.find(uk => uk.id === surat.unitKerjaId);
    const watermarkText = `DOKUMEN INI DICETAK OLEH ${currentUser.nama.toUpperCase()} PADA ${new Date().toLocaleString('id-ID')}`;
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);

    // Inject styles for paragraph indentation
    useEffect(() => {
        const styleId = 'print-view-styles';
        // Remove existing style element to prevent duplication
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
            .isi-surat p {
                text-align: justify;
                line-height: 1.5;
                margin-bottom: 0.5em;
                text-indent: 3em;
            }
            .isi-surat p:first-of-type {
                text-indent: 0;
            }
            .isi-surat ol {
                padding-left: 3.5em; /* Indent list to align with paragraph text */
            }
            .isi-surat li {
                text-align: justify;
                padding-left: 1em;
                margin-bottom: 0.5em;
            }
        `;
        document.head.appendChild(styleEl);
        
        // Cleanup function
        return () => {
             const styleToRemove = document.getElementById(styleId);
             if (styleToRemove) {
                styleToRemove.remove();
             }
        };
    }, []);

    // Effect to generate QR Code with optional logo
    useEffect(() => {
        if (surat.tipe === TipeSurat.KELUAR && surat.tandaTangan && !surat.tandaTangan.startsWith('data:image') && qrCanvasRef.current) {
            const canvas = qrCanvasRef.current;
            const s = surat as SuratKeluar;
            const verificationUrl = `https://e-arsim.sultra.dev/verify/${s.id}`;
            const qrOptions = {
                errorCorrectionLevel: 'H', // High error correction to allow for logo overlay
                width: 128,
                margin: 1,
            };

            QRCode.toCanvas(canvas, verificationUrl, qrOptions, function (error: Error | null) {
                if (error) {
                    console.error(error);
                    return;
                }

                if (kopSuratSettings.sematkanLogoDiQRCode && kopSuratSettings.logoUrl) {
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    
                    const logo = new Image();
                    logo.crossOrigin = "Anonymous";
                    logo.src = kopSuratSettings.logoUrl;
                    logo.onload = () => {
                        const logoSize = canvas.width * 0.25; // Logo size is 25% of QR code size
                        const logoX = (canvas.width - logoSize) / 2;
                        const logoY = (canvas.height - logoSize) / 2;
                        
                        // Draw a white background behind the logo
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(logoX, logoY, logoSize, logoSize);
                        
                        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                    };
                }
            });
        }
    }, [surat, kopSuratSettings]);

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

    const getLampiranText = () => {
        const count = surat.attachments?.length || 0;
        if (count === 0) return '-';
        if (count === 1) return 'Satu Berkas';
        return `${count} Berkas`;
    };

    const renderTujuan = () => {
        const s = surat as any;
        const tujuanText = s.tujuan || s.pengirim || 'Internal';

        // Nota Dinas has a structured list of recipients which is handled in its content
        if (surat.tipe === TipeSurat.NOTA_DINAS) {
            return <div className="mb-8"><p>Yth.</p></div>;
        }
        
        let tujuanLines = (tujuanText as string).split('\n');

        return (
             <div className="mb-8">
                <p>Yth.</p>
                {tujuanLines.map((line, index) => (
                    <p key={index} className="font-bold" style={{ paddingLeft: '20px' }}>{line}</p>
                ))}
                <p style={{ paddingLeft: '20px' }}>di Tempat</p>
            </div>
        );
    };
    
    const renderTandaTangan = () => {
        if (surat.tipe !== TipeSurat.KELUAR) return null;
        const s = surat as SuratKeluar;
        if (!s.tandaTangan) return null;
        
        return (
             <div className="flex justify-between items-start mt-16">
                <div className="w-1/3 flex items-start justify-center">
                    {s.tandaTangan.startsWith('data:image') ? (
                        <img src={s.tandaTangan} alt="Tanda Tangan" className="h-24" />
                    ) : (
                        <canvas ref={qrCanvasRef} />
                    )}
                </div>
                <div className="w-1/2 text-left">
                    <p>{s.pembuat.jabatan},</p>
                    <div className="h-24 flex items-center">
                         <div className="flex items-center">
                            {kopSuratSettings.logoUrl && (
                                <img src={kopSuratSettings.logoUrl} alt="Logo" className="h-12 w-12 object-contain mr-3" />
                            )}
                            <div className="text-xs text-slate-600">
                                <p className="font-bold text-base">KEMENIMIPAS</p>
                                <p>Ditandatangani secara elektronik oleh:</p>
                            </div>
                        </div>
                    </div>
                    <p className="font-bold underline">{s.pembuat.nama}</p>
                </div>
            </div>
        )
    }

    const renderTembusan = () => {
        if (surat.tipe !== TipeSurat.KELUAR) return null;
        const s = surat as SuratKeluar;
        if (!s.tembusan || s.tembusan.length === 0) return null;
        
        return (
            <div className="mt-8">
                <p className="font-bold">Tembusan:</p>
                {s.tembusan.map((item, index) => (
                    <p key={index}>{item}</p>
                ))}
            </div>
        )
    }

    const renderIsiSurat = () => {
        if(surat.tipe === TipeSurat.KELUAR || surat.tipe === TipeSurat.NOTA_DINAS) {
            return <div className="isi-surat" dangerouslySetInnerHTML={{ __html: (surat as SuratKeluar | NotaDinas).ringkasan }} />;
        }
        // Fallback for Surat Masuk
        return (
             <div className="isi-surat space-y-4">
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
                    <div className="flex justify-between items-start mb-8">
                         <table style={{ borderCollapse: 'collapse', borderSpacing: 0, width: '70%' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '2px 8px 2px 0', verticalAlign: 'top', width: '80px' }}>Nomor</td>
                                    <td style={{ padding: '2px 8px 2px 0', verticalAlign: 'top' }}>:</td>
                                    <td style={{ padding: '2px 0', verticalAlign: 'top' }}>{surat.nomorSurat}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '2px 8px 2px 0', verticalAlign: 'top', width: '80px' }}>Sifat</td>
                                    <td style={{ padding: '2px 8px 2px 0', verticalAlign: 'top' }}>:</td>
                                    <td style={{ padding: '2px 0', verticalAlign: 'top' }}>{surat.sifat}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '2px 8px 2px 0', verticalAlign: 'top', width: '80px' }}>Lampiran</td>
                                    <td style={{ padding: '2px 8px 2px 0', verticalAlign: 'top' }}>:</td>
                                    <td style={{ padding: '2px 0', verticalAlign: 'top' }}>{getLampiranText()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '2px 8px 2px 0', verticalAlign: 'top', width: '80px' }}>Hal</td>
                                    <td style={{ padding: '2px 8px 2px 0', verticalAlign: 'top' }}>:</td>
                                    <td style={{ padding: '2px 0', verticalAlign: 'top' }}>{surat.perihal}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div>
                            <p>{new Date(surat.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {renderTujuan()}

                    {renderIsiSurat()}
                    
                    {renderTandaTangan()}

                    {renderTembusan()}
                </main>
            </div>
        </div>
    );
};

export default SuratPrintView;