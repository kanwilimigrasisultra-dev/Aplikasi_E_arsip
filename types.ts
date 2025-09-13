export enum StatusDisposisi {
  PENDING = 'Pending',
  DIPROSES = 'Diproses',
  SELESAI = 'Selesai',
  DIBACA = 'Dibaca'
}

export enum SifatDisposisi {
  SEGERA = 'Segera',
  PENTING = 'Penting',
  BIASA = 'Biasa',
}

export enum TipeSurat {
  MASUK = 'MASUK',
  KELUAR = 'KELUAR'
}

export enum JenisSurat {
  BIASA = 'Surat Biasa',
  SK = 'Surat Keputusan'
}

export enum SifatSurat {
  BIASA = 'Biasa',
  PENTING = 'Penting',
  SANGAT_PENTING = 'Sangat Penting',
  RAHASIA = 'Rahasia'
}

export enum SignatureMethod {
  GAMBAR = 'Gambar',
  QR_CODE = 'QR Code'
}

export enum UserRole {
  SUPER_ADMIN = 'Administrator Utama',
  ADMIN = 'Admin',
  PIMPINAN = 'Pimpinan',
  MANAJERIAL = 'Manajerial',
  STAF = 'Staf',
}

export interface PenomoranSettings {
  biasa: string;
  sk: string;
  resetSequence: 'yearly' | 'monthly';
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

export interface UnitKerja {
  id: string;
  nama: string;
  kode: string; // Kode unik untuk penomoran, misal: WIM.27
  tipe: 'Pusat' | 'Cabang';
  indukId?: string;
  alamat: string;
  kontak: string;
  website: string;
}

export interface KopSuratSettings {
  logoUrl: string;
  namaKementerian: string;
  namaDirektorat: string;
}

export interface User {
  id: string;
  nama: string;
  email: string;
  jabatan: string; // For display purposes
  role: UserRole; // For permissions
  password?: string;
  unitKerjaId: string;
}

export interface KategoriSurat {
  id: string;
  nama: string;
}

export interface MasalahUtama {
  id: string;
  kode: string; // PR, GR, etc.
  deskripsi: string; // Perencanaan, Keimigrasian, etc.
}


export interface KlasifikasiSurat {
  id: string;
  kode: string; // e.g., PR.01.01
  deskripsi: string;
  masalahUtamaId: string;
}


export interface Disposisi {
  id: string;
  tujuan: User;
  catatan: string;
  tanggalDisposisi: string;
  status: StatusDisposisi;
  sifat: SifatDisposisi;
  pembuat: User;
}

export interface TandaTangan {
  userId: string;
  namaPenandaTangan: string;
  jabatanPenandaTangan: string;
  timestamp: string;
  signatureDataUrl: string; // base64 data URL for image or QR code
  verifikasiUrl?: string; // URL for QR code verification
}

export interface Surat {
  id: string;
  tipe: TipeSurat;
  nomorSurat: string;
  tanggal: string;
  perihal: string;
  isi?: string;
  pengirim: string; // or instansi
  tujuan: string; // or instansi
  fileUrl: string; // mock URL
  isArchived: boolean;
  sifat: SifatSurat;
  unitKerjaId: string;
  tujuanUnitKerjaId?: string; // For internal mail
  folderId?: string;
  kategoriId?: string;
  jenisSurat?: JenisSurat;
  masalahUtamaId?: string;
  klasifikasiId?: string; // For auto-numbering
  relatedSuratIds?: string[];
}

export interface SuratMasuk extends Surat {
  tipe: TipeSurat.MASUK;
  disposisi: Disposisi[];
  tanggalDiterima: string;
}

export interface SuratKeluar extends Surat {
  tipe: TipeSurat.KELUAR;
  tandaTangan?: TandaTangan;
}

export type AnySurat = SuratMasuk | SuratKeluar;

export interface FolderArsip {
  id: string;
  nama: string;
}

export interface Notifikasi {
  id: string;
  suratId: string;
  userId: string;
  pesan: string;
  tanggal: string;
  isRead: boolean;
}

export interface ActivityLog {
  id:string;
  timestamp: string;
  user: string;
  action: string;
}