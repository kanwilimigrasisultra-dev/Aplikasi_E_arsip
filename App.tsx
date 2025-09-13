import React, { useState, useMemo, useCallback } from 'react';
import {
  DashboardIcon, InboxIcon, OutboxIcon, ArchiveIcon, CogIcon, UsersIcon,
  OfficeBuildingIcon, TagIcon, ClipboardListIcon, PencilAltIcon
} from './components/icons';
import Dashboard from './components/Dashboard';
import SuratMasuk from './components/SuratMasuk';
import SuratKeluar from './components/SuratKeluar';
import Arsip from './components/Arsip';
import Pengaturan from './components/Pengaturan';
import Administrasi from './components/Administrasi';
import NotificationBell from './components/NotificationBell';
import { generateMockData } from './mock-data.ts';
import { AnySurat, User, Notifikasi, Surat, SuratMasuk as TSuratMasuk, Disposisi, SifatDisposisi, StatusDisposisi, SuratKeluar as TSuratKeluar, TandaTangan, TipeSurat, SignatureMethod, UnitKerja, UserRole, KlasifikasiSurat, MasalahUtama } from './types';

// Initial data from mock generator
const initialData = generateMockData();
declare const QRCode: any;

type NavItem = 'dashboard' | 'surat-masuk' | 'surat-keluar' | 'arsip' | 'administrasi' | 'pengaturan';

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');
  const [allSurat, setAllSurat] = useState<AnySurat[]>(initialData.surat);
  const [users, setUsers] = useState<User[]>(initialData.users);
  const [kategoriList, setKategoriList] = useState(initialData.kategori);
  const [masalahUtamaList, setMasalahUtamaList] = useState<MasalahUtama[]>(initialData.masalahUtama);
  const [klasifikasiList, setKlasifikasiList] = useState<KlasifikasiSurat[]>(initialData.klasifikasi);
  const [unitKerjaList, setUnitKerjaList] = useState(initialData.unitKerja);
  const [folders, setFolders] = useState(initialData.folders);
  const [activityLogs, setActivityLogs] = useState(initialData.activityLogs);
  const [notifications, setNotifications] = useState<Notifikasi[]>(initialData.notifikasi);
  const [appSettings, setAppSettings] = useState(initialData.appSettings);
  const [kopSuratSettings, setKopSuratSettings] = useState(initialData.kopSuratSettings);
  const [penomoranSettings, setPenomoranSettings] = useState(initialData.penomoranSettings);
  
  const [selectedSuratId, setSelectedSuratId] = useState<string | null>(null);

  const currentUser = useMemo(() => users.find(u => u.id === 'user-5')!, [users]); // Login as SUPER_ADMIN
  
  const logActivity = useCallback((action: string) => {
    setActivityLogs(prev => [{
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser.nama,
      action,
    }, ...prev]);
  }, [currentUser.nama]);

  const addNotification = useCallback((suratId: string, pesan: string, targetUserId: string) => {
    const newNotif: Notifikasi = {
      id: `notif-${Date.now()}`,
      suratId,
      userId: targetUserId,
      pesan,
      tanggal: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const handleSuratSubmit = (suratData: Omit<AnySurat, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'disposisi'>) => {
    const isInternalKirim = suratData.tipe === TipeSurat.KELUAR && suratData.tujuanUnitKerjaId;

    let newSuratKeluar: TSuratKeluar | null = null;
    let newSuratMasuk: TSuratMasuk | null = null;
    
    if (isInternalKirim && suratData.tujuanUnitKerjaId) {
        // Create Surat Keluar for current user's office
        const suratKeluarId = `surat-${Date.now()}`;
        const suratMasukId = `surat-${Date.now() + 1}`;
        
        newSuratKeluar = {
            ...(suratData as Omit<TSuratKeluar, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId'>),
            id: suratKeluarId,
            isArchived: false,
            fileUrl: '/mock-document.pdf',
            unitKerjaId: currentUser.unitKerjaId,
            relatedSuratIds: [suratMasukId],
        };

        // Automatically create Surat Masuk for destination office
        const pengirimUnit = unitKerjaList.find(u => u.id === currentUser.unitKerjaId);
        const tujuanUnit = unitKerjaList.find(u => u.id === suratData.tujuanUnitKerjaId);

        newSuratMasuk = {
            id: suratMasukId,
            tipe: TipeSurat.MASUK,
            nomorSurat: suratData.nomorSurat,
            tanggal: suratData.tanggal,
            tanggalDiterima: new Date().toISOString(),
            perihal: `[INTERNAL] ${suratData.perihal}`,
            isi: suratData.isi,
            pengirim: pengirimUnit?.nama || 'Kantor Pusat',
            tujuan: tujuanUnit?.nama || 'Kantor Cabang',
            fileUrl: '/mock-document.pdf',
            isArchived: false,
            sifat: suratData.sifat,
            unitKerjaId: tujuanUnit!.id,
            kategoriId: suratData.kategoriId,
            klasifikasiId: suratData.klasifikasiId,
            disposisi: [],
            relatedSuratIds: [suratKeluarId],
        };
        
        setAllSurat(prev => [newSuratKeluar!, newSuratMasuk!, ...prev]);
        logActivity(`Mengirim surat internal: ${suratData.nomorSurat} ke ${tujuanUnit?.nama}`);
        
    } else {
        const newSurat: AnySurat = {
          ...suratData,
          id: `surat-${Date.now()}`,
          isArchived: false,
          fileUrl: '/mock-document.pdf',
          unitKerjaId: currentUser.unitKerjaId,
          ...(suratData.tipe === TipeSurat.MASUK
            ? { disposisi: [], tanggalDiterima: new Date().toISOString() }
            : {}
          ),
        } as AnySurat;
        
        setAllSurat(prev => [newSurat, ...prev]);
        logActivity(`Membuat surat baru: ${suratData.nomorSurat}`);
    
        if (newSurat.tipe === TipeSurat.MASUK && appSettings.notifications.suratMasukBaru) {
          const kepalaKantor = users.find(u => u.jabatan.toLowerCase().includes('kepala') && u.unitKerjaId === currentUser.unitKerjaId);
          if (kepalaKantor) {
              addNotification(newSurat.id, `Surat masuk baru: ${newSurat.perihal}`, kepalaKantor.id);
          }
        }
    }
  };

  const handleUpdateSurat = (updatedSurat: AnySurat) => {
    setAllSurat(prev => prev.map(s => s.id === updatedSurat.id ? updatedSurat : s));
  };
  
  const handleArchive = (suratId: string, folderId: string) => {
    setAllSurat(prev => prev.map(s => s.id === suratId ? {...s, isArchived: true, folderId: folderId} : s));
    logActivity(`Mengarsipkan surat ID: ${suratId} ke folder ${folderId}`);
  };

  const handleAddDisposisi = (suratId: string, catatan: string, tujuanId: string, sifat: SifatDisposisi) => {
    const tujuanUser = users.find(u => u.id === tujuanId);
    if (!tujuanUser) return;
    
    const newDisposisi: Disposisi = {
      id: `disp-${Date.now()}`,
      tujuan: tujuanUser,
      catatan,
      tanggalDisposisi: new Date().toISOString(),
      status: StatusDisposisi.PENDING,
      sifat,
      pembuat: currentUser
    };
    
    setAllSurat(prev => prev.map(s => {
      if (s.id === suratId && s.tipe === TipeSurat.MASUK) {
        return { ...s, disposisi: [...(s as TSuratMasuk).disposisi, newDisposisi] };
      }
      return s;
    }));
    logActivity(`Membuat disposisi untuk surat ID: ${suratId} ke ${tujuanUser.nama}`);
    if(appSettings.notifications.disposisiBaru) {
      addNotification(suratId, `Anda menerima disposisi baru dari ${currentUser.nama}`, tujuanId);
    }
  };
  
  const handleUpdateDisposisiStatus = (suratId: string, disposisiId: string, status: StatusDisposisi) => {
    setAllSurat(prev => prev.map(s => {
      if (s.id === suratId && s.tipe === TipeSurat.MASUK) {
        const updatedDisposisi = (s as TSuratMasuk).disposisi.map(d => d.id === disposisiId ? {...d, status} : d);
        return { ...s, disposisi: updatedDisposisi };
      }
      return s;
    }));
    logActivity(`Memperbarui status disposisi ${disposisiId} menjadi ${status}`);
    const surat = allSurat.find(s => s.id === suratId) as TSuratMasuk;
    const disposisi = surat?.disposisi.find(d => d.id === disposisiId);
    if (disposisi && appSettings.notifications.statusDisposisiUpdate) {
        addNotification(suratId, `Status disposisi Anda diperbarui menjadi '${status}' oleh ${currentUser.nama}`, disposisi.pembuat.id);
    }
  };

  const handleTambahTandaTangan = (suratId: string, signatureDataUrl?: string) => {
    setAllSurat(prev => prev.map(s => {
      if (s.id === suratId && s.tipe === TipeSurat.KELUAR) {
        const suratKeluar = s as TSuratKeluar;
        
        let ttd: TandaTangan;
        if (appSettings.signatureMethod === SignatureMethod.QR_CODE && !signatureDataUrl) {
            const verificationUrl = `https://e-arsip.app/verify?id=${suratId}`;
            const qrCanvas = document.createElement('canvas');
            QRCode.toCanvas(qrCanvas, verificationUrl, { width: 100 }, (error: any) => {
                if (error) console.error(error);
            });
             ttd = {
                userId: currentUser.id,
                namaPenandaTangan: currentUser.nama,
                jabatanPenandaTangan: currentUser.jabatan,
                timestamp: new Date().toISOString(),
                signatureDataUrl: qrCanvas.toDataURL(),
                verifikasiUrl: verificationUrl
            };
        } else { // Gambar method
            ttd = {
                userId: currentUser.id,
                namaPenandaTangan: currentUser.nama,
                jabatanPenandaTangan: currentUser.jabatan,
                timestamp: new Date().toISOString(),
                signatureDataUrl: signatureDataUrl || '',
            };
        }

        return { ...suratKeluar, tandaTangan: ttd };
      }
      return s;
    }));
    logActivity(`Menandatangani surat ID: ${suratId}`);
  };

  const handleCreateFolder = (nama: string) => {
    const newFolder = { id: `folder-${Date.now()}`, nama };
    setFolders(prev => [...prev, newFolder]);
    logActivity(`Membuat folder arsip baru: ${nama}`);
  };

  const handleNotificationClick = (suratId: string, notifId: string) => {
    const surat = allSurat.find(s => s.id === suratId);
    if (surat) {
        setActiveNav(surat.tipe === TipeSurat.MASUK ? 'surat-masuk' : 'surat-keluar');
        setSelectedSuratId(suratId); // This logic needs to be implemented in children to open the modal
    }
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notifId ? {...n, isRead: true} : n));
  };

  // Memoized lists based on current user's role and unit kerja
  const suratDapatDilihat = useMemo(() => {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return allSurat; // Super admin sees all surat
    }
    return allSurat.filter(s => s.unitKerjaId === currentUser.unitKerjaId);
  }, [allSurat, currentUser]);

  const activeSuratMasuk = useMemo(() => 
    suratDapatDilihat.filter(s => s.tipe === TipeSurat.MASUK && !s.isArchived) as TSuratMasuk[],
    [suratDapatDilihat]
  );
  
  const activeSuratKeluar = useMemo(() => 
    suratDapatDilihat.filter(s => s.tipe === TipeSurat.KELUAR && !s.isArchived) as TSuratKeluar[],
    [suratDapatDilihat]
  );
  
  const archivedSurat = useMemo(() => 
    suratDapatDilihat.filter(s => s.isArchived),
    [suratDapatDilihat]
  );

  const currentUserUnitName = useMemo(() => {
    return unitKerjaList.find(u => u.id === currentUser.unitKerjaId)?.nama || 'Unit Tidak Ditemukan';
  }, [currentUser.unitKerjaId, unitKerjaList]);


  const NavButton: React.FC<{ navId: NavItem; icon: React.ReactNode; label: string }> = ({ navId, icon, label }) => (
    <button onClick={() => setActiveNav(navId)} className={`flex items-center w-full text-left px-4 py-2.5 rounded-lg transition-colors ${activeNav === navId ? 'bg-sky-600 text-white shadow-md' : 'text-slate-200 hover:bg-sky-800'}`}>
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard suratMasukCount={activeSuratMasuk.length} suratKeluarCount={activeSuratKeluar.length} archivedCount={archivedSurat.length} allSurat={[...activeSuratMasuk, ...activeSuratKeluar]} />;
      case 'surat-masuk':
        return <SuratMasuk 
          suratList={activeSuratMasuk}
          onSubmit={handleSuratSubmit}
          onUpdate={handleUpdateSurat}
          onArchive={handleArchive}
          onAddDisposisi={handleAddDisposisi}
          onUpdateDisposisiStatus={handleUpdateDisposisiStatus}
          kategoriList={kategoriList}
          unitKerjaList={unitKerjaList}
          currentUser={currentUser}
          allUsers={users}
          allSurat={allSurat}
          kopSuratSettings={kopSuratSettings}
          appSettings={appSettings}
          folders={folders}
        />;
      case 'surat-keluar':
        return <SuratKeluar 
          suratList={activeSuratKeluar}
          onSubmit={handleSuratSubmit}
          onUpdate={handleUpdateSurat}
          onArchive={handleArchive}
          onTambahTandaTangan={handleTambahTandaTangan}
          kategoriList={kategoriList}
          masalahUtamaList={masalahUtamaList}
          klasifikasiList={klasifikasiList}
          unitKerjaList={unitKerjaList}
          currentUser={currentUser}
          allSurat={allSurat}
          kopSuratSettings={kopSuratSettings}
          appSettings={appSettings}
          penomoranSettings={penomoranSettings}
          folders={folders}
        />;
      case 'arsip':
        return <Arsip suratList={archivedSurat} folders={folders} kategoriList={kategoriList} onCreateFolder={handleCreateFolder} />;
      case 'administrasi':
        return <Administrasi 
          users={users} 
          unitKerjaList={unitKerjaList} 
          kategoriList={kategoriList} 
          masalahUtamaList={masalahUtamaList}
          klasifikasiList={klasifikasiList} 
          activityLogs={activityLogs} 
          currentUser={currentUser} 
        />;
      case 'pengaturan':
        return <Pengaturan settings={appSettings} onSettingsChange={setAppSettings} currentUser={currentUser} kopSuratSettings={kopSuratSettings} onUpdateKopSurat={setKopSuratSettings} penomoranSettings={penomoranSettings} onUpdatePenomoran={setPenomoranSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 text-white flex flex-col no-print">
        <div className="flex items-center justify-center p-6 border-b border-slate-800">
          <PencilAltIcon className="w-8 h-8 text-sky-400" />
          <h1 className="ml-3 text-xl font-bold">E-Arsip</h1>
        </div>
        <div className="flex-1 p-4 space-y-2">
          <NavButton navId="dashboard" icon={<DashboardIcon className="w-5 h-5" />} label="Dashboard" />
          <NavButton navId="surat-masuk" icon={<InboxIcon className="w-5 h-5" />} label="Surat Masuk" />
          <NavButton navId="surat-keluar" icon={<OutboxIcon className="w-5 h-5" />} label="Surat Keluar" />
          <NavButton navId="arsip" icon={<ArchiveIcon className="w-5 h-5" />} label="Arsip" />
          
          {(currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN) && (
            <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
              <NavButton navId="administrasi" icon={<UsersIcon className="w-5 h-5" />} label="Administrasi" />
              <NavButton navId="pengaturan" icon={<CogIcon className="w-5 h-5" />} label="Pengaturan" />
            </div>
          )}
           {(currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ADMIN) && (
             <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
                <NavButton navId="pengaturan" icon={<CogIcon className="w-5 h-5" />} label="Pengaturan" />
             </div>
           )}

        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center font-bold">
              {currentUser.nama.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold">{currentUser.nama}</p>
              <p className="text-xs text-slate-400">{currentUserUnitName}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center no-print">
          <h2 className="text-xl font-bold text-slate-800 capitalize">{activeNav.replace('-', ' ')}</h2>
          <div className="flex items-center space-x-4">
            <NotificationBell notifications={notifications.filter(n => n.userId === currentUser.id)} onNotificationClick={handleNotificationClick} />
            <button className="text-slate-500 hover:text-red-600">Logout</button>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;