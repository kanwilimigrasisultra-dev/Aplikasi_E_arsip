import React, { useState, useMemo, useCallback } from 'react';

// --- MOCK DATA IMPORTS ---
import {
    mockUsers, mockUnitKerja, mockKategori, mockMasalahUtama, mockKlasifikasi,
    mockSuratMasuk, mockSuratKeluar, mockFolders, mockNotifikasi, mockActivityLogs,
    mockKopSuratSettings, mockAppSettings, mockPenomoranSettings, mockBrandingSettings, mockKebijakanRetensi
} from './mock-data';

// --- TYPE IMPORTS ---
import {
    User, UnitKerja, KategoriSurat, MasalahUtama, KlasifikasiSurat,
    SuratMasuk, SuratKeluar, AnySurat, FolderArsip, Notifikasi, ActivityLog,
    KopSuratSettings, AppSettings, PenomoranSettings, TipeSurat, SifatDisposisi, StatusDisposisi, Disposisi, UserRole, BrandingSettings, KebijakanRetensi
} from './types';

// --- COMPONENT IMPORTS ---
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import SuratMasukComponent from './components/SuratMasuk';
import SuratKeluarComponent from './components/SuratKeluar';
import Arsip from './components/Arsip';
import Administrasi from './components/Administrasi';
import Pengaturan from './components/Pengaturan';
import PencarianCerdas from './components/PencarianCerdas';
import VerifikasiDokumen from './components/VerifikasiDokumen';
import Laporan from './components/Laporan';
import NotificationBell from './components/NotificationBell';
import { ArchiveIcon, CogIcon, InboxIcon, OutboxIcon, SearchIcon, ShieldCheckIcon, UsersIcon, SparklesIcon, ClipboardListIcon } from './components/icons';
import { HomeIcon } from '@heroicons/react/24/outline';


type Page = 'dashboard' | 'surat-masuk' | 'surat-keluar' | 'arsip' | 'pencarian' | 'verifikasi' | 'laporan' | 'administrasi' | 'pengaturan';

// Main App Component
function App() {
    // --- STATE MANAGEMENT ---
    const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
    const [allSurat, setAllSurat] = useState<AnySurat[]>([...mockSuratMasuk, ...mockSuratKeluar]);
    const [allFolders, setAllFolders] = useState<FolderArsip[]>(mockFolders);
    const [allKategori, setAllKategori] = useState<KategoriSurat[]>(mockKategori);
    const [allUnitKerja, setAllUnitKerja] = useState<UnitKerja[]>(mockUnitKerja);
    const [allMasalahUtama, setAllMasalahUtama] = useState<MasalahUtama[]>(mockMasalahUtama);
    const [allKlasifikasi, setAllKlasifikasi] = useState<KlasifikasiSurat[]>(mockKlasifikasi);
    const [allKebijakanRetensi, setAllKebijakanRetensi] = useState<KebijakanRetensi[]>(mockKebijakanRetensi);
    const [notifications, setNotifications] = useState<Notifikasi[]>(mockNotifikasi);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
    const [kopSuratSettings, setKopSuratSettings] = useState<KopSuratSettings>(mockKopSuratSettings);
    const [appSettings, setAppSettings] = useState<AppSettings>(mockAppSettings);
    const [penomoranSettings, setPenomoranSettings] = useState<PenomoranSettings>(mockPenomoranSettings);
    const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(mockBrandingSettings);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [suratKeluarInitialData, setSuratKeluarInitialData] = useState<(Partial<SuratKeluar> & { suratAsli?: SuratMasuk }) | null>(null);

    // --- COMPUTED DATA (MEMOIZED) ---
    const activeSuratMasuk = useMemo(() => allSurat.filter(s => s.tipe === TipeSurat.MASUK && !s.isArchived) as SuratMasuk[], [allSurat]);
    const activeSuratKeluar = useMemo(() => allSurat.filter(s => s.tipe === TipeSurat.KELUAR && !s.isArchived) as SuratKeluar[], [allSurat]);
    const archivedSurat = useMemo(() => allSurat.filter(s => s.isArchived), [allSurat]);

    // --- LOGGING HELPER ---
    const logAction = useCallback((action: string) => {
        if (!currentUser) return;
        const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            user: currentUser.nama,
            action,
            timestamp: new Date().toISOString()
        };
        setActivityLogs(prev => [newLog, ...prev]);
    }, [currentUser]);
    
    // --- HANDLER FUNCTIONS ---
    const handleLogin = useCallback((email: string) => {
        const user = allUsers.find(u => u.email === email);
        if (user) {
            setCurrentUser(user);
            setActivePage('dashboard');
        } else {
            alert('User not found!');
        }
    }, [allUsers]);

    const handleLogout = useCallback(() => setCurrentUser(null), []);
    
    const handleSuratSubmit = useCallback((suratData: Omit<AnySurat, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'disposisi'>) => {
        const commonData = {
            id: `${suratData.tipe === TipeSurat.MASUK ? 'sm' : 'sk'}-${Date.now()}`,
            isArchived: false,
            fileUrl: '#',
            unitKerjaId: currentUser!.unitKerjaId,
        };

        let newSurat: AnySurat;

        if (suratData.tipe === TipeSurat.MASUK) {
            const typedSuratData = suratData as Omit<SuratMasuk, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'disposisi'>;
            newSurat = {
                ...typedSuratData,
                ...commonData,
                disposisi: [],
            };
        } else { 
            const typedSuratData = suratData as Omit<SuratKeluar, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'disposisi'>;
            newSurat = {
                ...typedSuratData,
                ...commonData,
            };
        }

        setAllSurat(prev => [newSurat, ...prev]);
        logAction(`Menambahkan surat ${newSurat.tipe === TipeSurat.MASUK ? 'masuk' : 'keluar'} baru dengan perihal "${newSurat.perihal}"`);
    }, [currentUser, logAction]);

    const handleSuratUpdate = useCallback((updatedSurat: AnySurat) => {
        setAllSurat(prev => prev.map(s => s.id === updatedSurat.id ? updatedSurat : s));
        logAction(`Memperbarui surat dengan nomor "${updatedSurat.nomorSurat}"`);
    }, [logAction]);

    const handleSuratArchive = useCallback((suratId: string, folderId: string) => {
        setAllSurat(prev => prev.map(s => s.id === suratId ? { ...s, isArchived: true, folderId } : s));
        const surat = allSurat.find(s => s.id === suratId);
        if(surat) logAction(`Mengarsipkan surat "${surat.nomorSurat}"`);
    }, [allSurat, logAction]);

    const handleAddDisposisi = useCallback((suratId: string, catatan: string, tujuanId: string, sifat: SifatDisposisi) => {
        const tujuanUser = allUsers.find(u => u.id === tujuanId);
        if (!tujuanUser || !currentUser) return;
        
        const newDisposisi: Disposisi = {
            id: `disp-${Date.now()}`,
            pembuat: currentUser,
            tujuan: tujuanUser,
            tanggal: new Date().toISOString(),
            catatan,
            sifat,
            status: StatusDisposisi.DIPROSES,
            riwayatStatus: [{ status: StatusDisposisi.DIPROSES, tanggal: new Date().toISOString(), oleh: currentUser }]
        };

        setAllSurat(prev => prev.map(s => {
            if (s.id === suratId && s.tipe === TipeSurat.MASUK) {
                return { ...s, disposisi: [...s.disposisi, newDisposisi] };
            }
            return s;
        }));
        logAction(`Menambahkan disposisi ke surat ${suratId} untuk ${tujuanUser.nama}`);
    }, [currentUser, allUsers, logAction]);

    const handleUpdateDisposisiStatus = useCallback((suratId: string, disposisiId: string, status: StatusDisposisi) => {
        setAllSurat(prev => prev.map(s => {
            if (s.id === suratId && s.tipe === TipeSurat.MASUK) {
                const newDisposisi = s.disposisi.map(d => {
                    if (d.id === disposisiId) {
                        return { ...d, status, riwayatStatus: [...d.riwayatStatus, { status, tanggal: new Date().toISOString(), oleh: currentUser! }] };
                    }
                    return d;
                });
                return { ...s, disposisi: newDisposisi };
            }
            return s;
        }));
        logAction(`Memperbarui status disposisi ${disposisiId} menjadi ${status}`);
    }, [currentUser, logAction]);

    const handleTambahTandaTangan = useCallback((suratId: string, signatureDataUrl?: string) => {
        setAllSurat(prev => prev.map(s => {
            if (s.id === suratId && s.tipe === TipeSurat.KELUAR) {
                return { ...s, tandaTangan: signatureDataUrl || 'SIGNED_WITH_QR' };
            }
            return s;
        }));
        logAction(`Menambahkan tanda tangan pada surat ${suratId}`);
    }, [logAction]);

    const handleReplyWithAI = useCallback((surat: SuratMasuk) => {
        const initialData = {
            perihal: `Balasan: ${surat.perihal}`,
            tujuan: surat.pengirim,
            suratAsliId: surat.id,
            suratAsli: surat
        };
        setSuratKeluarInitialData(initialData);
        setActivePage('surat-keluar');
    }, []);

    const handleUpdateBranding = useCallback((settings: BrandingSettings) => {
        setBrandingSettings(settings);
        logAction('Memperbarui pengaturan branding & logo');
    }, [logAction]);

    // --- RENDER LOGIC ---
    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} brandingSettings={brandingSettings} />;
    }

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard':
                return <Dashboard suratMasukCount={activeSuratMasuk.length} suratKeluarCount={activeSuratKeluar.length} archivedCount={archivedSurat.length} allSurat={allSurat} />;
            case 'surat-masuk':
                return <SuratMasukComponent 
                    suratList={activeSuratMasuk} 
                    kategoriList={allKategori} 
                    unitKerjaList={allUnitKerja}
                    allUsers={allUsers}
                    currentUser={currentUser}
                    allSurat={allSurat}
                    kopSuratSettings={kopSuratSettings}
                    appSettings={appSettings}
                    folders={allFolders}
                    onSubmit={handleSuratSubmit}
                    onUpdate={handleSuratUpdate}
                    onArchive={handleSuratArchive}
                    onAddDisposisi={handleAddDisposisi}
                    onUpdateDisposisiStatus={handleUpdateDisposisiStatus}
                    onReplyWithAI={handleReplyWithAI}
                />;
            case 'surat-keluar':
                return <SuratKeluarComponent 
                    suratList={activeSuratKeluar} 
                    kategoriList={allKategori}
                    masalahUtamaList={allMasalahUtama}
                    klasifikasiList={allKlasifikasi}
                    unitKerjaList={allUnitKerja}
                    currentUser={currentUser}
                    allSurat={allSurat}
                    kopSuratSettings={kopSuratSettings}
                    appSettings={appSettings}
                    penomoranSettings={penomoranSettings}
                    folders={allFolders}
                    onSubmit={handleSuratSubmit}
                    onUpdate={handleSuratUpdate}
                    onArchive={handleSuratArchive}
                    onTambahTandaTangan={handleTambahTandaTangan}
                    initialData={suratKeluarInitialData}
                    clearInitialData={() => setSuratKeluarInitialData(null)}
                />;
            case 'arsip':
                return <Arsip suratList={archivedSurat} folders={allFolders} kategoriList={allKategori} onCreateFolder={(nama) => setAllFolders(prev => [...prev, {id: `folder-${Date.now()}`, nama}])}/>;
            case 'pencarian':
                return <PencarianCerdas allSurat={allSurat} kategoriList={allKategori} />;
            case 'verifikasi':
                return <VerifikasiDokumen suratKeluarList={allSurat.filter(s => s.tipe === TipeSurat.KELUAR) as SuratKeluar[]} />;
            case 'laporan':
                return <Laporan allSurat={allSurat} allKategori={allKategori} kopSuratSettings={kopSuratSettings} unitKerjaList={allUnitKerja} currentUser={currentUser}/>;
            case 'administrasi':
                return <Administrasi users={allUsers} unitKerjaList={allUnitKerja} kategoriList={allKategori} masalahUtamaList={allMasalahUtama} klasifikasiList={allKlasifikasi} kebijakanRetensiList={allKebijakanRetensi} activityLogs={activityLogs} currentUser={currentUser} />;
            case 'pengaturan':
                return <Pengaturan settings={appSettings} onSettingsChange={setAppSettings} currentUser={currentUser} kopSuratSettings={kopSuratSettings} onUpdateKopSurat={setKopSuratSettings} penomoranSettings={penomoranSettings} onUpdatePenomoran={setPenomoranSettings} brandingSettings={brandingSettings} onUpdateBranding={handleUpdateBranding} />;
            default:
                return <div>Page not found</div>;
        }
    };
    
    const pageTitles: Record<Page, string> = {
      dashboard: 'Dashboard',
      'surat-masuk': 'Surat Masuk',
      'surat-keluar': 'Surat Keluar',
      arsip: 'Arsip Digital',
      pencarian: 'Pencarian Cerdas',
      verifikasi: 'Verifikasi Dokumen',
      laporan: 'Pusat Laporan',
      administrasi: 'Administrasi',
      pengaturan: 'Pengaturan'
    }

    const NavLink: React.FC<{page: Page; icon: React.ReactNode; label: string, restrictedTo?: UserRole[]}> = ({ page, icon, label, restrictedTo }) => {
        if (restrictedTo && !restrictedTo.includes(currentUser.role)) {
            return null;
        }
        return (
            <button onClick={() => setActivePage(page)} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${activePage === page ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {icon}
                <span className="font-medium">{label}</span>
            </button>
        )
    }

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="h-24 flex flex-col items-center justify-center border-b border-slate-200 px-4 space-y-2">
                     {brandingSettings.appLogoUrl && (
                        <img src={brandingSettings.appLogoUrl} alt="Logo Aplikasi" className="h-8 object-contain" />
                    )}
                    <h1 className="text-sm font-bold text-slate-800 text-center leading-tight">STAR E-ARSIM SULTRA</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavLink page="dashboard" icon={<HomeIcon className="w-6 h-6"/>} label="Dashboard" />
                    <NavLink page="surat-masuk" icon={<InboxIcon className="w-6 h-6"/>} label="Surat Masuk" />
                    <NavLink page="surat-keluar" icon={<OutboxIcon className="w-6 h-6"/>} label="Surat Keluar" />
                    <NavLink page="arsip" icon={<ArchiveIcon className="w-6 h-6"/>} label="Arsip" />
                    <NavLink page="laporan" icon={<ClipboardListIcon className="w-6 h-6"/>} label="Laporan" />
                    <div className="pt-2 mt-2 border-t">
                        <NavLink page="pencarian" icon={<SparklesIcon className="w-6 h-6"/>} label="Pencarian AI" />
                        <NavLink page="verifikasi" icon={<ShieldCheckIcon className="w-6 h-6"/>} label="Verifikasi" />
                    </div>
                     <div className="pt-2 mt-2 border-t">
                        <NavLink page="administrasi" icon={<UsersIcon className="w-6 h-6"/>} label="Administrasi" restrictedTo={[UserRole.ADMIN, UserRole.SUPER_ADMIN]} />
                        <NavLink page="pengaturan" icon={<CogIcon className="w-6 h-6"/>} label="Pengaturan" />
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <h2 className="text-xl font-semibold text-slate-800">{pageTitles[activePage]}</h2>
                    <div className="flex items-center space-x-4">
                        <NotificationBell 
                            notifications={notifications} 
                            onNotificationClick={(suratId, notifId) => {
                                setNotifications(prev => prev.map(n => n.id === notifId ? {...n, isRead: true} : n));
                                const surat = allSurat.find(s => s.id === suratId);
                                if(surat) {
                                    setActivePage(surat.tipe === TipeSurat.MASUK ? 'surat-masuk' : 'surat-keluar');
                                }
                            }}
                        />
                        <div className="text-right">
                            <p className="font-semibold text-sm text-slate-800">{currentUser.nama}</p>
                            <p className="text-xs text-slate-500">{currentUser.jabatan}</p>
                        </div>
                        <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-blue-600">Logout</button>
                    </div>
                </header>
                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

export default App;