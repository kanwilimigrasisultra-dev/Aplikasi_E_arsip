export enum TipeSurat {
  MASUK = 'MASUK',
  KELUAR = 'KELUAR',
}

export enum SifatSurat {
  BIASA = 'Biasa',
  PENTING = 'Penting',
  SANGAT_PENTING = 'Sangat Penting',
  RAHASIA = 'Rahasia',
}

export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  PIMPINAN = 'Pimpinan',
  MANAJERIAL = 'Manajerial',
  STAF = 'Staf',
}

export enum SifatDisposisi {
  BIASA = 'Biasa',
  SEGERA = 'Segera',
  SANGAT_SEGERA = 'Sangat Segera',
}

export enum StatusDisposisi {
  DIPROSES = 'Diproses',
  SELESAI = 'Selesai',
  DITOLAK = 'Ditolak',
}

export enum SignatureMethod {
  GAMBAR = 'gambar',
  QR_CODE = 'qrcode',
}


export interface User {
  id: string;
  nama: string;
  email: string;
  jabatan: string;
  role: UserRole;
  unitKerjaId: string;
}

export interface UnitKerja {
  id: string;
  nama: string;
  kode: string;
  tipe: 'Pusat' | 'Cabang';
  indukId?: string;
  alamat: string;
  kontak: string;
  website: string;
}

export interface KategoriSurat {
  id: string;
  nama: string;
}

export interface MasalahUtama {
  id: string;
  kode: string;
  deskripsi: string;
}

export interface KlasifikasiSurat {
    id: string;
    kode: string;
    deskripsi: string;
    masalahUtamaId: string;
}

export interface Disposisi {
  id: string;
  pembuat: User;
  tujuan: User;
  tanggal: string;
  catatan: string;
  sifat: SifatDisposisi;
  status: StatusDisposisi;
  riwayatStatus: { status: StatusDisposisi, tanggal: string, oleh?: User }[];
}

interface SuratBase {
  id: string;
  nomorSurat: string;
  tanggal: string; // Tanggal surat
  perihal: string;
  kategoriId: string;
  sifat: SifatSurat;
  fileUrl: string;
  isArchived: boolean;
  folderId?: string;
  tipe: TipeSurat;
  unitKerjaId: string; // Unit kerja yang membuat/menerima surat ini
}

export interface SuratMasuk extends SuratBase {
  tipe: TipeSurat.MASUK;
  pengirim: string;
  tanggalDiterima: string;
  disposisi: Disposisi[];
  isiRingkasAI?: string;
}

export interface SuratKeluar extends SuratBase {
  tipe: TipeSurat.KELUAR;
  tujuan: string; // Nama tujuan eksternal
  tujuanUnitKerjaId?: string; // ID tujuan internal jika ada
  pembuat: User;
  jenisSuratKeluar: 'Biasa' | 'SK';
  masalahUtamaId: string;
  klasifikasiId: string;
  ringkasan: string;
  tandaTangan?: string; // base64 data URL for signature image or QR code
  suratAsliId?: string; // ID of the SuratMasuk being replied to
  status: 'Draf' | 'Terkirim';
}

export type AnySurat = SuratMasuk | SuratKeluar;

export interface FolderArsip {
  id: string;
  nama: string;
}

export interface Notifikasi {
  id: string;
  suratId: string;
  pesan: string;
  tanggal: string;
  isRead: boolean;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface KopSuratSettings {
    logoUrl: string;
    namaKementerian: string;
    namaDirektorat: string;
}

export interface BrandingSettings {
  appLogoUrl: string;
  loginLogo1Url: string;
  loginLogo2Url: string;
  loginLogo3Url: string;
}

export interface AppSettings {
    notifications: {
        disposisiBaru: boolean;
        suratMasukBaru: boolean;
        statusDisposisiUpdate: boolean;
    };
    theme: {
        darkMode: boolean;
    };
    signatureMethod: SignatureMethod;
}

export interface PenomoranSettings {
    biasa: string;
    sk: string;
    resetSequence: 'yearly' | 'monthly';
}

export interface KebijakanRetensi {
    id: string;
    kategoriId: string;
    masaRetensiAktif: number; // In years
    masaRetensiInaktif: number; // In years
    tindakanFinal: 'Musnahkan' | 'Permanen';
}