import React, { useState, useCallback } from 'react';
import {
    mockUsers, mockUnitKerja, mockKategori, mockMasalahUtama, mockKlasifikasi,
    mockFolders, mockNotifikasi, mockActivityLogs, mockKopSuratSettings, mockAppSettings,
    mockPenomoranSettings, mockBrandingSettings, mockKebijakanRetensi, mockTemplates, mockPengumuman, mockAllSurat as initialAllSurat, mockTugas, mockPermintaanLaporan, mockPengirimanLaporan, mockTiket, mockPerjalananDinas
} from './mock-data';
import {
    User, UnitKerja, KategoriSurat, MasalahUtama, KlasifikasiSurat, SuratMasuk, SuratKeluar,
    FolderArsip, Notifikasi, ActivityLog, AnySurat, KopSuratSettings, AppSettings,
    PenomoranSettings, BrandingSettings, KebijakanRetensi, TipeSurat, SifatDisposisi,
    StatusDisposisi, ApprovalStep, TemplateSurat, Pengumuman, NotaDinas, UserRole, Tugas, DashboardLayoutSettings, PermintaanLaporan, PengirimanLaporan, Tiket, PerjalananDinas
} from './types';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import SuratMasukComponent from './components/SuratMasuk';
import SuratKeluarComponent from './components/SuratKeluar';
import Arsip from './components/Arsip';
import Pengaturan from './components/Pengaturan';
import Administrasi from './components/Administrasi';
import NotificationBell from './components/NotificationBell';
import { ArchiveIcon, InboxIcon, OutboxIcon, SearchIcon, ClipboardListIcon, ShieldCheckIcon, CogIcon, UsersIcon, ArchiveBoxArrowDownIcon, PaperAirplaneIcon, DocumentChartBarIcon, BookOpenIcon, GlobeAltIcon, CalendarIcon } from './components/icons';
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

type Page = 'dashboard' | 'surat_masuk' | 'surat_keluar' | 'nota_dinas' | 'buku_agenda' | 'perjalanan_dinas' | 'kalender' | 'arsip' | 'pencarian' | 'laporan' | 'pelaporan_periodik' | 'verifikasi' | 'helpdesk' | 'administrasi' | 'pengaturan';

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
    ];
    
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) {
        navItems.push({ id: 'administrasi', label: 'Administrasi', icon: <UsersIcon className="w-5 h-5" /> });
    }

    navItems.push({ id: 'pengaturan', label: 'Pengaturan', icon: <CogIcon className="w-5 h-5" /> });

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
    const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>(mockPengumuman.filter(p => {
        const now = new Date();
        const endDate = new Date(p.tanggalSelesai);
        endDate.setHours(23, 59, 59, 999);
        return p.isActive && now <= endDate;
    }));
    const [allTugas, setAllTugas] = useState<Tugas[]>(mockTugas);
    const [templates, setTemplates] = useState<TemplateSurat[]>(mockTemplates);
    const [permintaanLaporanList, setPermintaanLaporanList] = useState<PermintaanLaporan[]>(mockPermintaanLaporan);
    const [pengirimanLaporanList, setPengirimanLaporanList] = useState<PengirimanLaporan[]>(mockPengirimanLaporan);
    const [tiketList, setTiketList] = useState<Tiket[]>(mockTiket);
    const [perjalananDinasList, setPerjalananDinasList] = useState<PerjalananDinas[]>(mockPerjalananDinas);

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

    // --- HANDLERS ---
    const handleLogin = (email: string) => {
        const user = allUsers.find(u => u.email === email);
        if (user) {
            setCurrentUser(user);
        } else {
            alert('User not found!');
        }
    };
    
    const logActivity = useCallback((action: string) => {
        if (currentUser) {
            const newLog: ActivityLog = { id: `log-${Date.now()}`, user: currentUser.nama, action, timestamp: new Date().toISOString() };
            setActivityLogs(prev => [newLog, ...prev]);
        }
    }, [currentUser]);

    const handleResetData = useCallback(() => {
        setAllSurat([]);
        setAllTugas([]);
        logActivity("Melakukan reset data surat, disposisi, dan tugas.");
        alert("Semua data surat, disposisi, dan tugas telah direset.");
    }, [logActivity]);


    // FIX: Changed parameter type to `any` and added type assertions to fix complex type issues.
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
            newSurat = {
                ...surat,
                ...baseProps,
                disposisi: [],
            } as SuratMasuk;
        } else if (surat.tipe === TipeSurat.KELUAR) {
            const manajerialApprover = allUsers.find(u => u.role === UserRole.MANAJERIAL);
            const pimpinanApprover = allUsers.find(u => u.role === UserRole.PIMPINAN);
            const approvalChain: ApprovalStep[] = [];

            if (manajerialApprover) {
                approvalChain.push({ id: `app-${Date.now()}-1`, approver: manajerialApprover, status: 'Menunggu', order: 1 });
            }
            if (pimpinanApprover) {
                approvalChain.push({ id: `app-${Date.now()}-2`, approver: pimpinanApprover, status: 'Menunggu', order: 2 });
            }

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
            
            newSurat = {
                ...surat,
                ...baseProps,
                status: 'Draf',
                version: 1,
                history: [],
                approvalChain: approvalChain,
                perjalananDinasId: perjalananDinasId,
            } as SuratKeluar;

        } else if (surat.tipe === TipeSurat.NOTA_DINAS) {
            newSurat = {
                ...surat,
                ...baseProps,
                status: 'Draf',
                pembuat: currentUser!,
            } as NotaDinas;
        } else {
            return;
        }
        
        setAllSurat(prev => [newSurat, ...prev]);
        logActivity(`Membuat ${newSurat.tipe.toLowerCase()} baru: "${newSurat.perihal}"`);
    };

    const handleSuratUpdate = (surat: AnySurat) => {
        setAllSurat(prev => prev.map(s => s.id === surat.id ? surat : s));
        logActivity(`Memperbarui surat "${surat.perihal}"`);
    };
    
     const handleArchive = (suratId: string, folderId: string) => {
        setAllSurat(prev => prev.map(s => s.id === suratId ? { ...s, isArchived: true, folderId } : s));
        logActivity(`Mengarsipkan surat dengan ID: ${suratId}`);
    };

    const handleBulkArchive = (suratIds: string[], folderId: string) => {
        setAllSurat(prev => prev.map(s => suratIds.includes(s.id) ? { ...s, isArchived: true, folderId } : s));
        logActivity(`Mengarsipkan ${suratIds.length} surat.`);
    };
    
    // ... other handlers would go here ...
    const handleReplyWithAI = (surat: SuratMasuk) => {
        setReplyingSurat({
            perihal: `Balasan: ${surat.perihal}`,
            suratAsliId: surat.id,
            suratAsli: surat,
            tujuan: surat.pengirim
        });
        setCurrentPage('surat_keluar');
    };

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
                    onAddDisposisi={()=>{}}
                    onUpdateDisposisiStatus={()=>{}}
                    onReplyWithAI={handleReplyWithAI}
                    onAddKomentar={()=>{}}
                    onAddTask={()=>{}}
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
                    onTambahTandaTangan={()=>{}}
                    onKirimUntukPersetujuan={()=>{}}
                    onPersetujuan={()=>{}}
                    onAddKomentar={()=>{}}
                    onAddTask={()=>{}}
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
                    onAddKomentar={() => {}}
                    onAddTask={() => {}}
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
                return <Arsip suratList={archivedSurat} folders={folders} kategoriList={kategoriList} currentUser={currentUser} onCreateFolder={()=>{}} />;
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
                    pengumumanList={mockPengumuman} // Show all for management
                    activityLogs={activityLogs}
                    allSurat={allSurat}
                    currentUser={currentUser}
                    // Pass handlers
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
                <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-slate-700">
                    STAR E-ARSIM
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <AppNav currentPage={currentPage} onNavigate={setCurrentPage} currentUser={currentUser} />
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <h1 className="text-xl font-semibold text-slate-800 capitalize">{currentPage.replace('_', ' ')}</h1>
                    <div className="flex items-center space-x-4">
                        <NotificationBell notifications={notifications} onNotificationClick={() => {}} />
                        <div>
                            <p className="font-semibold text-sm text-slate-700">{currentUser.nama}</p>
                            <p className="text-xs text-slate-500">{currentUser.jabatan}</p>
                        </div>
                         <button onClick={() => setCurrentUser(null)} className="text-sm text-slate-600 hover:text-red-600">Logout</button>
                    </div>
                </header>
                <AnnouncementBanner pengumumanList={pengumumanList} />
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