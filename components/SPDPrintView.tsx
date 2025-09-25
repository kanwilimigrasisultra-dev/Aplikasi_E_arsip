import React from 'react';
import { PerjalananDinas, SuratKeluar, KopSuratSettings, UnitKerja, User, UserRole } from '../types';

interface SPDPrintViewProps {
  pd: PerjalananDinas;
  suratTugas: SuratKeluar;
  allUsers: User[];
  kopSuratSettings: KopSuratSettings;
  unitKerjaList: UnitKerja[];
}

const SPDPrintView: React.FC<SPDPrintViewProps> = ({ pd, suratTugas, allUsers, kopSuratSettings, unitKerjaList }) => {
    
    const pejabatPembuatKomitmen = allUsers.find(u => u.id === pd.pejabatPembuatKomitmenId) || allUsers.find(u => u.role === UserRole.PIMPINAN && u.unitKerjaId === suratTugas.unitKerjaId) || suratTugas.pembuat;
    const penandatanganHalamanDua = allUsers.find(u => u.id === pd.penandatanganPihakLainId) || pejabatPembuatKomitmen;
    const unitKerjaPembuat = unitKerjaList.find(uk => uk.id === suratTugas.unitKerjaId);
    
    const pegawaiUtama = allUsers.find(u => u.id === pd.pegawaiUtamaId);
    const pengikut = pd.pengikut.map(p => ({ user: allUsers.find(u => u.id === p.userId), keterangan: p.keterangan }));

    const calculateDuration = () => {
        const start = new Date(pd.tanggalBerangkat);
        const end = new Date(pd.tanggalKembali);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
        return `${diffDays} Hari`;
    };

    return (
        <div style={{ fontFamily: '"Times New Roman", Times, serif', color: 'black' }}>
            {/* Page 1 */}
            <div className="bg-white p-8 mx-auto" style={{ width: '210mm', minHeight: '297mm', fontSize: '12pt' }}>
                <header className="flex justify-between items-start mb-2">
                    <div className="w-1/4">
                        <img src={kopSuratSettings.logoUrl} alt="Logo" style={{ width: '80px', height: '80px' }} />
                    </div>
                    <div className="w-3/4 text-center">
                        <p className="font-bold">{kopSuratSettings.namaKementerian}</p>
                        <p>LAMPIRAN I</p>
                        <p>PERATURAN MENTERI KEUANGAN REPUBLIK INDONESIA</p>
                        <p>NOMOR 113/PMK.05/2012</p>
                        <p>TENTANG PERJALANAN DINAS DALAM NEGERI BAGI PEJABAT NEGARA,</p>
                        <p>PEGAWAI NEGERI, DAN PEGAWAI TIDAK TETAP</p>
                    </div>
                </header>
                
                <div className="flex justify-end">
                    <table className="border-collapse border border-black w-64 text-sm">
                         <tbody>
                            <tr><td className="border border-black p-1">Lembar ke</td><td className="border border-black p-1">: I</td></tr>
                            <tr><td className="border border-black p-1">Kode No.</td><td className="border border-black p-1">:</td></tr>
                            <tr><td className="border border-black p-1">Nomor</td><td className="border border-black p-1">: {suratTugas.nomorSurat}</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-center font-bold text-lg underline my-4">SURAT PERJALANAN DINAS (SPD)</h2>
                
                <table className="w-full border-collapse border border-black text-sm">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1 w-8 text-center">1</td>
                            <td className="border border-black p-1 w-1/3">Pejabat Pembuat Komitmen</td>
                            <td className="border border-black p-1" colSpan={2}>{unitKerjaPembuat?.nama}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 text-center">2</td>
                            <td className="border border-black p-1">Nama/NIP Pegawai yang melaksanakan Perjalanan Dinas</td>
                            <td className="border border-black p-1" colSpan={2}>{pegawaiUtama?.nama} / {pegawaiUtama?.nip}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 text-center">3</td>
                            <td className="border border-black p-1">a. Pangkat dan Golongan ruang</td>
                            <td className="border border-black p-1" colSpan={2}>{pegawaiUtama?.pangkatGolongan}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 text-center"></td>
                            <td className="border border-black p-1">b. Jabatan/Instansi</td>
                            <td className="border border-black p-1" colSpan={2}>{pegawaiUtama?.jabatan} / {unitKerjaList.find(u => u.id === pegawaiUtama?.unitKerjaId)?.nama}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 text-center"></td>
                            <td className="border border-black p-1">c. Tingkat Biaya Perjalanan Dinas</td>
                            <td className="border border-black p-1" colSpan={2}>{pd.tingkatBiaya}</td>
                        </tr>
                         <tr>
                            <td className="border border-black p-1 text-center">4</td>
                            <td className="border border-black p-1">Maksud Perjalanan Dinas</td>
                            <td className="border border-black p-1" colSpan={2}>{pd.tujuanPerjalanan}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 text-center">5</td>
                            <td className="border border-black p-1">Alat angkut yang dipergunakan</td>
                            <td className="border border-black p-1" colSpan={2}>{pd.alatAngkut}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 text-center">6</td>
                            <td className="border border-black p-1">a. Tempat berangkat</td>
                            <td className="border border-black p-1" colSpan={2}>{pd.tempatBerangkat}</td>
                        </tr>
                         <tr>
                            <td className="border border-black p-1 text-center"></td>
                            <td className="border border-black p-1">b. Tempat tujuan</td>
                            <td className="border border-black p-1" colSpan={2}>{pd.kotaTujuan}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 text-center">7</td>
                            <td className="border border-black p-1">a. Lamanya Perjalanan Dinas</td>
                            <td className="border border-black p-1" colSpan={2}>{calculateDuration()}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 text-center"></td>
                            <td className="border border-black p-1">b. Tanggal berangkat</td>
                            <td className="border border-black p-1" colSpan={2}>{new Date(pd.tanggalBerangkat).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 text-center"></td>
                            <td className="border border-black p-1">c. Tanggal harus kembali/tiba ditempat baru *)</td>
                            <td className="border border-black p-1" colSpan={2}>{new Date(pd.tanggalKembali).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1 align-top text-center">8</td>
                            <td className="border border-black p-1 align-top">Pengikut :</td>
                            <td className="border border-black p-1" colSpan={2}>
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-center">
                                            <th className="font-normal w-1/3">Nama</th>
                                            <th className="font-normal w-1/3">Tanggal Lahir</th>
                                            <th className="font-normal w-1/3">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...Array(5)].map((_, i) => {
                                            const p = pengikut[i];
                                            return (
                                                <tr key={p?.user?.id || `empty-${i}`}>
                                                    <td className="p-1 text-left h-6">{p?.user ? `${i + 1}. ${p.user.nama}` : ''}</td>
                                                    <td className="p-1 text-left h-6">{p?.user?.nip || ''}</td>
                                                    <td className="p-1 text-left h-6">{p?.keterangan || ''}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                         <tr>
                            <td className="border border-black p-1 text-center align-top">9</td>
                            <td className="border border-black p-1 align-top">
                                <p>Pembebanan Anggaran</p>
                                <p className="pl-4">a. Instansi</p>
                                <p className="pl-4">b. Akun</p>
                            </td>
                            <td className="border border-black p-1 align-top" colSpan={2}>
                                <div style={{ height: '1.5rem' }}></div> {/* Spacer for alignment */}
                                <p>{pd.pembebananAnggaranInstansi}</p>
                                <p>{pd.pembebananAnggaranAkun}</p>
                            </td>
                        </tr>
                         <tr>
                            <td className="border border-black p-1 text-center align-top">10</td>
                            <td className="border border-black p-1 align-top">Keterangan lain-lain</td>
                            <td className="border border-black p-1 align-top" colSpan={2}>
                                <table className="text-sm">
                                    <tbody>
                                        <tr>
                                            <td className="pr-2 align-top">Surat Tugas Nomor</td>
                                            <td className="align-top">:</td>
                                            <td className="pl-2 align-top">{pd.dasarSuratTugasNomor}</td>
                                        </tr>
                                        <tr>
                                            <td className="pr-2 align-top">Tanggal</td>
                                            <td className="align-top">:</td>
                                            <td className="pl-2 align-top">{pd.dasarSuratTugasTanggal ? new Date(pd.dasarSuratTugasTanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : ''}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                {suratTugas.ringkasan && <p className="mt-2">{suratTugas.ringkasan.replace(/<[^>]+>/g, '')}</p>}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-xs mt-2">*) Coret yang tidak perlu</p>

                <div className="flex justify-end mt-8">
                    <div className="w-1/2 text-sm">
                        <p>DIKELUARKAN DI : {unitKerjaPembuat?.nama.split(' ').pop()?.toUpperCase()}</p>
                        <p>PADA TANGGAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : {new Date(suratTugas.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                        <p className="font-bold text-center mt-2">Pejabat pembuat komitmen,</p>
                        <div style={{height: '80px'}}></div>
                        <p className="text-center font-bold underline">{pejabatPembuatKomitmen?.nama}</p>
                        <p className="text-center">NIP. {pejabatPembuatKomitmen?.nip}</p>
                    </div>
                </div>

            </div>
            
            <div style={{ breakAfter: 'page' }}></div>

            {/* Page 2 */}
            <div className="bg-white p-8 mx-auto" style={{ width: '210mm', minHeight: '297mm', fontSize: '12pt' }}>
                 <p className="text-right">- 2 -</p>
                 <table className="w-full border-collapse border border-black text-sm">
                     <tbody>
                        <tr>
                            <td className="w-1/2 border-r border-black p-1"></td>
                            <td className="w-1/2 p-1">
                                <p>I. Berangkat dari: {pd.tempatBerangkat}</p>
                                <p>(Tempat Kedudukan)</p>
                                <p>Ke: {pd.kotaTujuan}</p>
                                <p>Pada Tanggal: {new Date(pd.tanggalBerangkat).toLocaleDateString('id-ID')}</p>
                                <p className="text-center mt-4">Kepala Kantor Wilayah</p>
                                <div style={{height: '60px'}}></div>
                                <p className="text-center font-bold underline">{penandatanganHalamanDua?.nama}</p>
                                <p className="text-center">NIP. {penandatanganHalamanDua?.nip}</p>
                            </td>
                        </tr>
                        {[...Array(4)].map((_, i) => (
                             <tr key={i}>
                                <td className="border-t border-r border-black p-1 h-32 align-top">
                                    <p>{['II', 'III', 'IV', 'V'][i]}. Tiba di</p>
                                    <p>Pada Tanggal</p>
                                    <p>Kepala</p>
                                </td>
                                <td className="border-t border-black p-1 align-top">
                                    <p>Berangkat dari</p>
                                    <p>Ke</p>
                                    <p>Pada Tanggal</p>
                                    <p>Kepala</p>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td className="border-t border-r border-black p-1 h-32 align-top">
                                <p>VI. Tiba di: {pd.tempatBerangkat}</p>
                                <p>(Tempat Kedudukan)</p>
                                <p>Pada Tanggal: {new Date(pd.tanggalKembali).toLocaleDateString('id-ID')}</p>
                                <p className="text-center mt-4">Pejabat Pembuat Komitmen</p>
                                <div style={{height: '60px'}}></div>
                                <p className="text-center font-bold underline">{pejabatPembuatKomitmen?.nama}</p>
                                <p className="text-center">NIP. {pejabatPembuatKomitmen?.nip}</p>
                            </td>
                            <td className="border-t border-black p-1 align-top">
                                <p>Telah diperiksa dengan keterangan bahwa perjalanan</p>
                                <p>tersebut atas perintahnya dan semata-mata untuk kepentingan</p>
                                <p>jabatan dalam waktu yang sesingkat-singkatnya.</p>
                                <p className="text-center mt-4">Pejabat Pembuat Komitmen</p>
                                <div style={{height: '60px'}}></div>
                                <p className="text-center font-bold underline">{pejabatPembuatKomitmen?.nama}</p>
                                <p className="text-center">NIP. {pejabatPembuatKomitmen?.nip}</p>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="border-t border-black p-1">
                                VII. Catatan Lain-lain
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="border-t border-black p-1">
                                <p>VIII. PERHATIAN:</p>
                                <p>PPK yang menerbitkan SPD, pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendahara pengeluaran bertanggung jawab berdasarkan peraturan-peraturan Keuangan Negara apabila Negara menderita rugi akibat kesalahan, kelalaian, dan kealpaannya.</p>
                            </td>
                        </tr>
                     </tbody>
                 </table>
            </div>

        </div>
    );
};

export default SPDPrintView;