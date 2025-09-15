export enum TipeSurat {
  MASUK = 'MASUK',
  KELUAR = 'KELUAR',
  NOTA_DINAS = 'NOTA_DINAS',
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

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string; // base64 data URL
}

export interface ApprovalStep {
  id: string;
  approver: User;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  timestamp?: string;
  notes?: string;
  order: number;
}

export interface Komentar {
    id: string;
    user: User;
    teks: string;
    timestamp: string;
}

export interface Delegasi {
    id: string;
    dariUser: User;
    kepadaUser: User;
    tanggalMulai: string;
    tanggalSelesai: string;
    isActive: boolean;
}

export interface User {
  id: string;
  nama: string;
  email: string;
  jabatan: string;
  role: UserRole;
  unitKerjaId: string;
  delegasi?: Delegasi;
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

export interface TemplateSurat {
    id: string;
    nama: string;
    perihal: string;
    kategoriId: string;
    sifat: SifatSurat;
    jenisSuratKeluar: 'Biasa' | 'SK';
    masalahUtamaId: string;
    ringkasan: string; // Can contain basic HTML
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

export interface Tugas {
  id: string;
  suratId: string;
  deskripsi: string;
  ditugaskanKepada: User;
  tanggalJatuhTempo: string;
  status: 'Belum Dikerjakan' | 'Dikerjakan' | 'Selesai';
  dibuatOleh: User;
}

export interface DokumenTerkait {
    id: string;
    suratAsalId: string;
    suratTerkaitId: string;
    tipeHubungan: string; // e.g., 'Jawaban', 'Lampiran Pendukung', 'Tindak Lanjut'
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
  attachments?: Attachment[];
  komentar: Komentar[];
  tugasTerkait: Tugas[];
  dokumenTerkait: DokumenTerkait[];
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
  ringkasan: string; // Can contain basic HTML for rich text editor
  tandaTangan?: string; // base64 data URL for signature image or QR code
  suratAsliId?: string; // ID of the SuratMasuk being replied to
  status: 'Draf' | 'Menunggu Persetujuan' | 'Revisi' | 'Disetujui' | 'Terkirim';
  version: number;
  history: Partial<SuratKeluar>[];
  approvalChain: ApprovalStep[];
}

export interface NotaDinas extends SuratBase {
    tipe: TipeSurat.NOTA_DINAS;
    tujuanUserIds: string[];
    pembuat: User;
    status: 'Draf' | 'Terkirim';
    ringkasan: string;
}

export type AnySurat = SuratMasuk | SuratKeluar | NotaDinas;

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

export interface Pengumuman {
    id: string;
    teks: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    isActive: boolean;
    pembuat: User;
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

export type DashboardWidgetSettings = {
    stats: boolean;
    chart: boolean;
    recent: boolean;
    tasks: boolean;
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
