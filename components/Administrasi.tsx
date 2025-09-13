import React, { useState } from 'react';
import { User, UnitKerja, KategoriSurat, ActivityLog, UserRole, KlasifikasiSurat, MasalahUtama, KebijakanRetensi } from '../types';
import ManajemenPengguna from './ManajemenPengguna';
import ManajemenKategori from './ManajemenKategori';
import ManajemenUnitKerja from './ManajemenUnitKerja';
import LogAktivitas from './LogAktivitas';
import ManajemenKlasifikasi from './ManajemenKlasifikasi';
import ManajemenMasalahUtama from './ManajemenMasalahUtama';
import ManajemenRetensi from './ManajemenRetensi';

interface AdministrasiProps {
    users: User[];
    unitKerjaList: UnitKerja[];
    kategoriList: KategoriSurat[];
    masalahUtamaList: MasalahUtama[];
    klasifikasiList: KlasifikasiSurat[];
    kebijakanRetensiList: KebijakanRetensi[];
    activityLogs: ActivityLog[];
    currentUser: User;
}

type AdminTab = 'pengguna' | 'unit' | 'kategori' | 'masalah' | 'klasifikasi' | 'retensi' | 'log';

const Administrasi: React.FC<AdministrasiProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('pengguna');

    const isSuperAdmin = props.currentUser.role === UserRole.SUPER_ADMIN;

    // Super Admin sees all users and units. Local admin sees only their own.
    const visibleUsers = isSuperAdmin
        ? props.users
        : props.users.filter(u => u.unitKerjaId === props.currentUser.unitKerjaId);

    const visibleLogs = isSuperAdmin
        ? props.activityLogs
        : props.activityLogs.filter(log => {
            const logUser = props.users.find(u => u.nama === log.user);
            return logUser?.unitKerjaId === props.currentUser.unitKerjaId;
        });


    const renderContent = () => {
        switch (activeTab) {
            case 'pengguna':
                return (
                    <ManajemenPengguna
                        users={visibleUsers}
                        unitKerjaList={props.unitKerjaList}
                        currentUser={props.currentUser}
                        onCreateUser={(user) => alert(`Create user: ${user.nama}`)}
                        onUpdateUser={(user) => alert(`Update user: ${user.id}`)}
                        onDeleteUser={(userId) => alert(`Delete user: ${userId}`)}
                    />
                );
            case 'unit':
                 if (!isSuperAdmin) return null;
                return (
                    <ManajemenUnitKerja
                        unitKerjaList={props.unitKerjaList}
                        onCreateUnitKerja={(unit) => alert(`Create unit: ${unit.nama}`)}
                        onUpdateUnitKerja={(unit) => alert(`Update unit: ${unit.id}`)}
                        onDeleteUnitKerja={(unitId) => alert(`Delete unit: ${unitId}`)}
                    />
                );
            case 'kategori':
                 if (!isSuperAdmin) return null;
                return (
                    <ManajemenKategori
                        kategoriList={props.kategoriList}
                        onCreateKategori={(kategori) => alert(`Create category: ${kategori.nama}`)}
                        onUpdateKategori={(kategori) => alert(`Update category: ${kategori.id}`)}
                        onDeleteKategori={(kategoriId) => alert(`Delete category: ${kategoriId}`)}
                    />
                );
            case 'masalah':
                if (!isSuperAdmin) return null;
                return (
                    <ManajemenMasalahUtama
                        masalahUtamaList={props.masalahUtamaList}
                        onCreate={(item) => alert(`Create masalah: ${item.kode}`)}
                        onUpdate={(item) => alert(`Update masalah: ${item.id}`)}
                        onDelete={(id) => alert(`Delete masalah: ${id}`)}
                    />
                );
            case 'klasifikasi':
                 if (!isSuperAdmin) return null;
                return (
                    <ManajemenKlasifikasi
                        klasifikasiList={props.klasifikasiList}
                        masalahUtamaList={props.masalahUtamaList}
                        onCreateKlasifikasi={(klasifikasi) => alert(`Create classification: ${klasifikasi.kode}`)}
                        onUpdateKlasifikasi={(klasifikasi) => alert(`Update classification: ${klasifikasi.id}`)}
                        onDeleteKlasifikasi={(klasifikasiId) => alert(`Delete classification: ${klasifikasiId}`)}
                    />
                );
            case 'retensi':
                if (!isSuperAdmin) return null;
                return (
                    <ManajemenRetensi
                        kebijakanList={props.kebijakanRetensiList}
                        kategoriList={props.kategoriList}
                        onCreate={(item) => alert(`Create policy for category: ${item.kategoriId}`)}
                        onUpdate={(item) => alert(`Update policy: ${item.id}`)}
                        onDelete={(id) => alert(`Delete policy: ${id}`)}
                    />
                );
            case 'log':
                return <LogAktivitas activityLogs={visibleLogs} />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabId: AdminTab; label: string }> = ({ tabId, label }) => (
         <button
            onClick={() => setActiveTab(tabId)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tabId
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Administrasi Sistem</h2>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton tabId="pengguna" label="Manajemen Pengguna" />
                    {isSuperAdmin && (
                        <>
                            <TabButton tabId="unit" label="Manajemen Unit Kerja" />
                            <TabButton tabId="kategori" label="Manajemen Kategori" />
                            <TabButton tabId="masalah" label="Manajemen Masalah Utama" />
                            <TabButton tabId="klasifikasi" label="Manajemen Klasifikasi" />
                            <TabButton tabId="retensi" label="Manajemen Retensi" />
                        </>
                    )}
                    <TabButton tabId="log" label="Log Aktivitas" />
                </nav>
            </div>

            <div className="pt-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default Administrasi;