// FIX: Removed self-import which caused declaration conflicts.

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
  nip: string;
  pangkatGolongan: string;
  email: string;
  jabatan: string;
  role: UserRole;
  unitKerjaId: string;
  delegasi?: Delegasi;
  tanggalLahir: string;
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
    jenisSuratKeluar: 'Biasa' | 'SK' | 'SPPD';
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
  nomorAgenda?: number;
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
  jenisSuratKeluar: 'Biasa' | 'SK' | 'SPPD';
  masalahUtamaId: string;
  klasifikasiId: string;
  ringkasan: string; // Can contain basic HTML for rich text editor
  tandaTangan?: string; // base64 data URL for signature image or QR code
  suratAsliId?: string; // ID of the SuratMasuk being replied to
  status: 'Draf' | 'Menunggu Persetujuan' | 'Revisi' | 'Disetujui' | 'Terkirim';
  version: number;
  history: Partial<SuratKeluar>[];
  approvalChain: ApprovalStep[];
  tembusan?: string[];
  perjalananDinasId?: string;
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
    sematkanLogoDiQRCode: boolean;
}

export interface BrandingSettings {
  appLogoUrl: string;
  loginLogo1Url: string;
  loginLogo2Url: string;
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

export type DashboardWidgetId = 'stats' | 'chart' | 'recent' | 'tasks' | 'pelaporan';

export interface DashboardWidget {
    id: DashboardWidgetId;
    visible: boolean;
    name: string;
}

export type DashboardLayoutSettings = DashboardWidget[];


// FIX: Renamed interface to avoid name collision with the main ChatMessage interface.
export interface AIChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface PermintaanLaporan {
  id: string;
  nama: string;
  deskripsi: string;
  periode: 'Bulanan' | 'Triwulan' | 'Tahunan';
  aturanJatuhTempo: string; // e.g., "Setiap tanggal 5 bulan berikutnya"
  unitTujuanIds: string[]; // Array of UnitKerja IDs
  templateUrl?: string;
  dibuatOleh: User;
  timestamp: string;
}

export interface PengirimanLaporan {
  id: string;
  permintaanId: string; // Link to PermintaanLaporan
  unitKerjaId: string; // Unit Kerja that submitted
  periodeLaporan: string; // e.g., "Oktober 2024" or "Triwulan 4 2024"
  tanggalPengiriman: string;
  attachment: Attachment;
  status: 'Tepat Waktu' | 'Terlambat';
  catatan?: string;
  dikirimOleh: User;
}

export interface BalasanTiket {
  id: string;
  user: User;
  teks: string;
  timestamp: string;
  isInternalNote: boolean; // For admin-to-admin comments
}

export interface Tiket {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: 'Masalah Teknis' | 'Permintaan Data' | 'Saran Fitur' | 'Lainnya';
  prioritas: 'Rendah' | 'Sedang' | 'Tinggi';
  status: 'Baru' | 'Sedang Diproses' | 'Menunggu Respon' | 'Selesai';
  pembuat: User;
  ditugaskanKepada?: User;
  tanggalDibuat: string;
  tanggalUpdate: string;
  attachments?: Attachment[];
  balasan: BalasanTiket[];
}

export interface RincianBiaya {
  id: string;
  deskripsi: string;
  jumlah: number;
  satuan: string;
  hargaSatuan: number;
}

export interface LaporanPerjalananDinas {
  id: string;
  ringkasanHasil: string;
  attachments: Attachment[]; // For receipts, etc.
  tanggalPengiriman: string;
  dikirimOleh: User;
}

export interface PengikutPerjalananDinas {
  userId: string;
  keterangan: string;
}

export interface PerjalananDinas {
  id: string;
  suratTugasId: string; // Links to a SuratKeluar of type SPPD
  tujuanPerjalanan: string;
  tempatBerangkat: string;
  alatAngkut: string;
  kotaTujuan: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
  pegawaiUtamaId: string;
  pengikut: PengikutPerjalananDinas[];
  rincianBiaya: RincianBiaya[];
  pembebananAnggaranInstansi: string;
  pembebananAnggaranAkun: string;
  tingkatBiaya: string;
  dasarSuratTugasNomor?: string;
  dasarSuratTugasTanggal?: string;
  pejabatPembuatKomitmenId?: string;
  penandatanganPihakLainId?: string;
  status: 'Direncanakan' | 'Selesai' | 'Laporan Dikirim';
  laporan?: LaporanPerjalananDinas;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: 'Tugas' | 'Disposisi' | 'Perjalanan Dinas';
  linkId: string; // ID of the surat, tugas, or perjalananDinas
  description?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'document';
  memberIds: string[];
  suratId?: string; // Link to surat if it's a document-specific chat
  lastMessage?: ChatMessage;
}

export interface MasterBiaya {
  id: string;
  namaBiaya: string;
  satuan: string;
  tarifDefault: number;
}