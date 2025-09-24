import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    // We still need the types
    User, UnitKerja, KategoriSurat, MasalahUtama, KlasifikasiSurat, SuratMasuk, SuratKeluar,
    FolderArsip, Notifikasi, ActivityLog, AnySurat, KopSuratSettings, AppSettings,
    // FIX: Corrected typo from Penomoransettings to PenomoranSettings
    PenomoranSettings, BrandingSettings, KebijakanRetensi, TipeSurat, SifatDisposisi,
    StatusDisposisi, ApprovalStep, TemplateSurat, Pengumuman, NotaDinas, UserRole, Tugas, DashboardLayoutSettings, PermintaanLaporan, PengirimanLaporan, Tiket, PerjalananDinas, ChatRoom, ChatMessage, Disposisi, Komentar
} from './types';
import {
    // We can keep mock data for things not yet in the DB as a fallback
    mockFolders, mockNotifikasi, mockActivityLogs, mockKopSuratSettings, mockAppSettings,
    mockPenomoranSettings, mockBrandingSettings, mockKebijakanRetensi, mockTemplates, mockPengumuman, mockTugas, mockPermintaanLaporan, mockPengirimanLaporan, mockTiket, mockPerjalananDinas, mockChatRooms, mockChatMessages
} from './mock-data';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import SuratMasukComponent from './components/SuratMasuk';
import SuratKeluarComponent from './components/SuratKeluar';
import Arsip from './components/Arsip';
import Pengaturan from './components/Pengaturan';
import Administrasi from './components/Administrasi';
import NotificationBell from './components/NotificationBell';
import { ArchiveIcon, InboxIcon, OutboxIcon, SearchIcon, ClipboardListIcon, ShieldCheckIcon, CogIcon, UsersIcon, ArchiveBoxArrowDownIcon, PaperAirplaneIcon, DocumentChartBarIcon, BookOpenIcon, GlobeAltIcon, CalendarIcon, ChatBubbleLeftRightIcon } from './components/icons';
import PencarianCerdas from './components/PencarianCerdas';
import Laporan from './components/Laporan';
import VerifikasiDokumen from './components/VerifikasiDokumen';
import NotaDinasComponent from './components/NotaDinas';
import BantuanAI from './components/BantuanAI';
import AnnouncementBanner from './components/AnnouncementBanner';
import PelaporanPeriodik from './components/PelaporanPeriodik';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Helpdesk from './components/Helpdesk';
import BukuAgenda from './components/BukuAgenda';
import PerjalananDinasComponent from './components/PerjalananDinas';
import Kalender from './components/Kalender';
import Chat from './components/Chat';

type Page = 'dashboard' | 'surat_masuk' | 'surat_keluar' | 'nota_dinas' | 'buku_agenda' | 'perjalanan_dinas' | 'kalender' | 'obrolan' | 'arsip' | 'pencarian' | 'laporan' | 'pelaporan_periodik' | 'verifikasi' | 'helpdesk' | 'administrasi' | 'pengaturan';

const AppNav: React.FC<{ currentPage: Page; onNavigate: (page: Page) => void, currentUser: User }> = ({ currentPage, onNavigate, currentUser }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <InboxIcon className="w-5 h-5" /> },
        { id: 'surat_masuk', label: 'Surat Masuk', icon: <InboxIcon className="w-5 h-5" /> },
        { id: 'surat_keluar', label: 'Surat Keluar', icon: <OutboxIcon className="w-5 h-5" /> },
        { id: 'nota_dinas', label: 'Nota Dinas', icon: <PaperAirplaneIcon className="w-5 h-5" /> },
        { id: 'buku_agenda', label: 'Buku Agenda', icon: <BookOpenIcon className="w-5 h-5" /> },
        { id: 'perjalanan_dinas', label: 'Perjalanan Dinas', icon: <GlobeAltIcon className="w-5 h-5" /> },
        { id: 'kalender', label: 'Kalender Agenda', icon: <CalendarIcon className="w-5 h-5" /> },
        { id: 'arsip', label: 'Arsip', icon: <ArchiveBoxArrowDownIcon className="w-5 h-5" /> },
        { id: 'pencarian', label: 'Pencarian Cerdas', icon: <SearchIcon className="w-5 h-5" /> },
        { id: 'laporan', label: 'Laporan', icon: <ClipboardListIcon className="w-5 h-5" /> },
        { id: 'pelaporan_periodik', label: 'Pelaporan Periodik', icon: <DocumentChartBarIcon className="w-5 h-5" /> },
        { id: 'verifikasi', label: 'Verifikasi Dokumen', icon: <ShieldCheckIcon className="w-5 h-5" /> },
        { id: 'helpdesk', label: 'Pusat Bantuan', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
        { id: 'obrolan', label: 'Obrolan', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    ];
    
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) {
        navItems.push({ id: 'administrasi', label: 'Administrasi', icon: <UsersIcon className="w-5 h-5" /> });
        navItems.push({ id: 'pengaturan', label: 'Pengaturan', icon: <CogIcon className="w-5 h-5" /> });
    }

    return (
        <nav className="space-y-1">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as Page)}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${currentPage === item.id ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-600 hover:text-white'}`}
                >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- STATE MANAGEMENT ---
    // Initialize with empty arrays, will be populated from backend
    const [allSurat, setAllSurat] = useState<AnySurat[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
    const [kategoriList, setKategoriList] = useState<KategoriSurat[]>([]);
    const [masalahUtamaList, setMasalahUtamaList] = useState<MasalahUtama[]>([]);
    const [klasifikasiList, setKlasifikasiList] = useState<KlasifikasiSurat[]>([]);
    
    // Fallback to mock data for features not yet migrated to DB
    const [folders, setFolders] = useState<FolderArsip[]>(mockFolders);
    const [allTugas, setAllTugas] = useState<Tugas[]>(mockTugas);
    const [notifications, setNotifications] = useState<Notifikasi[]>(mockNotifikasi);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
    const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>(mockPengumuman);
    const [templates, setTemplates] = useState<TemplateSurat[]>(mockTemplates);
    const [permintaanLaporanList, setPermintaanLaporanList] = useState<PermintaanLaporan[]>(mockPermintaanLaporan);
    const [pengirimanLaporanList, setPengirimanLaporanList] = useState<PengirimanLaporan[]>(mockPengirimanLaporan);
    const [tiketList, setTiketList] = useState<Tiket[]>(mockTiket);
    const [perjalananDinasList, setPerjalananDinasList] = useState<PerjalananDinas[]>(mockPerjalananDinas);
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>(mockChatRooms);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
    
    // Settings state
    const [appSettings, setAppSettings] = useState<AppSettings>(mockAppSettings);
    const [kopSuratSettings, setKopSuratSettings] = useState<KopSuratSettings>(mockKopSuratSettings);
    const [penomoranSettings, setPenomoranSettings] = useState<PenomoranSettings>(mockPenomoranSettings);
    const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(mockBrandingSettings);
    const [kebijakanRetensi, setKebijakanRetensi] = useState<KebijakanRetensi[]>(mockKebijakanRetensi);
    const [widgetLayout, setWidgetLayout] = useState<DashboardLayoutSettings>([
        { id: 'stats', visible: true, name: 'Kartu Statistik' },
        { id: 'chart', visible: true, name: 'Grafik Tren Surat' },
        { id: 'tasks', visible: true, name: 'Widget Tugas Saya' },
        { id: 'pelaporan', visible: true, name: 'Widget Pelaporan Periodik' },
        { id: 'recent', visible: true, name: 'Aktivitas Surat Terkini' },
    ]);

    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [replyingSurat, setReplyingSurat] = useState<(Partial<SuratKeluar> & { suratAsli?: SuratMasuk }) | null>(null);

    // --- DATA FETCHING FROM BACKEND ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await fetch('/api.php');

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error HTTP ${response.status}: ${errorText}`);
                }
                
                const responseText = await response.text();
                if (!responseText) {
                    throw new Error("Respons dari server kosong. Pastikan 'api.php' ada dan dapat diakses.");
                }

                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (jsonError) {
                    console.error("Gagal mem-parsing JSON:", jsonError);
                    console.error("Respons mentah dari server:", responseText);
                    throw new Error(`Server memberikan data yang tidak valid. Ini mungkin karena ada error di PHP. Respons mentah: ${responseText.substring(0, 300)}...`);
                }

                if (data.error) {
                    throw new Error(`Error dari backend: ${data.error}`);
                }
                
                // Populate state with data from the database
                if(data.allSurat) setAllSurat(data.allSurat);
                if(data.allUsers) setAllUsers(data.allUsers);
                if(data.unitKerjaList) setUnitKerjaList(data.unitKerjaList);
                if(data.kategoriList) setKategoriList(data.kategoriList);
                if(data.masalahUtamaList) setMasalahUtamaList(data.masalahUtamaList);
                if(data.klasifikasiList) setKlasifikasiList(data.klasifikasiList);
                
            } catch (e: any) {
                console.error("Tidak dapat mengambil data dari backend:", e);
                setError(`Gagal memuat data dari server. Pastikan server lokal (Laragon/XAMPP) berjalan dan file 'api.php' dapat diakses tanpa error. Detail: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleLogin = useCallback((email: string) => {
        // First, check if users have been loaded from backend
        if (allUsers.length === 0) {
            setError("Data pengguna belum termuat. Periksa koneksi ke backend.");
            return;
        }
        const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            setCurrentUser(user);
        } else {
            alert('Login Gagal: Pengguna tidak ditemukan. Silakan periksa database Anda.');
        }
    }, [allUsers]);

    // ... (All other handler functions like logActivity, createNotification, etc. remain the same)
    const logActivity = useCallback((action: string) => {
        if (currentUser) {
            const newLog: ActivityLog = { id: `log-${Date.now()}`, user: currentUser.nama, action, timestamp: new Date().toISOString() };
            setActivityLogs(prev => [newLog, ...prev]);
        }
    }, [currentUser]);

    const createNotification = useCallback((userId: string, suratId: string, pesan: string) => {
        const newNotif: Notifikasi = {
            id: `notif-${Date.now()}`,
            suratId,
            pesan,
            tanggal: new Date().toISOString(),
            isRead: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    const handleResetData = useCallback(() => {
        // This function might need to call a specific API endpoint in the future to reset DB data
        alert("Fungsi reset data perlu diimplementasikan di backend.");
    }, []);
    
    const handleSuratUpdate = useCallback((updatedSurat: AnySurat) => {
        setAllSurat(prev => prev.map(s => s.id === updatedSurat.id ? updatedSurat : s));
    }, []);

    const handleSuratSubmit = (surat: any) => {
        alert("Fungsi 'Submit Surat' perlu diimplementasikan di backend untuk menyimpan data baru ke database.");
        // Placeholder logic to keep UI responsive
        const nextNomorAgenda = allSurat.length > 0 ? Math.max(...allSurat.map(s => s.nomorAgenda || 0)) + 1 : 1;
        const baseProps = {
            id: `new-${Date.now()}`, isArchived: false, fileUrl: '#', unitKerjaId: currentUser!.unitKerjaId,
            nomorAgenda: nextNomorAgenda, komentar: [], tugasTerkait: [], dokumenTerkait: [],
        };
        let newSurat: AnySurat;
        if (surat.tipe === TipeSurat.MASUK) { newSurat = { ...surat, ...baseProps, disposisi: [] } as SuratMasuk; }
        else if (surat.tipe === TipeSurat.KELUAR) { newSurat = { ...surat, ...baseProps, status: 'Draf', version: 1, history: [], approvalChain: [] } as SuratKeluar; }
        else { newSurat = { ...surat, ...baseProps, status: 'Draf', pembuat: currentUser! } as NotaDinas; }
        setAllSurat(prev => [newSurat, ...prev]);
    };
    
    // ... (keep all other handlers like handleArchive, handleAddDisposisi, etc.)
    const handleArchive = (suratId: string, folderId: string) => {
        setAllSurat(prev => prev.map(s => s.id === suratId ? { ...s, isArchived: true, folderId } : s));
        logActivity(`Mengarsipkan surat dengan ID: ${suratId}`);
    };
    const handleBulkArchive = (suratIds: string[], folderId: string) => {
        setAllSurat(prev => prev.map(s => suratIds.includes(s.id) ? { ...s, isArchived: true, folderId } : s));
        logActivity(`Mengarsipkan ${suratIds.length} surat.`);
    };
    const handleAddDisposisi = (suratId: string, catatan: string, tujuanId: string, sifat: SifatDisposisi) => {
        const surat = allSurat.find(s => s.id === suratId) as SuratMasuk;
        if (!surat) return;
        const tujuanUser = allUsers.find(u => u.id === tujuanId);
        if (!tujuanUser) return;
        const newDisposisi: Disposisi = {
            id: `disp-${Date.now()}`, pembuat: currentUser!, tujuan: tujuanUser, tanggal: new Date().toISOString(), catatan, sifat, status: StatusDisposisi.DIPROSES,
            riwayatStatus: [{ status: StatusDisposisi.DIPROSES, tanggal: new Date().toISOString(), oleh: currentUser! }],
        };
        const updatedSurat = { ...surat, disposisi: [...surat.disposisi, newDisposisi] };
        handleSuratUpdate(updatedSurat);
        createNotification(tujuanId, suratId, `Disposisi baru dari ${currentUser!.nama} perihal "${surat.perihal}"`);
        logActivity(`Membuat disposisi untuk surat "${surat.perihal}"`);
    };
    const handleUpdateDisposisiStatus = (suratId: string, disposisiId: string, status: StatusDisposisi) => {
        const surat = allSurat.find(s => s.id === suratId) as SuratMasuk;
        if (!surat) return;
        const updatedDisposisi = surat.disposisi.map(d => d.id === disposisiId ? { ...d, status, riwayatStatus: [...d.riwayatStatus, { status, tanggal: new Date().toISOString(), oleh: currentUser! }] } : d);
        const updatedSurat = { ...surat, disposisi: updatedDisposisi };
        handleSuratUpdate(updatedSurat);
        const disposisi = surat.disposisi.find(d => d.id === disposisiId);
        if (disposisi) createNotification(disposisi.pembuat.id, suratId, `Status disposisi Anda untuk surat "${surat.perihal}" diubah menjadi ${status} oleh ${currentUser!.nama}`);
        logActivity(`Mengubah status disposisi untuk surat "${surat.perihal}" menjadi ${status}`);
    };
    const handleAddKomentar = (suratId: string, teks: string) => {
        const surat = allSurat.find(s => s.id === suratId);
        if (!surat) return;
        const newKomentar: Komentar = { id: `komentar-${Date.now()}`, user: currentUser!, teks, timestamp: new Date().toISOString() };
        const updatedSurat = { ...surat, komentar: [...surat.komentar, newKomentar] };
        handleSuratUpdate(updatedSurat);
        logActivity(`Menambah komentar pada surat "${surat.perihal}"`);
    };
    const handleAddTask = (tugas: Omit<Tugas, 'id'>) => {
        const newTugas: Tugas = { ...tugas, id: `tugas-${Date.now()}` };
        setAllTugas(prev => [newTugas, ...prev]);
        createNotification(tugas.ditugaskanKepada.id, tugas.suratId, `Tugas baru dari ${currentUser!.nama}: "${tugas.deskripsi}"`);
        logActivity(`Membuat tugas baru: "${tugas.deskripsi}"`);
    };
    const handleTambahTandaTangan = (suratId: string, signatureDataUrl?: string) => {
        const surat = allSurat.find(s => s.id === suratId) as SuratKeluar;
        if (!surat || surat.status !== 'Disetujui') return;
        const updatedSurat = { ...surat, tandaTangan: signatureDataUrl || 'SIGNED_WITH_QR' }; 
        handleSuratUpdate(updatedSurat);
        logActivity(`Menambahkan tanda tangan pada surat "${surat.perihal}"`);
    };
    const handleKirimUntukPersetujuan = (suratId: string) => {
        const surat = allSurat.find(s => s.id === suratId) as SuratKeluar;
        if (!surat) return;
        const updatedSurat = { ...surat, status: 'Menunggu Persetujuan' as const };
        handleSuratUpdate(updatedSurat);
        const firstApprover = surat.approvalChain.find(step => step.order === 1);
        if (firstApprover) createNotification(firstApprover.approver.id, suratId, `Permintaan persetujuan untuk surat "${surat.perihal}"`);
        logActivity(`Mengirim surat "${surat.perihal}" untuk persetujuan.`);
    };
    const handlePersetujuan = (suratId: string, stepId: string, decision: 'Disetujui' | 'Ditolak', notes: string) => {
        const surat = allSurat.find(s => s.id === suratId) as SuratKeluar;
        if (!surat) return;
        let nextStatus = surat.status;
        const updatedChain = surat.approvalChain.map(step => step.id === stepId ? { ...step, status: decision, notes, timestamp: new Date().toISOString() } : step);
        if (decision === 'Ditolak') {
            nextStatus = 'Revisi';
            createNotification(surat.pembuat.id, suratId, `Surat "${surat.perihal}" ditolak dan membutuhkan revisi.`);
        } else {
            const currentStepOrder = surat.approvalChain.find(s => s.id === stepId)?.order || 0;
            const nextStep = surat.approvalChain.find(s => s.order === currentStepOrder + 1);
            if (nextStep) { createNotification(nextStep.approver.id, suratId, `Permintaan persetujuan untuk surat "${surat.perihal}"`); } else { nextStatus = 'Disetujui'; createNotification(surat.pembuat.id, suratId, `Surat "${surat.perihal}" telah disetujui sepenuhnya.`); }
        }
        const updatedSurat = { ...surat, status: nextStatus, approvalChain: updatedChain };
        handleSuratUpdate(updatedSurat);
        logActivity(`Memberikan persetujuan (${decision}) pada surat "${surat.perihal}"`);
    };
    const handleReplyWithAI = (surat: SuratMasuk) => { setReplyingSurat({ perihal: `Balasan: ${surat.perihal}`, suratAsliId: surat.id, suratAsli: surat, tujuan: surat.pengirim }); setCurrentPage('surat_keluar'); };
    const handleCreatePermintaan = (permintaan: Omit<PermintaanLaporan, 'id'|'dibuatOleh'|'timestamp'>) => { const newPermintaan: PermintaanLaporan = { ...permintaan, id: `req-${Date.now()}`, dibuatOleh: currentUser!, timestamp: new Date().toISOString() }; setPermintaanLaporanList(prev => [newPermintaan, ...prev]); logActivity(`Membuat permintaan laporan baru: "${newPermintaan.nama}"`); };
    const handleCreatePengiriman = (pengiriman: Omit<PengirimanLaporan, 'id'|'dikirimOleh'|'tanggalPengiriman'|'status'>) => { const newPengiriman: PengirimanLaporan = { ...pengiriman, id: `sub-${Date.now()}`, dikirimOleh: currentUser!, tanggalPengiriman: new Date().toISOString(), status: 'Tepat Waktu' }; setPengirimanLaporanList(prev => [newPengiriman, ...prev]); const permintaanTerkait = permintaanLaporanList.find(p => p.id === newPengiriman.permintaanId); logActivity(`Mengirimkan laporan: "${permintaanTerkait?.nama || ''}" untuk periode ${newPengiriman.periodeLaporan}`); };
    const handleCreateTiket = (tiket: Omit<Tiket, 'id' | 'pembuat' | 'tanggalDibuat' | 'tanggalUpdate' | 'status' | 'balasan'>) => { const newTiket: Tiket = { ...tiket, id: `tiket-${Date.now()}`, pembuat: currentUser!, tanggalDibuat: new Date().toISOString(), tanggalUpdate: new Date().toISOString(), status: 'Baru', balasan: [] }; setTiketList(prev => [newTiket, ...prev]); logActivity(`Membuat tiket bantuan baru: "${newTiket.judul}"`); };
    const handleUpdateTiket = (updatedTiket: Tiket) => { setTiketList(prev => prev.map(t => t.id === updatedTiket.id ? { ...updatedTiket, tanggalUpdate: new Date().toISOString() } : t)); logActivity(`Memperbarui tiket bantuan: "${updatedTiket.judul}"`); };
    const handleSendMessage = (roomId: string, text: string) => { const newMessage: ChatMessage = { id: `msg-${Date.now()}`, roomId, senderId: currentUser!.id, text, timestamp: new Date().toISOString() }; setChatMessages(prev => [...prev, newMessage]); setChatRooms(prev => prev.map(room => room.id === roomId ? { ...room, lastMessage: newMessage } : room)); };
    const handleNotificationClick = (suratId: string, notifId: string) => { setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n)); const surat = allSurat.find(s => s.id === suratId); if (!surat) return; if (surat.tipe === TipeSurat.MASUK) setCurrentPage('surat_masuk'); else if (surat.tipe === TipeSurat.KELUAR) setCurrentPage('surat_keluar'); else if (surat.tipe === TipeSurat.NOTA_DINAS) setCurrentPage('nota_dinas'); };
    const activePengumuman = useMemo(() => pengumumanList.filter(p => { const now = new Date(); const startDate = new Date(p.tanggalMulai); const endDate = new Date(p.tanggalSelesai); startDate.setHours(0,0,0,0); endDate.setHours(23,59,59,999); return p.isActive && now >= startDate && now <= endDate; }), [pengumumanList]);
    const clearInitialData = () => { setReplyingSurat(null); }

    // --- RENDER LOGIC ---

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-600">Memuat data aplikasi...</div>;
    }
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-red-50 text-red-700 p-8">
                <div className="max-w-2xl text-center">
                    <h2 className="text-xl font-bold mb-4">Terjadi Kesalahan</h2>
                    <p className="text-left bg-red-100 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">{error}</p>
                </div>
            </div>
        );
    }
    
    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} brandingSettings={brandingSettings} />;
    }

    const renderPage = () => {
        const suratMasuk = allSurat.filter(s => s.tipe === TipeSurat.MASUK && !s.isArchived) as SuratMasuk[];
        const suratKeluar = allSurat.filter(s => s.tipe === TipeSurat.KELUAR && !s.isArchived) as SuratKeluar[];
        const notaDinas = allSurat.filter(s => s.tipe === TipeSurat.NOTA_DINAS && !s.isArchived) as NotaDinas[];
        const archivedSurat = allSurat.filter(s => s.isArchived);

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard
                    suratMasukCount={suratMasuk.length}
                    suratKeluarCount={suratKeluar.length}
                    archivedCount={archivedSurat.length}
                    allSurat={allSurat}
                    allTugas={allTugas}
                    permintaanLaporanList={permintaanLaporanList}
                    pengirimanLaporanList={pengirimanLaporanList}
                    currentUser={currentUser}
                    widgetLayout={widgetLayout}
                    onWidgetLayoutChange={setWidgetLayout}
                />;
            case 'surat_masuk':
                return <SuratMasukComponent
                    suratList={suratMasuk}
                    kategoriList={kategoriList}
                    unitKerjaList={unitKerjaList}
                    allUsers={allUsers}
                    currentUser={currentUser}
                    allSurat={allSurat}
                    kopSuratSettings={kopSuratSettings}
                    appSettings={appSettings}
                    folders={folders}
                    onSubmit={handleSuratSubmit}
                    onUpdate={handleSuratUpdate}
                    onArchive={handleArchive}
                    onBulkArchive={handleBulkArchive}
                    onAddDisposisi={handleAddDisposisi}
                    onUpdateDisposisiStatus={handleUpdateDisposisiStatus}
                    onReplyWithAI={handleReplyWithAI}
                    onAddKomentar={handleAddKomentar}
                    onAddTask={handleAddTask}
                />;
            case 'surat_keluar':
                return <SuratKeluarComponent
                    suratList={suratKeluar}
                    kategoriList={kategoriList}
                    masalahUtamaList={masalahUtamaList}
                    klasifikasiList={klasifikasiList}
                    unitKerjaList={unitKerjaList}
                    currentUser={currentUser}
                    allUsers={allUsers}
                    allSurat={allSurat}
                    allTemplates={templates}
                    kopSuratSettings={kopSuratSettings}
                    appSettings={appSettings}
                    penomoranSettings={penomoranSettings}
                    folders={folders}
                    onSubmit={handleSuratSubmit}
                    onUpdate={handleSuratUpdate}
                    onArchive={handleArchive}
                    onBulkArchive={handleBulkArchive}
                    onTambahTandaTangan={handleTambahTandaTangan}
                    onKirimUntukPersetujuan={handleKirimUntukPersetujuan}
                    onPersetujuan={handlePersetujuan}
                    onAddKomentar={handleAddKomentar}
                    onAddTask={handleAddTask}
                    initialData={replyingSurat}
                    clearInitialData={clearInitialData}
                />;
            case 'nota_dinas':
                 return <NotaDinasComponent
                    suratList={notaDinas}
                    kategoriList={kategoriList}
                    unitKerjaList={unitKerjaList}
                    currentUser={currentUser}
                    allUsers={allUsers}
                    kopSuratSettings={kopSuratSettings}
                    appSettings={appSettings}
                    folders={folders}
                    onSubmit={handleSuratSubmit}
                    onUpdate={handleSuratUpdate}
                    onArchive={handleArchive}
                    onAddKomentar={handleAddKomentar}
                    onAddTask={handleAddTask}
                />;
            case 'obrolan':
                return <Chat
                    chatRooms={chatRooms}
                    chatMessages={chatMessages}
                    currentUser={currentUser}
                    allUsers={allUsers}
                    onSendMessage={handleSendMessage}
                />;
            case 'buku_agenda':
                return <BukuAgenda allSurat={allSurat} allUsers={allUsers} />;
            case 'perjalanan_dinas':
                return <PerjalananDinasComponent
                    perjalananDinasList={perjalananDinasList}
                    suratKeluarList={suratKeluar}
                    currentUser={currentUser}
                    allUsers={allUsers}
                    onAddLaporan={() => {}}
                />;
            case 'kalender':
                return <Kalender
                    allSurat={allSurat}
                    allTugas={allTugas}
                    perjalananDinasList={perjalananDinasList}
                    currentUser={currentUser}
                />;
            case 'arsip':
                return <Arsip suratList={archivedSurat} folders={folders} kategoriList={kategoriList} currentUser={currentUser} onCreateFolder={(nama) => setFolders(prev => [...prev, {id: `folder-${Date.now()}`, nama}])} />;
            case 'pencarian':
                return <PencarianCerdas allSurat={allSurat} kategoriList={kategoriList} />;
            case 'laporan':
                return <Laporan allSurat={allSurat} allKategori={kategoriList} allUsers={allUsers} kopSuratSettings={kopSuratSettings} unitKerjaList={unitKerjaList} currentUser={currentUser} />;
            case 'pelaporan_periodik':
                return <PelaporanPeriodik
                    permintaanList={permintaanLaporanList}
                    pengirimanList={pengirimanLaporanList}
                    currentUser={currentUser}
                    unitKerjaList={unitKerjaList}
                    allUsers={allUsers}
                    onCreatePermintaan={handleCreatePermintaan}
                    onUpdatePermintaan={() => {}}
                    onDeletePermintaan={() => {}}
                    onCreatePengiriman={handleCreatePengiriman}
                />;
            case 'verifikasi':
                return <VerifikasiDokumen suratKeluarList={allSurat.filter(s => s.tipe === TipeSurat.KELUAR) as SuratKeluar[]} />;
            case 'helpdesk':
                return <Helpdesk
                    tiketList={tiketList}
                    currentUser={currentUser}
                    allUsers={allUsers}
                    onCreateTiket={handleCreateTiket}
                    onUpdateTiket={handleUpdateTiket}
                />;
            case 'administrasi':
                return <Administrasi
                    users={allUsers}
                    unitKerjaList={unitKerjaList}
                    kategoriList={kategoriList}
                    masalahUtamaList={masalahUtamaList}
                    klasifikasiList={klasifikasiList}
                    kebijakanRetensiList={kebijakanRetensi}
                    templateList={templates}
                    pengumumanList={pengumumanList}
                    activityLogs={activityLogs}
                    allSurat={allSurat}
                    currentUser={currentUser}
                    handlers={{
                        setUsers: setAllUsers,
                        setUnitKerjaList: setUnitKerjaList,
                        setKategoriList: setKategoriList,
                        setMasalahUtamaList: setMasalahUtamaList,
                        setKlasifikasiList: setKlasifikasiList,
                        setKebijakanRetensiList: setKebijakanRetensi,
                        setTemplateList: setTemplates,
                        setPengumumanList: setPengumumanList,
                        logActivity,
                        onResetData: handleResetData,
                    }}
                 />;
            case 'pengaturan':
                return <Pengaturan
                    settings={appSettings}
                    onSettingsChange={setAppSettings}
                    currentUser={currentUser}
                    allUsers={allUsers}
                    onSetDelegasi={()=>{}} 
                    kopSuratSettings={kopSuratSettings}
                    onUpdateKopSurat={setKopSuratSettings}
                    penomoranSettings={penomoranSettings}
                    onUpdatePenomoran={setPenomoranSettings}
                    brandingSettings={brandingSettings}
                    onUpdateBranding={setBrandingSettings}
                />;
            default:
                return <div>Page not found</div>;
        }
    };
    
    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <aside className="w-64 bg-slate-800 text-white flex flex-col flex-shrink-0">
                <div className="h-16 flex items-center justify-center px-4 border-b border-slate-700">
                    {brandingSettings.appLogoUrl ? (
                         <img src={brandingSettings.appLogoUrl} alt="App Logo" className="h-10 object-contain" />
                    ) : (
                        <span className="text-xl font-bold">STAR E-ARSIM</span>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <AppNav currentPage={currentPage} onNavigate={setCurrentPage} currentUser={currentUser} />
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <h1 className="text-xl font-semibold text-slate-800 capitalize">{currentPage.replace(/_/g, ' ')}</h1>
                    <div className="flex items-center space-x-4">
                        <NotificationBell notifications={notifications} onNotificationClick={handleNotificationClick} />
                        <div>
                            <p className="font-semibold text-sm text-slate-700">{currentUser.nama}</p>
                            <p className="text-xs text-slate-500">{currentUser.jabatan}</p>
                        </div>
                         <button onClick={() => setCurrentUser(null)} className="text-sm text-slate-600 hover:text-red-600">Logout</button>
                    </div>
                </header>
                <AnnouncementBanner pengumumanList={activePengumuman} />
                <main className="flex-1 overflow-y-auto p-6">
                    {renderPage()}
                </main>
                <footer className="text-center py-4 text-xs text-slate-500 bg-slate-100 flex-shrink-0">
                    <p>© 2025 STAR E-ARSIM SULTRA by Acn. All rights reserved.</p>
                    <p>KANWIL DITJEN IMIGRASI SULAWESI TENGGARA</p>
                </footer>
            </div>
            <BantuanAI />
        </div>
    );
};

export default App;