import React, { useState } from 'react';
import { User, UnitKerja, KategoriSurat, MasalahUtama, KlasifikasiSurat, KebijakanRetensi, TemplateSurat, Pengumuman, ActivityLog, AnySurat, UserRole, MasterBiaya } from '../types';
import ManajemenPengguna from './ManajemenPengguna';
import ManajemenUnitKerja from './ManajemenUnitKerja';
import ManajemenKategori from './ManajemenKategori';
import ManajemenMasalahUtama from './ManajemenMasalahUtama';
import ManajemenKlasifikasi from './ManajemenKlasifikasi';
import ManajemenRetensi from './ManajemenRetensi';
import ManajemenTemplate from './ManajemenTemplate';
import ManajemenPengumuman from './ManajemenPengumuman';
import ManajemenAnalitik from './ManajemenAnalitik';
import LogAktivitas from './LogAktivitas';
import ManajemenData from './ManajemenData';
import { UsersIcon, OfficeBuildingIcon, TagIcon, ArchiveBoxArrowDownIcon, ClipboardListIcon, MegaphoneIcon, GlobeAltIcon } from './icons';
import ManajemenMasterBiaya from './ManajemenMasterBiaya';

type AdminTab = 'pengguna' | 'unit_kerja' | 'kategori' | 'masalah_utama' | 'klasifikasi' | 'template' | 'retensi' | 'pengumuman' | 'master_biaya' | 'analitik' | 'log' | 'data';

interface AdministrasiProps {
    users: User[];
    unitKerjaList: UnitKerja[];
    kategoriList: KategoriSurat[];
    masalahUtamaList: MasalahUtama[];
    klasifikasiList: KlasifikasiSurat[];
    kebijakanRetensiList: KebijakanRetensi[];
    templateList: TemplateSurat[];
    pengumumanList: Pengumuman[];
    masterBiayaList: MasterBiaya[];
    activityLogs: ActivityLog[];
    allSurat: AnySurat[];
    currentUser: User;
    handlers: {
        onResetData: () => void;
        [key: string]: any;
    };
}

const Administrasi: React.FC<AdministrasiProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('pengguna');

    const renderContent = () => {
        switch(activeTab) {
            case 'pengguna':
                return <ManajemenPengguna users={props.users} unitKerjaList={props.unitKerjaList} currentUser={props.currentUser} onCreateUser={() => {}} onUpdateUser={() => {}} onDeleteUser={() => {}} />;
            case 'unit_kerja':
                return <ManajemenUnitKerja unitKerjaList={props.unitKerjaList} onCreateUnitKerja={() => {}} onUpdateUnitKerja={() => {}} onDeleteUnitKerja={() => {}} />;
            case 'kategori':
                return <ManajemenKategori kategoriList={props.kategoriList} onCreateKategori={() => {}} onUpdateKategori={() => {}} onDeleteKategori={() => {}} />;
            case 'masalah_utama':
                return <ManajemenMasalahUtama masalahUtamaList={props.masalahUtamaList} onCreate={() => {}} onUpdate={() => {}} onDelete={() => {}} />;
            case 'klasifikasi':
                return <ManajemenKlasifikasi klasifikasiList={props.klasifikasiList} masalahUtamaList={props.masalahUtamaList} onCreateKlasifikasi={() => {}} onUpdateKlasifikasi={() => {}} onDeleteKlasifikasi={() => {}} />;
            case 'retensi':
                return <ManajemenRetensi kebijakanList={props.kebijakanRetensiList} kategoriList={props.kategoriList} onCreate={() => {}} onUpdate={() => {}} onDelete={() => {}} />;
            case 'template':
                return <ManajemenTemplate templateList={props.templateList} kategoriList={props.kategoriList} masalahUtamaList={props.masalahUtamaList} onSubmit={() => {}} onDelete={() => {}} />;
            case 'pengumuman':
                return <ManajemenPengumuman pengumumanList={props.pengumumanList} currentUser={props.currentUser} onSubmit={() => {}} onDelete={() => {}} />;
            case 'master_biaya':
                return <ManajemenMasterBiaya masterBiayaList={props.masterBiayaList} onUpdate={() => {}} onCreate={() => {}} onDelete={() => {}} />;
            case 'analitik':
                return <ManajemenAnalitik allSurat={props.allSurat} allUsers={props.users} unitKerjaList={props.unitKerjaList} />;
            case 'log':
                return <LogAktivitas activityLogs={props.activityLogs} />;
            case 'data':
                return <ManajemenData onResetData={props.handlers.onResetData} />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabId: AdminTab; label: string; icon: React.ReactNode }> = ({ tabId, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tabId ? 'border-slate-700 text-slate-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );

    const tabs: {id: AdminTab, label: string, icon: React.ReactNode}[] = [
        { id: 'pengguna', label: 'Pengguna', icon: <UsersIcon className="w-5 h-5"/> },
        { id: 'unit_kerja', label: 'Unit Kerja', icon: <OfficeBuildingIcon className="w-5 h-5"/> },
        { id: 'kategori', label: 'Kategori', icon: <TagIcon className="w-5 h-5"/> },
        { id: 'masalah_utama', label: 'Masalah Utama', icon: <TagIcon className="w-5 h-5"/> },
        { id: 'klasifikasi', label: 'Klasifikasi', icon: <TagIcon className="w-5 h-5"/> },
        { id: 'template', label: 'Template Surat', icon: <ClipboardListIcon className="w-5 h-5"/> },
        { id: 'retensi', label: 'Retensi Arsip', icon: <ArchiveBoxArrowDownIcon className="w-5 h-5"/> },
        { id: 'master_biaya', label: 'Master Biaya', icon: <GlobeAltIcon className="w-5 h-5"/> },
        { id: 'pengumuman', label: 'Pengumuman', icon: <MegaphoneIcon className="w-5 h-5"/> },
    ];
    
    if (props.currentUser.role === UserRole.PIMPINAN || props.currentUser.role === UserRole.SUPER_ADMIN) {
        tabs.push({ id: 'analitik', label: 'Analitik', icon: <ClipboardListIcon className="w-5 h-5"/> });
    }
    
    tabs.push({ id: 'log', label: 'Log Aktivitas', icon: <ClipboardListIcon className="w-5 h-5"/> });
    
    if (props.currentUser.role === UserRole.SUPER_ADMIN) {
        tabs.push({ id: 'data', label: 'Data & Sistem', icon: <ClipboardListIcon className="w-5 h-5"/> });
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Administrasi Sistem</h2>
            <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => <TabButton key={tab.id} tabId={tab.id as AdminTab} label={tab.label} icon={tab.icon} />)}
                </nav>
            </div>
            <div className="pt-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default Administrasi;