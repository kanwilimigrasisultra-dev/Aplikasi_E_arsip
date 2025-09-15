import React from 'react';
import { AnySurat, KategoriSurat, KopSuratSettings, NotaDinas, TipeSurat, UnitKerja, User } from '../types';

interface LaporanPDFTemplateProps {
    data: AnySurat[];
    reportType: 'surat_masuk' | 'surat_keluar' | 'nota_dinas' | 'rekapitulasi';
    startDate: string;
    endDate: string;
    allKategori: KategoriSurat[];
    allUsers: User[];
    kopSuratSettings: KopSuratSettings;
    unitKerjaList: UnitKerja[];
    currentUser: User;
}

const LaporanPDFTemplate: React.FC<LaporanPDFTemplateProps> = (props) => {
    const { data, reportType, startDate, endDate, kopSuratSettings, unitKerjaList, currentUser, allKategori, allUsers } = props;

    const userUnitKerja = unitKerjaList.find(uk => uk.id === currentUser.unitKerjaId);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID');

    const renderKopSurat = () => {
        if (!userUnitKerja) return null;
        const isCabang = userUnitKerja.tipe === 'Cabang';
        const indukUnitKerja = isCabang ? unitKerjaList.find(uk => uk.id === userUnitKerja.indukId) : null;

        return (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center', borderBottom: '4px solid black', paddingBottom: '8px', marginBottom: '24px' }}>
                {kopSuratSettings.logoUrl && <img src={kopSuratSettings.logoUrl} alt="Logo" style={{ height: '96px', width: '96px', objectFit: 'contain', marginRight: '16px' }}/>}
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '1.125rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{kopSuratSettings.namaKementerian}</h1>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{kopSuratSettings.namaDirektorat}</h2>
                    {isCabang && indukUnitKerja && <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>{indukUnitKerja.nama}</h3>}
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{userUnitKerja.nama}</h3>
                    <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>{userUnitKerja.alamat}</p>
                    <p style={{ fontSize: '0.75rem' }}>Laman: {userUnitKerja.website}, {userUnitKerja.kontak}</p>
                </div>
            </div>
        );
    };

    const renderReportTitle = () => {
        let title = '';
        switch (reportType) {
            case 'surat_masuk': title = 'Laporan Surat Masuk'; break;
            case 'surat_keluar': title = 'Laporan Surat Keluar'; break;
            case 'nota_dinas': title = 'Laporan Nota Dinas'; break;
            case 'rekapitulasi': title = 'Laporan Rekapitulasi Dokumen'; break;
        }
        return (
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'underline' }}>{title}</h3>
                <p style={{ fontSize: '1rem' }}>Periode: {formatDate(startDate)} s/d {formatDate(endDate)}</p>
            </div>
        );
    };
    
    const renderTable = () => {
        const getTujuanOrPengirim = (surat: AnySurat) => {
            if (surat.tipe === TipeSurat.MASUK) return surat.pengirim;
            if (surat.tipe === TipeSurat.KELUAR) return surat.tujuan;
            if (surat.tipe === TipeSurat.NOTA_DINAS) {
                return surat.tujuanUserIds.map(id => allUsers.find(u => u.id === id)?.nama || id).join(', ');
            }
            return '-';
        }

        const headerLabel = {
            surat_masuk: 'Pengirim',
            surat_keluar: 'Tujuan Eksternal',
            nota_dinas: 'Tujuan Internal'
        }[reportType] || 'Pengirim/Tujuan';


        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                         <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>No.</th>
                         <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>Nomor Surat</th>
                         <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>Tanggal</th>
                         <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>Perihal</th>
                         <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>{headerLabel}</th>
                         <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((surat, index) => (
                        <tr key={surat.id}>
                            <td style={{ border: '1px solid #e2e8f0', padding: '6px' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '6px' }}>{surat.nomorSurat}</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '6px' }}>{formatDate(surat.tanggal)}</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '6px' }}>{surat.perihal}</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '6px' }}>{getTujuanOrPengirim(surat)}</td>
                            <td style={{ border: '1px solid #e2e8f0', padding: '6px' }}>{surat.isArchived ? 'Diarsipkan' : 'Aktif'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
    
    const renderRekapitulasi = () => {
        const totalMasuk = data.filter(s => s.tipe === TipeSurat.MASUK).length;
        const totalKeluar = data.filter(s => s.tipe === TipeSurat.KELUAR).length;
        const totalNotaDinas = data.filter(s => s.tipe === TipeSurat.NOTA_DINAS).length;
        
        const rekapKategori: { [key: string]: { masuk: number, keluar: number, nota_dinas: number } } = {};
        allKategori.forEach(k => {
            rekapKategori[k.nama] = { masuk: 0, keluar: 0, nota_dinas: 0 };
        });

        data.forEach(s => {
            const kategori = allKategori.find(k => k.id === s.kategoriId);
            if (kategori) {
                if (s.tipe === TipeSurat.MASUK) rekapKategori[kategori.nama].masuk++;
                else if (s.tipe === TipeSurat.KELUAR) rekapKategori[kategori.nama].keluar++;
                else if (s.tipe === TipeSurat.NOTA_DINAS) rekapKategori[kategori.nama].nota_dinas++;
            }
        });
        
        return (
            <div style={{ fontSize: '12px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>Ringkasan Umum</h4>
                <p>Total Surat Masuk: <strong>{totalMasuk}</strong></p>
                <p>Total Surat Keluar: <strong>{totalKeluar}</strong></p>
                <p>Total Nota Dinas: <strong>{totalNotaDinas}</strong></p>
                <p>Total Keseluruhan Dokumen: <strong>{data.length}</strong></p>
                
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>Rincian Berdasarkan Kategori</h4>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>Kategori</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>Surat Masuk</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>Surat Keluar</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>Nota Dinas</th>
                            <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(rekapKategori).map(([nama, counts]) => (
                            <tr key={nama}>
                                <td style={{ border: '1px solid #e2e8f0', padding: '6px' }}>{nama}</td>
                                <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center' }}>{counts.masuk}</td>
                                <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center' }}>{counts.keluar}</td>
                                <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center' }}>{counts.nota_dinas}</td>
                                <td style={{ border: '1px solid #e2e8f0', padding: '6px', textAlign: 'center' }}><strong>{counts.masuk + counts.keluar + counts.nota_dinas}</strong></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif', color: '#1e293b' }}>
            {renderKopSurat()}
            <main>
                {renderReportTitle()}
                {reportType === 'rekapitulasi' ? renderRekapitulasi() : renderTable()}
            </main>
             <footer style={{ marginTop: '48px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '10px', color: '#64748b' }}>
                <p>Laporan ini dibuat secara otomatis oleh sistem STAR E-ARSIM SULTRA pada tanggal {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}.</p>
                <p>Dicetak oleh: {currentUser.nama}</p>
            </footer>
        </div>
    );
};

export default LaporanPDFTemplate;