
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    mockUsers, mockUnitKerja, mockKategori, mockMasalahUtama, mockKlasifikasi,
    mockFolders, mockNotifikasi, mockActivityLogs, mockKopSuratSettings, mockAppSettings,
    mockPenomoranSettings, mockBrandingSettings, mockKebijakanRetensi, mockTemplates, mockPengumuman, mockAllSurat as initialAllSurat, mockTugas, mockPermintaanLaporan, mockPengirimanLaporan, mockTiket, mockPerjalananDinas, mockChatRooms, mockChatMessages
} from './mock-data';
import {
    User, UnitKerja, KategoriSurat, MasalahUtama, KlasifikasiSurat, SuratMasuk, SuratKeluar,
    FolderArsip, Notifikasi, ActivityLog, AnySurat, KopSuratSettings, AppSettings,
    PenomoranSettings, BrandingSettings, KebijakanRetensi, TipeSurat, SifatDisposisi,
    StatusDisposisi, ApprovalStep, TemplateSurat, Pengumuman, NotaDinas, UserRole, Tugas, DashboardLayoutSettings, PermintaanLaporan, PengirimanLaporan, Tiket, PerjalananDinas, ChatRoom, ChatMessage, Disposisi, Komentar
} from './types';
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

    // --- STATE MANAGEMENT ---
    const [allSurat, setAllSurat] = useState<AnySurat[]>(initialAllSurat);
    const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
    const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>(mockUnitKerja);
    const [kategoriList, setKategoriList] = useState<KategoriSurat[]>(mockKategori);
    const [masalahUtamaList, setMasalahUtamaList] = useState<MasalahUtama[]>(mockMasalahUtama);
    const [klasifikasiList, setKlasifikasiList] = useState<KlasifikasiSurat[]>(mockKlasifikasi);
    const [folders, setFolders] = useState<FolderArsip[]>(mockFolders);
    const [notifications, setNotifications] = useState<Notifikasi[]>(mockNotifikasi);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
    const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>(mockPengumuman);
    const [allTugas, setAllTugas] = useState<Tugas[]>(mockTugas);
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

    // Navigation state
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [replyingSurat, setReplyingSurat] = useState<(Partial<SuratKeluar> & { suratAsli?: SuratMasuk }) | null>(null);

    // FIX: Added login handler function.
    const handleLogin = useCallback((email: string) => {
        const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            setCurrentUser(user);
        }
    }, [allUsers]);

    // --- UTILITY & NOTIFICATION HANDLERS ---
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
        // In a real app, this would be targeted to the specific user. Here we add it to a global list.
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    // --- DATA RESET HANDLER ---
    const handleResetData = useCallback(() => {
        setAllSurat([]);
        setAllTugas([]);
        setPerjalananDinasList([]);
        logActivity("Melakukan reset data surat, disposisi, dan tugas.");
        alert("Semua data surat, disposisi, tugas, dan perjalanan dinas telah direset.");
    }, [logActivity]);
    
    // --- UNIVERSAL UPDATE HANDLER ---
    const handleSuratUpdate = useCallback((updatedSurat: AnySurat) => {
        setAllSurat(prev => prev.map(s => s.id === updatedSurat.id ? updatedSurat : s));
    }, []);

    // --- SURAT & RELATED ITEMS HANDLERS ---
    const handleSuratSubmit = (surat: any) => {
        const nextNomorAgenda = allSurat.length > 0 ? Math.max(...allSurat.map(s => s.nomorAgenda || 0)) + 1 : 1;
        const baseProps = {
            id: `${surat.tipe === TipeSurat.MASUK ? 'sm' : (surat.tipe === TipeSurat.KELUAR ? 'sk' : 'nd')}-${Date.now()}`,
            isArchived: false,
            fileUrl: '#',
            unitKerjaId: currentUser!.unitKerjaId,
            nomorAgenda: nextNomorAgenda,
            komentar: [],
            tugasTerkait: [],
            dokumenTerkait: [],
        };
        let newSurat: AnySurat;
        if (surat.tipe === TipeSurat.MASUK) {
            newSurat = { ...surat, ...baseProps, disposisi: [] } as SuratMasuk;
        } else if (surat.tipe === TipeSurat.KELUAR) {
            const manajerialApprover = allUsers.find(u => u.role === UserRole.MANAJERIAL);
            const pimpinanApprover = allUsers.find(u => u.role === UserRole.PIMPINAN);
            const approvalChain: ApprovalStep[] = [];
            if (manajerialApprover) approvalChain.push({ id: `app-${Date.now()}-1`, approver: manajerialApprover, status: 'Menunggu', order: 1 });
            if (pimpinanApprover) approvalChain.push({ id: `app-${Date.now()}-2`, approver: pimpinanApprover, status: 'Menunggu', order: 2 });
            let perjalananDinasId: string | undefined = undefined;
            if (surat.jenisSuratKeluar === 'SPPD' && surat.perjalananDinasData) {
                const newPerjalananDinas: PerjalananDinas = {
                    ...surat.perjalananDinasData,
                    id: `pd-${Date.now()}`,
                    suratTugasId: baseProps.id,
                    status: 'Direncanakan',
                };
                perjalananDinasId = newPerjalananDinas.id;
                setPerjalananDinasList(prev => [newPerjalananDinas, ...prev]);
            }
            newSurat = { ...surat, ...baseProps, status: 'Draf', version: 1, history: [], approvalChain, perjalananDinasId } as SuratKeluar;
        } else if (surat.tipe === TipeSurat.NOTA_DINAS) {
            newSurat = { ...surat, ...baseProps, status: 'Draf', pembuat: currentUser! } as NotaDinas;
        } else { return; }
        setAllSurat(prev => [newSurat, ...prev]);
        logActivity(`Membuat ${newSurat.tipe.toLowerCase()} baru: "${newSurat.perihal}"`);
    };

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
            id: `disp-${Date.now()}`,
            pembuat: currentUser!,
            tujuan: tujuanUser,
            tanggal: new Date().toISOString(),
            catatan,
            sifat,
            status: StatusDisposisi.DIPROSES,
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
        const updatedDisposisi = surat.disposisi.map(d => {
            if (d.id === disposisiId) {
                return { ...d, status, riwayatStatus: [...d.riwayatStatus, { status, tanggal: new Date().toISOString(), oleh: currentUser! }] };
            }
            return d;
        });
        const updatedSurat = { ...surat, disposisi: updatedDisposisi };
        handleSuratUpdate(updatedSurat);
        const disposisi = surat.disposisi.find(d => d.id === disposisiId);
        if (disposisi) createNotification(disposisi.pembuat.id, suratId, `Status disposisi Anda untuk surat "${surat.perihal}" diubah menjadi ${status} oleh ${currentUser!.nama}`);
        logActivity(`Mengubah status disposisi untuk surat "${surat.perihal}" menjadi ${status}`);
    };

    const handleAddKomentar = (suratId: string, teks: string) => {
        const surat = allSurat.find(s => s.id === suratId);
        if (!surat) return;
        const newKomentar: Komentar = {
            id: `komentar-${Date.now()}`,
            user: currentUser!,
            teks,
            timestamp: new Date().toISOString(),
        };
        const updatedSurat = { ...surat, komentar: [...surat.komentar, newKomentar] };
        handleSuratUpdate(updatedSurat);
        logActivity(`Menambah komentar pada surat "${surat.perihal}"`);
    };

    const handleAddTask = (tugas: Omit<Tugas, 'id'>) => {
        const newTugas: Tugas = {
            ...tugas,
            id: `tugas-${Date.now()}`,
        };
        setAllTugas(prev => [newTugas, ...prev]);
        createNotification(tugas.ditugaskanKepada.id, tugas.suratId, `Tugas baru dari ${currentUser!.nama}: "${tugas.deskripsi}"`);
        logActivity(`Membuat tugas baru: "${tugas.deskripsi}"`);
    };
    
    const handleTambahTandaTangan = (suratId: string, signatureDataUrl?: string) => {
        const surat = allSurat.find(s => s.id === suratId) as SuratKeluar;
        if (!surat || surat.status !== 'Disetujui') return;
        const updatedSurat = { ...surat, tandaTangan: signatureDataUrl || 'SIGNED_WITH_QR' }; // Use placeholder for QR
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
        const updatedChain = surat.approvalChain.map(step => {
            if (step.id === stepId) {
                return { ...step, status: decision, notes, timestamp: new Date().toISOString() };
            }
            return step;
        });

        if (decision === 'Ditolak') {
            nextStatus = 'Revisi';
            createNotification(surat.pembuat.id, suratId, `Surat "${surat.perihal}" ditolak dan membutuhkan revisi.`);
        } else {
            const currentStepOrder = surat.approvalChain.find(s => s.id === stepId)?.order || 0;
            const nextStep = surat.approvalChain.find(s => s.order === currentStepOrder + 1);
            if (nextStep) {
                createNotification(nextStep.approver.id, suratId, `Permintaan persetujuan untuk surat "${surat.perihal}"`);
            } else {
                nextStatus = 'Disetujui';
                createNotification(surat.pembuat.id, suratId, `Surat "${surat.perihal}" telah disetujui sepenuhnya.`);
            }
        }
        
        const updatedSurat = { ...surat, status: nextStatus, approvalChain: updatedChain };
        handleSuratUpdate(updatedSurat);
        logActivity(`Memberikan persetujuan (${decision}) pada surat "${surat.perihal}"`);
    };

    const handleReplyWithAI = (surat: SuratMasuk) => {
        setReplyingSurat({
            perihal: `Balasan: ${surat.perihal}`,
            suratAsliId: surat.id,
            suratAsli: surat,
            tujuan: surat.pengirim
        });
        setCurrentPage('surat_keluar');
    };

    // --- OTHER HANDLERS ---
    const handleCreatePermintaan = (permintaan: Omit<PermintaanLaporan, 'id'|'dibuatOleh'|'timestamp'>) => {
        const newPermintaan: PermintaanLaporan = {
            ...permintaan,
            id: `req-${Date.now()}`,
            dibuatOleh: currentUser!,
            timestamp: new Date().toISOString(),
        };
        setPermintaanLaporanList(prev => [newPermintaan, ...prev]);
        logActivity(`Membuat permintaan laporan baru: "${newPermintaan.nama}"`);
    };

    const handleCreatePengiriman = (pengiriman: Omit<PengirimanLaporan, 'id'|'dikirimOleh'|'tanggalPengiriman'|'status'>) => {
        const newPengiriman: PengirimanLaporan = {
            ...pengiriman,
            id: `sub-${Date.now()}`,
            dikirimOleh: currentUser!,
            tanggalPengiriman: new Date().toISOString(),
            status: 'Tepat Waktu', // Simplified status for now
        };
        setPengirimanLaporanList(prev => [newPengiriman, ...prev]);
        const permintaanTerkait = permintaanLaporanList.find(p => p.id === newPengiriman.permintaanId);
        logActivity(`Mengirimkan laporan: "${permintaanTerkait?.nama || ''}" untuk periode ${newPengiriman.periodeLaporan}`);
    };
    
    const handleCreateTiket = (tiket: Omit<Tiket, 'id' | 'pembuat' | 'tanggalDibuat' | 'tanggalUpdate' | 'status' | 'balasan'>) => {
        const newTiket: Tiket = {
            ...tiket,
            id: `tiket-${Date.now()}`,
            pembuat: currentUser!,
            tanggalDibuat: new Date().toISOString(),
            tanggalUpdate: new Date().toISOString(),
            status: 'Baru',
            balasan: [],
        };
        setTiketList(prev => [newTiket, ...prev]);
        logActivity(`Membuat tiket bantuan baru: "${newTiket.judul}"`);
    };

    const handleUpdateTiket = (updatedTiket: Tiket) => {
        setTiketList(prev => prev.map(t => t.id === updatedTiket.id ? { ...updatedTiket, tanggalUpdate: new Date().toISOString() } : t));
        logActivity(`Memperbarui tiket bantuan: "${updatedTiket.judul}"`);
    };

    const handleSendMessage = (roomId: string, text: string) => {
        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            roomId,
            senderId: currentUser!.id,
            text,
            timestamp: new Date().toISOString(),
        };
        setChatMessages(prev => [...prev, newMessage]);
        // Update last message in room
        setChatRooms(prev => prev.map(room => room.id === roomId ? { ...room, lastMessage: newMessage } : room));
    };

    const handleNotificationClick = (suratId: string, notifId: string) => {
        setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
        const surat = allSurat.find(s => s.id === suratId);
        if (!surat) return;

        if (surat.tipe === TipeSurat.MASUK) setCurrentPage('surat_masuk');
        else if (surat.tipe === TipeSurat.KELUAR) setCurrentPage('surat_keluar');
        else if (surat.tipe === TipeSurat.NOTA_DINAS) setCurrentPage('nota_dinas');
        // Future: could also open the detail modal directly
    };
    
    const activePengumuman = useMemo(() => pengumumanList.filter(p => {
        const now = new Date();
        const startDate = new Date(p.tanggalMulai);
        const endDate = new Date(p.tanggalSelesai);
        startDate.setHours(0,0,0,0);
        endDate.setHours(23,59,59,999);
        return p.isActive && now >= startDate && now <= endDate;
    }), [pengumumanList]);


    const clearInitialData = () => {
        setReplyingSurat(null);
    }
    
    // RENDER LOGIC
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
                    onSetDelegasi={()=>{}} // Placeholder for delegation logic
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
