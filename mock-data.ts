import {
  User, UnitKerja, KategoriSurat, FolderArsip, AnySurat, Notifikasi, ActivityLog,
  TipeSurat, SifatSurat, StatusDisposisi, SifatDisposisi, KopSuratSettings, SuratMasuk, SuratKeluar,
  AppSettings, SignatureMethod, UserRole, KlasifikasiSurat, PenomoranSettings, MasalahUtama, JenisSurat
} from './types';

const subDays = (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - days);
    return newDate;
};


export const generateMockData = () => {
    // 1. Users & Unit Kerja
    const unitKerja: UnitKerja[] = [
        { 
            id: 'unit-1', 
            nama: 'KANTOR WILAYAH NUSA TENGGARA TIMUR', 
            tipe: 'Pusat', 
            kode: 'WIM.27',
            alamat: 'Jl. W.J. Lalamentik No.98, Oebobo, Kota Kupang, Nusa Tenggara Timur',
            kontak: 'Pos-el: kanwilnttim@kemenimigrasi.go.id',
            website: 'nttim.kemenimigrasi.go.id'
        },
        { 
            id: 'unit-2', 
            nama: 'KANTOR IMIGRASI JAYAPURA', 
            tipe: 'Cabang', 
            indukId: 'unit-papua', 
            kode: 'IMI.1',
            alamat: 'Jl. Percetakan Negara No.15, Gurabesi, Kota Jayapura, Papua',
            kontak: 'Pos-el: kanimjyp@kemenimigrasi.go.id',
            website: 'kanimjayapura.kemenimigrasi.go.id'
        },
        { 
            id: 'unit-papua', 
            nama: 'KANTOR WILAYAH PAPUA', 
            tipe: 'Pusat', 
            kode: 'WIM.30',
            alamat: 'Jl. Raya Abepura, Kota Jayapura, Papua',
            kontak: 'Pos-el: kanwilpapua@kemenimigrasi.go.id',
            website: 'papua.kemenimigrasi.go.id'
        },
    ];

    const users: User[] = [
        { id: 'user-1', nama: 'Budi Santoso', email: 'budi.s@kantor.go.id', jabatan: 'Staf Administrasi', role: UserRole.STAF, unitKerjaId: 'unit-1' },
        { id: 'user-2', nama: 'Citra Lestari', email: 'citra.l@kantor.go.id', jabatan: 'Kepala Kantor Wilayah NTT', role: UserRole.PIMPINAN, unitKerjaId: 'unit-1' },
        { id: 'user-3', nama: 'Agus Wijaya', email: 'agus.w@kantor.go.id', jabatan: 'Kepala Bagian Umum', role: UserRole.MANAJERIAL, unitKerjaId: 'unit-1' },
        { id: 'user-4', nama: 'Dewi Anggraini', email: 'dewi.a@kantor.go.id', jabatan: 'Staf Imigrasi', role: UserRole.STAF, unitKerjaId: 'unit-2' },
        { id: 'user-5', nama: 'Admin Utama', email: 'superadmin@kantor.go.id', jabatan: 'System Super Admin', role: UserRole.SUPER_ADMIN, unitKerjaId: 'unit-1' },
        { id: 'user-6', nama: 'Admin Imigrasi Jayapura', email: 'admin.jpr@kantor.go.id', jabatan: 'Admin Lokal', role: UserRole.ADMIN, unitKerjaId: 'unit-2' },
        { id: 'user-7', nama: 'Rina Hartono', email: 'rina.h@kantor.go.id', jabatan: 'Kepala Kantor Imigrasi Jayapura', role: UserRole.PIMPINAN, unitKerjaId: 'unit-2' },
    ];
    
    // 2. Kategori, Klasifikasi, Masalah Utama & Folders
    const kategori: KategoriSurat[] = [
        { id: 'kat-1', nama: 'Undangan' },
        { id: 'kat-2', nama: 'Pemberitahuan' },
        { id: 'kat-3', nama: 'Permohonan' },
        { id: 'kat-4', nama: 'Laporan Bulanan' },
        { id: 'kat-5', nama: 'Keuangan' },
        { id: 'kat-6', nama: 'Kerjasama' },
        { id: 'kat-7', nama: 'SDM / Personalia' },
    ];
    
    const masalahUtama: MasalahUtama[] = [
        { id: 'mu-1', kode: 'PR', deskripsi: 'Perencanaan' },
        { id: 'mu-2', kode: 'GR', deskripsi: 'Keimigrasian' },
        { id: 'mu-3', kode: 'UM', deskripsi: 'Umum' },
        { id: 'mu-4', kode: 'KP', deskripsi: 'Kepegawaian' },
    ];

    const klasifikasi: KlasifikasiSurat[] = [
      { id: 'klas-1', kode: 'PR.01.01', deskripsi: 'Rencana Strategis', masalahUtamaId: 'mu-1' },
      { id: 'klas-2', kode: 'PR.02.01', deskripsi: 'Perencanaan Evaluasi Unit Utama', masalahUtamaId: 'mu-1' },
      { id: 'klas-3', kode: 'GR.01.01', deskripsi: 'Kebijakan Keimigrasian', masalahUtamaId: 'mu-2' },
      { id: 'klas-4', kode: 'GR.01.04', deskripsi: 'Surat Perjalanan Laksana Paspor (SPLP)', masalahUtamaId: 'mu-2' },
      { id: 'klas-5', kode: 'UM.01.01', deskripsi: 'Urusan Umum - Undangan Rapat', masalahUtamaId: 'mu-3'},
      { id: 'klas-6', kode: 'KP.03.01', deskripsi: 'Kepegawaian - Cuti dan Absensi', masalahUtamaId: 'mu-4' },
    ];
    
    const folders: FolderArsip[] = [
        { id: 'folder-1', nama: 'Arsip Umum' },
        { id: 'folder-2', nama: 'Kepegawaian' },
        { id: 'folder-3', nama: 'Dokumen Proyek' },
    ];
    
    // 3. Surat
    const surat: AnySurat[] = [];
    const today = new Date();
    
    // Surat Masuk
    surat.push({
        id: 'sm-1',
        tipe: TipeSurat.MASUK,
        nomorSurat: '001/EXT/UND/IV/2024',
        tanggal: subDays(today, 5).toISOString(),
        tanggalDiterima: subDays(today, 4).toISOString(),
        perihal: 'Undangan Rapat Koordinasi Nasional',
        isi: 'Dengan hormat, kami mengundang Bapak/Ibu untuk menghadiri Rapat Koordinasi Nasional yang akan diselenggarakan pada...',
        pengirim: 'Kementerian Komunikasi dan Informatika',
        tujuan: 'Kepala Kantor',
        fileUrl: '/mock-document.pdf',
        isArchived: false,
        sifat: SifatSurat.PENTING,
        unitKerjaId: 'unit-1',
        kategoriId: 'kat-1',
        disposisi: [
            {
                id: 'disp-1',
                tujuan: users.find(u => u.id === 'user-3')!,
                catatan: 'Tolong persiapkan materi presentasi terkait laporan tahunan.',
                tanggalDisposisi: subDays(today, 3).toISOString(),
                status: StatusDisposisi.DIPROSES,
                sifat: SifatDisposisi.SEGERA,
                pembuat: users.find(u => u.id === 'user-2')!
            }
        ]
    } as SuratMasuk);
    
    surat.push({
        id: 'sm-2',
        tipe: TipeSurat.MASUK,
        nomorSurat: 'INV/2024/IV/123',
        tanggal: subDays(today, 10).toISOString(),
        tanggalDiterima: subDays(today, 9).toISOString(),
        perihal: 'Tagihan Layanan Internet - April 2024',
        pengirim: 'PT Telekomunikasi Indonesia',
        tujuan: 'Bagian Keuangan',
        fileUrl: '/mock-document.pdf',
        isArchived: false,
        sifat: SifatSurat.BIASA,
        unitKerjaId: 'unit-1',
        kategoriId: 'kat-5',
        disposisi: []
    } as SuratMasuk);

    surat.push({
        id: 'sm-3',
        tipe: TipeSurat.MASUK,
        nomorSurat: '015/HRD/ADM/IV/2024',
        tanggal: subDays(today, 20).toISOString(),
        tanggalDiterima: subDays(today, 19).toISOString(),
        perihal: 'Permohonan Data Karyawan',
        pengirim: 'Dinas Tenaga Kerja',
        tujuan: 'Bagian SDM',
        fileUrl: '/mock-document.pdf',
        isArchived: true,
        folderId: 'folder-2',
        sifat: SifatSurat.RAHASIA,
        unitKerjaId: 'unit-1',
        kategoriId: 'kat-7',
        disposisi: []
    } as SuratMasuk);
    
    // Surat Keluar
    surat.push({
        id: 'sk-1',
        tipe: TipeSurat.KELUAR,
        nomorSurat: 'WIM.27-KP.03.01-1',
        tanggal: subDays(today, 2).toISOString(),
        perihal: 'Pemberitahuan Jadwal Cuti Bersama Idul Fitri',
        isi: 'Diberitahukan kepada seluruh karyawan bahwa jadwal cuti bersama dalam rangka Hari Raya Idul Fitri 1445 H adalah sebagai berikut...',
        pengirim: 'KANTOR WILAYAH NUSA TENGGARA TIMUR',
        tujuan: 'Seluruh Karyawan',
        fileUrl: '/mock-document.pdf',
        isArchived: false,
        sifat: SifatSurat.BIASA,
        unitKerjaId: 'unit-1',
        kategoriId: 'kat-2',
        masalahUtamaId: 'mu-4',
        jenisSurat: JenisSurat.BIASA,
        klasifikasiId: 'klas-6',
        tandaTangan: {
            userId: 'user-2',
            namaPenandaTangan: 'Citra Lestari',
            jabatanPenandaTangan: 'Kepala Kantor Wilayah NTT',
            timestamp: subDays(today, 1).toISOString(),
            signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACgCAMAAACow3svAAAAbFBMVEUAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkKCgoLCwsMDAwNDQ0ODg4PDw8QEBARERESEhITExMUFBQVFRUWFhYXFxcYGBgZGRkaGhobGxscHBwdHR0eHh4fHx8gICAhISEjIyMlJSUqKiotLS0AAAC5358xAAADQklEQVR4nO3a6XKqQBBA0bZpGABVVEHw/k/sqoVCAwRMCG3V7M65n/2Y2cyk7D0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAy2b58bMvX+LXUfC8L2/P5YfN+b4Uft/5lV++58/292b/vj5v+65/16/V2t/4/F8u++Z9r//3l/a3fr7e71f5lX7cRfr/evN/vV/uVft1F+P16836/2q/06y7C79eb9/vV/uVfxxA+AogIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiI-1d/V/1+2UX4/Xrzfr/ar/zrdsLv15v3+9V+5V+3UX4/Xrzfr/ar/TrLsLv15v3+9V+5V9/fwP/b/QCAAAAAElFTSuQmCC'
        }
    } as SuratKeluar);

    surat.push({
        id: 'sk-2',
        tipe: TipeSurat.KELUAR,
        nomorSurat: 'WIM.27-PR.01.01-1',
        tanggal: subDays(today, 15).toISOString(),
        perihal: 'Draft Perjanjian Kerjasama dengan PT Sinar Jaya',
        pengirim: 'KANTOR WILAYAH NUSA TENGGARA TIMUR',
        tujuan: 'PT Sinar Jaya',
        fileUrl: '/mock-document.pdf',
        isArchived: true,
        folderId: 'folder-3',
        sifat: SifatSurat.SANGAT_PENTING,
        unitKerjaId: 'unit-1',
        kategoriId: 'kat-6',
        masalahUtamaId: 'mu-1',
        jenisSurat: JenisSurat.BIASA,
        klasifikasiId: 'klas-1',
    } as SuratKeluar);
    
    // 4. Notifikasi
    const notifikasi: Notifikasi[] = [
        {
            id: 'notif-1',
            suratId: 'sm-1',
            userId: 'user-3',
            pesan: `Anda menerima disposisi baru untuk surat "Undangan Rapat Koordinasi Nasional"`,
            tanggal: subDays(today, 3).toISOString(),
            isRead: false
        },
        {
            id: 'notif-2',
            suratId: 'sm-2',
            userId: 'user-2',
            pesan: `Surat masuk baru 'Tagihan Layanan Internet - April 2024' dari PT Telekomunikasi Indonesia telah diterima.`,
            tanggal: subDays(today, 9).toISOString(),
            isRead: true
        }
    ];
    
    // 5. Activity Logs
    const activityLogs: ActivityLog[] = [
        { id: 'log-1', timestamp: subDays(today, 1).toISOString(), user: 'Citra Lestari', action: 'Menandatangani surat keluar: WIM.27-KP.03.01-1' },
        { id: 'log-2', timestamp: subDays(today, 3).toISOString(), user: 'Citra Lestari', action: 'Membuat disposisi untuk surat 001/EXT/UND/IV/2024 ke Agus Wijaya' },
        { id: 'log-3', timestamp: subDays(today, 4).toISOString(), user: 'Budi Santoso', action: 'Membuat surat baru: 001/EXT/UND/IV/2024' },
        { id: 'log-4', timestamp: subDays(today, 18).toISOString(), user: 'Budi Santoso', action: 'Mengarsipkan surat: 015/HRD/ADM/IV/2024' },
    ];
    
    // 6. Settings
    const penomoranSettings: PenomoranSettings = {
      biasa: '[KODE_UNIT_LENGKAP]-[KODE_KLASIFIKASI_ARSIP]-[NOMOR_SURAT_OTOMATIS]',
      sk: 'NOMOR [KODE_UNIT_LENGKAP]-[NOMOR_SURAT_OTOMATIS].[KODE_KLASIFIKASI_ARSIP] TAHUN [TAHUN_SAAT_INI]',
      resetSequence: 'yearly',
    };
    
    const appSettings: AppSettings = {
        notifications: {
            disposisiBaru: true,
            suratMasukBaru: true,
            statusDisposisiUpdate: true,
        },
        theme: {
            darkMode: false,
        },
        signatureMethod: SignatureMethod.GAMBAR, // Default method
    };
    
    const kopSuratSettings: KopSuratSettings = {
        logoUrl: '',
        namaKementerian: 'KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA',
        namaDirektorat: 'DIREKTORAT JENDERAL IMIGRASI',
    };
    
    return {
        users,
        unitKerja,
        kategori,
        masalahUtama,
        klasifikasi,
        folders,
        surat,
        notifikasi,
        activityLogs,
        appSettings,
        kopSuratSettings,
        penomoranSettings
    };
};