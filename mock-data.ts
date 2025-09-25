import {
  User, UserRole, UnitKerja, KategoriSurat, MasalahUtama, KlasifikasiSurat,
  SuratMasuk, SuratKeluar, TipeSurat, SifatSurat, Disposisi, SifatDisposisi, StatusDisposisi,
  FolderArsip, Notifikasi, ActivityLog, AnySurat, KopSuratSettings, AppSettings, SignatureMethod, PenomoranSettings, BrandingSettings, KebijakanRetensi, ApprovalStep, TemplateSurat, Pengumuman, NotaDinas, Tugas, PermintaanLaporan, PengirimanLaporan, Tiket, BalasanTiket, PerjalananDinas, RincianBiaya, ChatRoom, ChatMessage, MasterBiaya
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
  { id: userPimpinanId, nama: 'Dr. Budi Santoso', nip: '198104072007031002', pangkatGolongan: 'Pembina Utama Muda (IV/c)', email: 'budi.s@example.com', jabatan: 'Kepala Kantor Wilayah', role: UserRole.PIMPINAN, unitKerjaId: unitPusatId, tanggalLahir: '1981-04-07' },
  { id: userAdminId, nama: 'Citra Lestari', nip: '198505102010122001', pangkatGolongan: 'Penata Tingkat I (III/d)', email: 'citra.l@example.com', jabatan: 'Admin Wilayah', role: UserRole.ADMIN, unitKerjaId: unitPusatId, tanggalLahir: '1985-05-10' },
  { id: userStaf1Id, nama: 'Adi Nugroho', nip: '199001152015031002', pangkatGolongan: 'Penata Muda (III/a)', email: 'adi.n@example.com', jabatan: 'Staf Umum', role: UserRole.STAF, unitKerjaId: unitCabang1Id, tanggalLahir: '1990-01-15' },
  { id: userStaf2Id, nama: 'Dewi Anggraini', nip: '199208202016012003', pangkatGolongan: 'Penata Muda (III/a)', email: 'dewi.a@example.com', jabatan: 'Staf Keuangan', role: UserRole.STAF, unitKerjaId: unitCabang2Id, tanggalLahir: '1992-08-20' },
  { id: userSuperAdminId, nama: 'Eka Wijaya', nip: '198001012005011001', pangkatGolongan: 'Pembina Utama (IV/e)', email: 'eka.w@example.com', jabatan: 'Super Admin', role: UserRole.SUPER_ADMIN, unitKerjaId: unitPusatId, tanggalLahir: '1980-01-01' },
  { id: userManajerialId, nama: 'Rina Hartono', nip: '198303032008012002', pangkatGolongan: 'Pembina (IV/a)', email: 'rina.h@example.com', jabatan: 'Manajer Umum', role: UserRole.MANAJERIAL, unitKerjaId: unitPusatId, tanggalLahir: '1983-03-03' },
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
  { id: 'ks-6', masalahUtamaId: 'mu-3', kode: 'KP.05.02', deskripsi: 'Perjalanan Dinas'},
];

export const mockMasterBiaya: MasterBiaya[] = [
    { id: 'mb-1', namaBiaya: 'Uang Harian Gol. III', satuan: 'Hari', tarifDefault: 350000 },
    { id: 'mb-2', namaBiaya: 'Transportasi Lokal (DKI Jakarta)', satuan: 'Hari', tarifDefault: 150000 },
    { id: 'mb-3', namaBiaya: 'Akomodasi Tipe A (Hotel Bintang 3)', satuan: 'Malam', tarifDefault: 750000 },
    { id: 'mb-4', namaBiaya: 'Tiket Pesawat PP (Ekonomi)', satuan: 'Tiket', tarifDefault: 1500000 },
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
  { id: 'sm-1', nomorAgenda: 1, nomorSurat: '123/EXT/X/2023', tanggal: new Date('2023-10-10').toISOString(), perihal: 'Undangan Rapat Koordinasi Nasional', kategoriId: kategoriUmumId, sifat: SifatSurat.PENTING, fileUrl: '#', isArchived: false, tipe: TipeSurat.MASUK, pengirim: 'Kementerian Komunikasi dan Informatika', tanggalDiterima: new Date('2023-10-11').toISOString(), disposisi: [disposisi1], unitKerjaId: unitPusatId, isiRingkasAI: 'Diberitahukan kepada seluruh kepala kantor wilayah untuk menghadiri Rapat Koordinasi Nasional pada tanggal 25 Oktober 2023 untuk membahas strategi digitalisasi.', komentar: [], tugasTerkait: [], dokumenTerkait: [] },
  { id: 'sm-2', nomorAgenda: 2, nomorSurat: '456/INV/X/2023', tanggal: new Date('2023-10-12').toISOString(), perihal: 'Penawaran Produk ATK', kategoriId: kategoriKeuanganId, sifat: SifatSurat.BIASA, fileUrl: '#', isArchived: true, folderId: 'folder-1', tipe: TipeSurat.MASUK, pengirim: 'PT ATK Sejahtera', tanggalDiterima: new Date('2023-10-13').toISOString(), disposisi: [], unitKerjaId: unitCabang1Id, komentar: [], tugasTerkait: [], dokumenTerkait: [] },
];

const completedApprovalChain: ApprovalStep[] = [
    { id: 'app-1-1', approver: mockUsers.find(u => u.id === userManajerialId)!, status: 'Disetujui', order: 1, timestamp: new Date('2023-10-14').toISOString(), notes: 'OK.'},
    { id: 'app-1-2', approver: mockUsers.find(u => u.id === userPimpinanId)!, status: 'Disetujui', order: 2, timestamp: new Date('2023-10-15').toISOString(), notes: 'Setuju, segera kirim.'},
];

export const mockSuratKeluar: SuratKeluar[] = [
  { id: 'sk-1', nomorAgenda: 3, nomorSurat: 'NOMOR WIM.27-1.KU.02.03 TAHUN 2023', tanggal: new Date('2023-10-15').toISOString(), perihal: 'Instruksi Persiapan Audit Internal', kategoriId: kategoriKeuanganId, sifat: SifatSurat.SANGAT_PENTING, fileUrl: '#', isArchived: false, tipe: TipeSurat.KELUAR, tujuan: 'Seluruh Kantor Cabang', pembuat: mockUsers[3], jenisSuratKeluar: 'SK', masalahUtamaId: 'mu-2', klasifikasiId: 'ks-2', ringkasan: 'Sehubungan dengan akan dilaksanakannya audit internal tahunan, dengan ini kami menginstruksikan kepada seluruh kepala kantor cabang untuk segera mempersiapkan seluruh dokumen keuangan dan operasional yang diperlukan. Mohon agar semua laporan diselesaikan paling lambat tanggal 30 Oktober 2023. Terima kasih.', unitKerjaId: unitPusatId, tandaTangan: 'SIGNED_WITH_QR', status: 'Terkirim', version: 1, history: [], approvalChain: completedApprovalChain, komentar: [], tugasTerkait: [], dokumenTerkait: [] },
  { id: 'sk-2', nomorAgenda: 4, nomorSurat: 'WIM.27.HK.01.01-1', tanggal: new Date('2023-10-18').toISOString(), perihal: 'Balasan Undangan Rapat Koordinasi Nasional', kategoriId: kategoriUmumId, sifat: SifatSurat.BIASA, fileUrl: '#', isArchived: true, folderId: 'folder-2', tipe: TipeSurat.KELUAR, tujuan: 'Kementerian Komunikasi dan Informatika', pembuat: mockUsers[2], jenisSuratKeluar: 'Biasa', masalahUtamaId: 'mu-1', klasifikasiId: 'ks-1', ringkasan: 'Menanggapi surat undangan nomor 123/EXT/X/2023, dengan ini kami mengonfirmasi kehadiran Kepala Kantor Wilayah I, Dr. Budi Santoso, dalam Rapat Koordinasi Nasional yang akan diselenggarakan pada tanggal 25 Oktober 2023. Terima kasih atas undangannya.', tandaTangan: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', unitKerjaId: unitPusatId, suratAsliId: 'sm-1', status: 'Terkirim', version: 1, history: [], approvalChain: completedApprovalChain.slice(0,1), komentar: [], tugasTerkait: [], dokumenTerkait: [] },
  { id: 'sk-3', nomorAgenda: 5, nomorSurat: 'WIM.27.IMI.1-KP.03.01-1', tanggal: new Date('2023-11-02').toISOString(), perihal: 'Surat Panggilan Wawancara', kategoriId: kategoriSDMId, sifat: SifatSurat.PENTING, fileUrl: '#', isArchived: false, tipe: TipeSurat.KELUAR, tujuan: 'Calon Pegawai Sdr. X', pembuat: mockUsers[2], jenisSuratKeluar: 'Biasa', masalahUtamaId: 'mu-3', klasifikasiId: 'ks-3', ringkasan: 'Menindaklanjuti proses rekrutmen, kami mengundang Saudara untuk wawancara pada jadwal yang telah ditentukan.', unitKerjaId: unitCabang1Id, status: 'Draf', version: 1, history: [], approvalChain: [ { id: 'app-3-1', approver: mockUsers.find(u=> u.role === UserRole.PIMPINAN)!, status: 'Menunggu', order: 1 } ], komentar: [], tugasTerkait: [], dokumenTerkait: [] },
  { id: 'sk-4', nomorAgenda: 6, nomorSurat: 'WIM.27.PR.01.01-2', tanggal: new Date('2023-11-05').toISOString(), perihal: 'Pengajuan Rencana Strategis 2024', kategoriId: kategoriUmumId, sifat: SifatSurat.PENTING, fileUrl: '#', isArchived: false, tipe: TipeSurat.KELUAR, tujuan: 'Direktorat Jenderal', pembuat: mockUsers[3], jenisSuratKeluar: 'Biasa', masalahUtamaId: 'mu-4', klasifikasiId: 'ks-4', ringkasan: 'Berikut kami sampaikan draf Rencana Strategis untuk tahun 2024 untuk persetujuan lebih lanjut.', unitKerjaId: unitPusatId, status: 'Menunggu Persetujuan', version: 1, history: [], approvalChain: [ { id: 'app-4-1', approver: mockUsers.find(u=> u.id === userManajerialId)!, status: 'Menunggu', order: 1 }, { id: 'app-4-2', approver: mockUsers.find(u=> u.id === userPimpinanId)!, status: 'Menunggu', order: 2 } ], komentar: [], tugasTerkait: [], dokumenTerkait: [] },
  { id: 'sk-5', nomorAgenda: 7, nomorSurat: 'WIM.27.IMI.2-GR.01.01-3', tanggal: new Date('2023-11-01').toISOString(), perihal: 'Pemberitahuan Kebijakan Keimigrasian Baru', kategoriId: kategoriUmumId, sifat: SifatSurat.RAHASIA, fileUrl: '#', isArchived: false, tipe: TipeSurat.KELUAR, tujuan: 'Internal', pembuat: mockUsers[3], jenisSuratKeluar: 'Biasa', masalahUtamaId: 'mu-5', klasifikasiId: 'ks-5', ringkasan: 'Versi awal kebijakan keimigrasian.', unitKerjaId: unitPusatId, status: 'Revisi', version: 2, history: [{ version: 1, perihal: 'Pemberitahuan Kebijakan Imigrasi Baru', ringkasan: 'Versi pertama.' }], approvalChain: [ { id: 'app-5-1', approver: mockUsers.find(u=> u.id === userManajerialId)!, status: 'Ditolak', order: 1, notes: 'Mohon tambahkan detail mengenai implementasi di lapangan.', timestamp: new Date('2023-11-04').toISOString() }, { id: 'app-5-2', approver: mockUsers.find(u=> u.id === userPimpinanId)!, status: 'Menunggu', order: 2 } ], komentar: [], tugasTerkait: [], dokumenTerkait: [] },
  { id: 'sk-6', nomorAgenda: 9, nomorSurat: 'WIM.27.KP.05.02-1', tanggal: new Date('2023-11-20').toISOString(), perihal: 'Perintah Perjalanan Dinas a.n. Adi Nugroho', kategoriId: kategoriSDMId, sifat: SifatSurat.PENTING, fileUrl: '#', isArchived: false, tipe: TipeSurat.KELUAR, tujuan: 'Ybs.', pembuat: mockUsers[3], jenisSuratKeluar: 'SPPD', masalahUtamaId: 'mu-3', klasifikasiId: 'ks-6', ringkasan: 'Melaksanakan perjalanan dinas dalam rangka monitoring dan evaluasi ke Kantor Cabang Jakarta Selatan.', unitKerjaId: unitPusatId, status: 'Disetujui', version: 1, history: [], approvalChain: completedApprovalChain, komentar: [], tugasTerkait: [], dokumenTerkait: [], perjalananDinasId: 'pd-1' }
];

export const mockNotaDinas: NotaDinas[] = [
    { id: 'nd-1', nomorAgenda: 8, nomorSurat: 'ND-001/WIM.27/2023', tanggal: new Date('2023-11-10').toISOString(), perihal: 'Pemberitahuan Cuti Bersama', kategoriId: kategoriSDMId, sifat: SifatSurat.BIASA, fileUrl: '#', isArchived: false, tipe: TipeSurat.NOTA_DINAS, tujuanUserIds: [userStaf1Id, userStaf2Id, userManajerialId], pembuat: mockUsers.find(u => u.id === userAdminId)!, status: 'Terkirim', ringkasan: 'Diberitahukan kepada seluruh pegawai bahwa cuti bersama dalam rangka hari raya akan dilaksanakan pada tanggal...', unitKerjaId: unitPusatId, komentar: [], tugasTerkait: [], dokumenTerkait: [] },
];

export const mockTugas: Tugas[] = [
    { id: 'tugas-1', suratId: 'sm-1', deskripsi: 'Siapkan materi presentasi untuk Rakornas.', ditugaskanKepada: mockUsers.find(u => u.id === userStaf1Id)!, tanggalJatuhTempo: new Date('2023-10-20').toISOString(), status: 'Dikerjakan', dibuatOleh: mockUsers.find(u => u.id === userPimpinanId)! },
    { id: 'tugas-2', suratId: 'sk-1', deskripsi: 'Kumpulkan laporan keuangan dari semua cabang.', ditugaskanKepada: mockUsers.find(u => u.id === userStaf2Id)!, tanggalJatuhTempo: new Date('2023-10-28').toISOString(), status: 'Belum Dikerjakan', dibuatOleh: mockUsers.find(u => u.id === userManajerialId)! },
];

export const mockPerjalananDinas: PerjalananDinas[] = [
    {
        id: 'pd-1',
        suratTugasId: 'sk-6',
        tujuanPerjalanan: 'Melaksanakan monitoring dan evaluasi implementasi sistem E-Arsip di kantor cabang.',
        tempatBerangkat: 'Kantor Wilayah I',
        alatAngkut: 'Kendaraan Dinas',
        kotaTujuan: 'Jakarta Selatan',
        tanggalBerangkat: new Date('2023-11-25').toISOString(),
        tanggalKembali: new Date('2023-11-27').toISOString(),
        pegawaiUtamaId: userStaf1Id,
        pengikut: [
            { userId: userStaf2Id, keterangan: 'Operator Keuangan' }
        ],
        rincianBiaya: [
            { id: 'rb-1', deskripsi: 'Transportasi PP', jumlah: 1, satuan: 'Tiket', hargaSatuan: 500000 },
            { id: 'rb-2', deskripsi: 'Akomodasi', jumlah: 2, satuan: 'Malam', hargaSatuan: 750000 },
            { id: 'rb-3', deskripsi: 'Uang Harian', jumlah: 3, satuan: 'Hari', hargaSatuan: 350000 },
        ],
        pembebananAnggaranInstansi: 'Kantor Wilayah I',
        pembebananAnggaranAkun: '524111',
        tingkatBiaya: 'B',
        dasarSuratTugasNomor: 'WIM.27.KP.05.02-1',
        dasarSuratTugasTanggal: new Date('2023-11-20').toISOString(),
        pejabatPembuatKomitmenId: userPimpinanId,
        penandatanganPihakLainId: userManajerialId,
        status: 'Selesai',
        laporan: undefined,
    }
];


export const mockAllSurat: AnySurat[] = [...mockSuratMasuk, ...mockSuratKeluar, ...mockNotaDinas];

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
    logoUrl: 'https://seeklogo.com/images/G/garuda-pancasila-logo-45A9A7A403-seeklogo.com.png',
    namaKementerian: 'KEMENTERIAN KEUANGAN REPUBLIK INDONESIA',
    namaDirektorat: 'DIREKTORAT JENDERAL IMIGRASI',
    sematkanLogoDiQRCode: true,
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
};

export const mockKebijakanRetensi: KebijakanRetensi[] = [
  { id: 'ret-1', kategoriId: kategoriKeuanganId, masaRetensiAktif: 2, masaRetensiInaktif: 8, tindakanFinal: 'Permanen' },
  { id: 'ret-2', kategoriId: kategoriUmumId, masaRetensiAktif: 1, masaRetensiInaktif: 4, tindakanFinal: 'Musnahkan' },
];

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
  },
   {
    id: 'tpl-3',
    nama: 'Surat Perintah Perjalanan Dinas (SPPD)',
    perihal: 'Surat Perintah Perjalanan Dinas',
    kategoriId: kategoriSDMId,
    sifat: SifatSurat.PENTING,
    jenisSuratKeluar: 'SPPD',
    masalahUtamaId: 'mu-3',
    ringkasan: '<p>Berdasarkan kebutuhan dinas, dengan ini menugaskan nama-nama terlampir untuk melaksanakan perjalanan dinas dengan rincian sebagai berikut.</p>'
  }
];

export const mockPermintaanLaporan: PermintaanLaporan[] = [
    {
        id: 'req-1',
        nama: 'Laporan Statistik Keimigrasian Bulanan',
        deskripsi: 'Mohon kirimkan rekapitulasi data statistik keimigrasian untuk periode bulan lalu, mencakup data paspor, izin tinggal, dan pengawasan.',
        periode: 'Bulanan',
        aturanJatuhTempo: 'Setiap tanggal 5 bulan berikutnya',
        unitTujuanIds: [unitCabang1Id, unitCabang2Id],
        dibuatOleh: mockUsers.find(u => u.id === userAdminId)!,
        timestamp: new Date('2023-10-01').toISOString(),
    },
    {
        id: 'req-2',
        nama: 'Laporan Keuangan Triwulanan',
        deskripsi: 'Laporan realisasi anggaran dan serapan keuangan untuk periode triwulan yang telah berakhir.',
        periode: 'Triwulan',
        aturanJatuhTempo: 'Setiap tanggal 15 setelah akhir triwulan',
        unitTujuanIds: [unitCabang1Id, unitCabang2Id],
        dibuatOleh: mockUsers.find(u => u.id === userAdminId)!,
        timestamp: new Date('2023-09-01').toISOString(),
    }
];

export const mockPengirimanLaporan: PengirimanLaporan[] = [
    {
        id: 'sub-1',
        permintaanId: 'req-1',
        unitKerjaId: unitCabang1Id,
        periodeLaporan: 'September 2023',
        tanggalPengiriman: new Date('2023-10-04').toISOString(),
        attachment: { id: 'att-lap-1', name: 'Laporan Statistik Jaksel - Sept 2023.pdf', type: 'application/pdf', size: 120400, content: '#' },
        status: 'Tepat Waktu',
        dikirimOleh: mockUsers.find(u => u.id === userStaf1Id)!,
    },
    {
        id: 'sub-2',
        permintaanId: 'req-2',
        unitKerjaId: unitCabang2Id,
        periodeLaporan: 'Triwulan 3 2023',
        tanggalPengiriman: new Date('2023-10-16').toISOString(),
        attachment: { id: 'att-lap-2', name: 'Lap-Keu-Q3-Jaktim.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 85200, content: '#' },
        status: 'Terlambat',
        catatan: 'Mohon maaf atas keterlambatannya karena ada penyesuaian data.',
        dikirimOleh: mockUsers.find(u => u.id === userStaf2Id)!,
    }
];

const balasan1: BalasanTiket[] = [
    { id: 'balasan-1', user: mockUsers.find(u => u.id === userAdminId)!, teks: 'Terima kasih atas laporannya. Kami akan segera memeriksanya.', timestamp: new Date(Date.now() - 3600000).toISOString(), isInternalNote: false },
    { id: 'balasan-2', user: mockUsers.find(u => u.id === userStaf1Id)!, teks: 'Baik, terima kasih kembali.', timestamp: new Date(Date.now() - 3000000).toISOString(), isInternalNote: false },
];

export const mockTiket: Tiket[] = [
    {
        id: 'tiket-1',
        judul: 'Tidak bisa unggah lampiran lebih dari 5MB',
        deskripsi: 'Ketika saya mencoba mengunggah lampiran untuk surat keluar, selalu gagal jika ukurannya lebih dari 5MB. Mohon bantuannya untuk diperiksa.',
        kategori: 'Masalah Teknis',
        prioritas: 'Tinggi',
        status: 'Selesai',
        pembuat: mockUsers.find(u => u.id === userStaf1Id)!,
        ditugaskanKepada: mockUsers.find(u => u.id === userAdminId)!,
        tanggalDibuat: new Date(Date.now() - 86400000 * 2).toISOString(),
        tanggalUpdate: new Date(Date.now() - 3000000).toISOString(),
        balasan: balasan1,
    },
    {
        id: 'tiket-2',
        judul: 'Saran: Tambah kategori "Perjalanan Dinas"',
        deskripsi: 'Akan sangat membantu jika ada kategori surat baru khusus untuk "Perjalanan Dinas" untuk mempermudah klasifikasi.',
        kategori: 'Saran Fitur',
        prioritas: 'Rendah',
        status: 'Baru',
        pembuat: mockUsers.find(u => u.id === userStaf2Id)!,
        tanggalDibuat: new Date(Date.now() - 86400000).toISOString(),
        tanggalUpdate: new Date(Date.now() - 86400000).toISOString(),
        balasan: [],
    }
];

export const mockChatMessages: ChatMessage[] = [
    { id: 'msg-1', roomId: 'chat-room-1', senderId: userPimpinanId, text: 'Tolong segera siapkan materi untuk Rakornas ya.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 'msg-2', roomId: 'chat-room-1', senderId: userStaf1Id, text: 'Siap, Pak. Drafnya akan saya kirimkan sore ini.', timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
    { id: 'msg-3', roomId: 'chat-room-2', senderId: userManajerialId, text: 'Tim Keuangan, mohon update progress audit internal.', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
];

export const mockChatRooms: ChatRoom[] = [
    {
        id: 'chat-room-1',
        name: 'Diskusi: Undangan Rapat Koordinasi Nasional',
        type: 'document',
        memberIds: [userPimpinanId, userStaf1Id, userSuperAdminId],
        suratId: 'sm-1',
        lastMessage: mockChatMessages[1],
    },
    {
        id: 'chat-room-2',
        name: 'Grup Tim Keuangan',
        type: 'group',
        memberIds: [userManajerialId, userStaf2Id, userSuperAdminId],
        lastMessage: mockChatMessages[2],
    },
    {
        id: 'chat-room-3',
        name: 'Citra Lestari',
        type: 'direct',
        memberIds: [userSuperAdminId, userAdminId],
    }
];