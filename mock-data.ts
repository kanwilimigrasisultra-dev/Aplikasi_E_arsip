import {
  User, UserRole, UnitKerja, KategoriSurat, MasalahUtama, KlasifikasiSurat,
  SuratMasuk, SuratKeluar, TipeSurat, SifatSurat, Disposisi, SifatDisposisi, StatusDisposisi,
  FolderArsip, Notifikasi, ActivityLog, AnySurat, KopSuratSettings, AppSettings, SignatureMethod, PenomoranSettings, BrandingSettings, KebijakanRetensi, ApprovalStep, TemplateSurat, Pengumuman
} from './types';

// IDs for consistency
const unitPusatId = 'unit-1';
const unitCabang1Id = 'unit-2';
const unitCabang2Id = 'unit-3';
const userPimpinanId = 'user-1';
const userAdminId = 'user-2';
const userStaf1Id = 'user-3';
const userStaf2Id = 'user-4';
const userManajerialId = 'user-6';
const userSuperAdminId = 'user-5';
const kategoriUmumId = 'kategori-1';
const kategoriKeuanganId = 'kategori-2';
const kategoriSDMId = 'kategori-3';

// Mock Data
export const mockUnitKerja: UnitKerja[] = [
  { id: unitPusatId, nama: 'Kantor Wilayah I', kode: 'WIM.27', tipe: 'Pusat', alamat: 'Jl. Jenderal Sudirman No. 1, Jakarta Pusat', kontak: 'kontak@wilayah1.go.id', website: 'www.wilayah1.go.id' },
  { id: unitCabang1Id, nama: 'Kantor Cabang Jakarta Selatan', kode: 'IMI.1', tipe: 'Cabang', indukId: unitPusatId, alamat: 'Jl. Gatot Subroto No. 2, Jakarta Selatan', kontak: 'kontak@jaksel.go.id', website: 'www.jaksel.go.id' },
  { id: unitCabang2Id, nama: 'Kantor Cabang Jakarta Timur', kode: 'IMI.2', tipe: 'Cabang', indukId: unitPusatId, alamat: 'Jl. DI Panjaitan No. 3, Jakarta Timur', kontak: 'kontak@jaktim.go.id', website: 'www.jaktim.go.id' },
];

export const mockUsers: User[] = [
  { id: userPimpinanId, nama: 'Dr. Budi Santoso', email: 'budi.s@example.com', jabatan: 'Kepala Kantor Wilayah', role: UserRole.PIMPINAN, unitKerjaId: unitPusatId },
  { id: userAdminId, nama: 'Citra Lestari', email: 'citra.l@example.com', jabatan: 'Admin Wilayah', role: UserRole.ADMIN, unitKerjaId: unitPusatId },
  { id: userStaf1Id, nama: 'Adi Nugroho', email: 'adi.n@example.com', jabatan: 'Staf Umum', role: UserRole.STAF, unitKerjaId: unitCabang1Id },
  { id: userStaf2Id, nama: 'Dewi Anggraini', email: 'dewi.a@example.com', jabatan: 'Staf Keuangan', role: UserRole.STAF, unitKerjaId: unitCabang2Id },
  { id: userSuperAdminId, nama: 'Eka Wijaya', email: 'eka.w@example.com', jabatan: 'Super Admin', role: UserRole.SUPER_ADMIN, unitKerjaId: unitPusatId },
  { id: userManajerialId, nama: 'Rina Hartono', email: 'rina.h@example.com', jabatan: 'Manajer Umum', role: UserRole.MANAJERIAL, unitKerjaId: unitPusatId },
];

export const mockKategori: KategoriSurat[] = [
  { id: kategoriUmumId, nama: 'Umum' },
  { id: kategoriKeuanganId, nama: 'Keuangan' },
  { id: kategoriSDMId, nama: 'Sumber Daya Manusia' },
];

export const mockMasalahUtama: MasalahUtama[] = [
  { id: 'mu-1', kode: 'HK', deskripsi: 'Hukum' },
  { id: 'mu-2', kode: 'KU', deskripsi: 'Keuangan' },
  { id: 'mu-3', kode: 'KP', deskripsi: 'Kepegawaian' },
  { id: 'mu-4', kode: 'PR', deskripsi: 'Perencanaan' },
  { id: 'mu-5', kode: 'GR', deskripsi: 'Keimigrasian' },
];

export const mockKlasifikasi: KlasifikasiSurat[] = [
  { id: 'ks-1', masalahUtamaId: 'mu-1', kode: 'HK.01.01', deskripsi: 'Peraturan Perusahaan' },
  { id: 'ks-2', masalahUtamaId: 'mu-2', kode: 'KU.02.03', deskripsi: 'Laporan Anggaran' },
  { id: 'ks-3', masalahUtamaId: 'mu-3', kode: 'KP.03.01', deskripsi: 'Pengangkatan Pegawai' },
  { id: 'ks-4', masalahUtamaId: 'mu-4', kode: 'PR.01.01', deskripsi: 'Rencana Strategis' },
  { id: 'ks-5', masalahUtamaId: 'mu-5', kode: 'GR.01.01', deskripsi: 'Kebijakan Keimigrasian' },
];

const disposisi1: Disposisi = {
  id: 'disp-1',
  pembuat: mockUsers[0],
  tujuan: mockUsers[2],
  tanggal: new Date('2023-10-10T10:00:00Z').toISOString(),
  catatan: 'Segera tindak lanjuti dan buat laporan.',
  sifat: SifatDisposisi.SEGERA,
  status: StatusDisposisi.DIPROSES,
  riwayatStatus: [{ status: StatusDisposisi.DIPROSES, tanggal: new Date().toISOString() }],
};

export const mockSuratMasuk: SuratMasuk[] = [
  { id: 'sm-1', nomorSurat: '123/EXT/X/2023', tanggal: new Date('2023-10-10').toISOString(), perihal: 'Undangan Rapat Koordinasi Nasional', kategoriId: kategoriUmumId, sifat: SifatSurat.PENTING, fileUrl: '#', isArchived: false, tipe: TipeSurat.MASUK, pengirim: 'Kementerian Komunikasi dan Informatika', tanggalDiterima: new Date('2023-10-11').toISOString(), disposisi: [disposisi1], unitKerjaId: unitPusatId, isiRingkasAI: 'Diberitahukan kepada seluruh kepala kantor wilayah untuk menghadiri Rapat Koordinasi Nasional pada tanggal 25 Oktober 2023 untuk membahas strategi digitalisasi.', komentar: [] },
  { id: 'sm-2', nomorSurat: '456/INV/X/2023', tanggal: new Date('2023-10-12').toISOString(), perihal: 'Penawaran Produk ATK', kategoriId: kategoriKeuanganId, sifat: SifatSurat.BIASA, fileUrl: '#', isArchived: true, folderId: 'folder-1', tipe: TipeSurat.MASUK, pengirim: 'PT ATK Sejahtera', tanggalDiterima: new Date('2023-10-13').toISOString(), disposisi: [], unitKerjaId: unitCabang1Id, komentar: [] },
];

const completedApprovalChain: ApprovalStep[] = [
    { id: 'app-1-1', approver: mockUsers.find(u => u.id === userManajerialId)!, status: 'Disetujui', order: 1, timestamp: new Date('2023-10-14').toISOString(), notes: 'OK.'},
    { id: 'app-1-2', approver: mockUsers.find(u => u.id === userPimpinanId)!, status: 'Disetujui', order: 2, timestamp: new Date('2023-10-15').toISOString(), notes: 'Setuju, segera kirim.'},
];

export const mockSuratKeluar: SuratKeluar[] = [
  { id: 'sk-1', nomorSurat: 'NOMOR WIM.27-1.KU.02.03 TAHUN 2023', tanggal: new Date('2023-10-15').toISOString(), perihal: 'Instruksi Persiapan Audit Internal', kategoriId: kategoriKeuanganId, sifat: SifatSurat.SANGAT_PENTING, fileUrl: '#', isArchived: false, tipe: TipeSurat.KELUAR, tujuan: 'Seluruh Kantor Cabang', pembuat: mockUsers[3], jenisSuratKeluar: 'SK', masalahUtamaId: 'mu-2', klasifikasiId: 'ks-2', ringkasan: 'Sehubungan dengan akan dilaksanakannya audit internal tahunan, dengan ini kami menginstruksikan kepada seluruh kepala kantor cabang untuk segera mempersiapkan seluruh dokumen keuangan dan operasional yang diperlukan. Mohon agar semua laporan diselesaikan paling lambat tanggal 30 Oktober 2023. Terima kasih.', unitKerjaId: unitPusatId, tandaTangan: 'SIGNED_WITH_QR', status: 'Terkirim', version: 1, history: [], approvalChain: completedApprovalChain, komentar: [] },
  { id: 'sk-2', nomorSurat: 'WIM.27.HK.01.01-1', tanggal: new Date('2023-10-18').toISOString(), perihal: 'Balasan Undangan Rapat Koordinasi Nasional', kategoriId: kategoriUmumId, sifat: SifatSurat.BIASA, fileUrl: '#', isArchived: true, folderId: 'folder-2', tipe: TipeSurat.KELUAR, tujuan: 'Kementerian Komunikasi dan Informatika', pembuat: mockUsers[2], jenisSuratKeluar: 'Biasa', masalahUtamaId: 'mu-1', klasifikasiId: 'ks-1', ringkasan: 'Menanggapi surat undangan nomor 123/EXT/X/2023, dengan ini kami mengonfirmasi kehadiran Kepala Kantor Wilayah I, Dr. Budi Santoso, dalam Rapat Koordinasi Nasional yang akan diselenggarakan pada tanggal 25 Oktober 2023. Terima kasih atas undangannya.', tandaTangan: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', unitKerjaId: unitPusatId, suratAsliId: 'sm-1', status: 'Terkirim', version: 1, history: [], approvalChain: completedApprovalChain.slice(0,1), komentar: [] },
  { id: 'sk-3', nomorSurat: 'WIM.27.IMI.1-KP.03.01-1', tanggal: new Date('2023-11-02').toISOString(), perihal: 'Surat Panggilan Wawancara', kategoriId: kategoriSDMId, sifat: SifatSurat.PENTING, fileUrl: '#', isArchived: false, tipe: TipeSurat.KELUAR, tujuan: 'Calon Pegawai Sdr. X', pembuat: mockUsers[2], jenisSuratKeluar: 'Biasa', masalahUtamaId: 'mu-3', klasifikasiId: 'ks-3', ringkasan: 'Menindaklanjuti proses rekrutmen, kami mengundang Saudara untuk wawancara pada jadwal yang telah ditentukan.', unitKerjaId: unitCabang1Id, status: 'Draf', version: 1, history: [], approvalChain: [ { id: 'app-3-1', approver: mockUsers.find(u=> u.role === UserRole.PIMPINAN)!, status: 'Menunggu', order: 1 } ], komentar: [] },
  { id: 'sk-4', nomorSurat: 'WIM.27.PR.01.01-2', tanggal: new Date('2023-11-05').toISOString(), perihal: 'Pengajuan Rencana Strategis 2024', kategoriId: kategoriUmumId, sifat: SifatSurat.PENTING, fileUrl: '#', isArchived: false, tipe: TipeSurat.KELUAR, tujuan: 'Direktorat Jenderal', pembuat: mockUsers[3], jenisSuratKeluar: 'Biasa', masalahUtamaId: 'mu-4', klasifikasiId: 'ks-4', ringkasan: 'Berikut kami sampaikan draf Rencana Strategis untuk tahun 2024 untuk persetujuan lebih lanjut.', unitKerjaId: unitPusatId, status: 'Menunggu Persetujuan', version: 1, history: [], approvalChain: [ { id: 'app-4-1', approver: mockUsers.find(u=> u.id === userManajerialId)!, status: 'Menunggu', order: 1 }, { id: 'app-4-2', approver: mockUsers.find(u=> u.id === userPimpinanId)!, status: 'Menunggu', order: 2 } ], komentar: [] },
  { id: 'sk-5', nomorSurat: 'WIM.27.IMI.2-GR.01.01-3', tanggal: new Date('2023-11-01').toISOString(), perihal: 'Pemberitahuan Kebijakan Keimigrasian Baru', kategoriId: kategoriUmumId, sifat: SifatSurat.RAHASIA, fileUrl: '#', isArchived: false, tipe: TipeSurat.KELUAR, tujuan: 'Internal', pembuat: mockUsers[3], jenisSuratKeluar: 'Biasa', masalahUtamaId: 'mu-5', klasifikasiId: 'ks-5', ringkasan: 'Versi awal kebijakan keimigrasian.', unitKerjaId: unitPusatId, status: 'Revisi', version: 2, history: [{ version: 1, perihal: 'Pemberitahuan Kebijakan Imigrasi Baru', ringkasan: 'Versi pertama.' }], approvalChain: [ { id: 'app-5-1', approver: mockUsers.find(u=> u.id === userManajerialId)!, status: 'Ditolak', order: 1, notes: 'Mohon tambahkan detail mengenai implementasi di lapangan.', timestamp: new Date('2023-11-04').toISOString() }, { id: 'app-5-2', approver: mockUsers.find(u=> u.id === userPimpinanId)!, status: 'Menunggu', order: 2 } ], komentar: [] },
];

export const mockAllSurat: AnySurat[] = [...mockSuratMasuk, ...mockSuratKeluar];

export const mockFolders: FolderArsip[] = [
  { id: 'folder-1', nama: 'Keuangan & Anggaran' },
  { id: 'folder-2', nama: 'Kerja Sama Eksternal' },
  { id: 'folder-3', nama: 'Dokumen Proyek' },
];

export const mockNotifikasi: Notifikasi[] = [
  { id: 'notif-1', suratId: 'sm-1', pesan: 'Disposisi baru untuk surat "Undangan Rapat Koordinasi Nasional"', tanggal: new Date().toISOString(), isRead: false },
  { id: 'notif-2', suratId: 'sm-2', pesan: 'Surat masuk baru "Penawaran Produk ATK"', tanggal: new Date(Date.now() - 86400000).toISOString(), isRead: true },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 'log-1', user: 'Citra Lestari', action: 'Membuat surat keluar "Instruksi Persiapan Audit Internal"', timestamp: new Date().toISOString() },
  { id: 'log-2', user: 'Dr. Budi Santoso', action: 'Memberikan disposisi pada surat "Undangan Rapat Koordinasi Nasional"', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'log-3', user: 'Adi Nugroho', action: 'Mengarsipkan surat "Penawaran Produk ATK"', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
];

export const mockPengumuman: Pengumuman[] = [
    {
        id: 'pengumuman-1',
        teks: 'Akan diadakan maintenance sistem pada hari Sabtu pukul 22:00. Seluruh pengguna diharapkan untuk menyimpan pekerjaannya sebelum waktu tersebut.',
        tanggalMulai: new Date().toISOString().split('T')[0],
        tanggalSelesai: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // Aktif selama 3 hari
        isActive: true,
        pembuat: mockUsers.find(u => u.id === userSuperAdminId)!,
        timestamp: new Date().toISOString(),
    },
    {
        id: 'pengumuman-2',
        teks: 'Selamat Hari Raya Idul Fitri, mohon maaf lahir dan batin.',
        tanggalMulai: '2023-04-20',
        tanggalSelesai: '2023-04-25',
        isActive: true,
        pembuat: mockUsers.find(u => u.id === userAdminId)!,
        timestamp: '2023-04-20T10:00:00Z',
    }
];

export const mockKopSuratSettings: KopSuratSettings = {
    logoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlMmU4ZjAiLz48dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPkVBPC90ZXh0Pjwvc3ZnPg==',
    namaKementerian: 'KEMENTERIAN FIKSI INDONESIA',
    namaDirektorat: 'DIREKTORAT JENDERAL PERSURATAN DIGITAL'
};

export const mockAppSettings: AppSettings = {
    notifications: {
        disposisiBaru: true,
        suratMasukBaru: true,
        statusDisposisiUpdate: false,
    },
    theme: {
        darkMode: false,
    },
    signatureMethod: SignatureMethod.GAMBAR,
};

export const mockPenomoranSettings: PenomoranSettings = {
    biasa: '[KODE_UNIT_KERJA_LENGKAP].[KODE_KLASIFIKASI_ARSIP]-[NOMOR_URUT_PER_MASALAH]',
    sk: 'NOMOR [KODE_UNIT_KERJA_LENGKAP]-[NOMOR_URUT_PER_MASALAH].[KODE_KLASIFIKASI_ARSIP] TAHUN [TAHUN_SAAT_INI]',
    resetSequence: 'yearly',
};

export const mockBrandingSettings: BrandingSettings = {
    appLogoUrl: '',
    loginLogo1Url: '',
    loginLogo2Url: '',
    loginLogo3Url: '',
};

export const mockKebijakanRetensi: KebijakanRetensi[] = [
    { id: 'ret-1', kategoriId: kategoriKeuanganId, masaRetensiAktif: 2, masaRetensiInaktif: 8, tindakanFinal: 'Permanen' },
    { id: 'ret-2', kategoriId: kategoriUmumId, masaRetensiAktif: 1, masaRetensiInaktif: 4, tindakanFinal: 'Musnahkan' },
];

// FIX: Add mockTemplates export
export const mockTemplates: TemplateSurat[] = [
  {
    id: 'tpl-1',
    nama: 'Undangan Rapat Internal',
    perihal: 'Undangan Rapat Internal',
    kategoriId: kategoriUmumId,
    sifat: SifatSurat.BIASA,
    jenisSuratKeluar: 'Biasa',
    masalahUtamaId: 'mu-4', // Perencanaan
    ringkasan: '<p>Dengan hormat,</p><p>Sehubungan dengan agenda rutin, kami mengundang Bapak/Ibu untuk menghadiri rapat internal yang akan diselenggarakan pada:</p><p>Hari/Tanggal: [Isi Tanggal]</p><p>Waktu: [Isi Waktu]</p><p>Tempat: [Isi Tempat]</p><p>Agenda: [Isi Agenda]</p><p><br></p><p>Demikian undangan ini kami sampaikan, atas perhatian dan kehadirannya diucapkan terima kasih.</p>'
  },
  {
    id: 'tpl-2',
    nama: 'SK Pengangkatan Pegawai',
    perihal: 'Surat Keputusan Pengangkatan Pegawai Tetap',
    kategoriId: kategoriSDMId,
    sifat: SifatSurat.PENTING,
    jenisSuratKeluar: 'SK',
    masalahUtamaId: 'mu-3', // Kepegawaian
    ringkasan: '<p><strong>MEMUTUSKAN:</strong></p><p>Menetapkan,</p><p><strong>PERTAMA:</strong> Mengangkat Sdr/i [Nama Pegawai] sebagai Pegawai Tetap.</p><p><strong>KEDUA:</strong> Keputusan ini berlaku sejak tanggal ditetapkan.</p>'
  }
];