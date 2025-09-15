import React, { useState } from 'react';
import { AnySurat, TipeSurat, SifatSurat, Tugas, User, DashboardWidgetSettings } from '../types';
import { ArchiveIcon, InboxIcon, OutboxIcon, CogIcon, CheckCircleIcon } from './icons';
import SuratChart from './SuratChart';
import Modal from './Modal';

interface DashboardProps {
    suratMasukCount: number;
    suratKeluarCount: number;
    archivedCount: number;
    allSurat: AnySurat[];
    allTugas: Tugas[];
    currentUser: User;
    widgetSettings: DashboardWidgetSettings;
    onWidgetSettingsChange: (settings: DashboardWidgetSettings) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex items-center space-x-4">
        <div className={`rounded-full p-3 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const getSifatBadge = (sifat: SifatSurat) => {
    const colorMap = {
        [SifatSurat.BIASA]: 'bg-slate-100 text-slate-800',
        [SifatSurat.PENTING]: 'bg-sky-100 text-sky-800',
        [SifatSurat.SANGAT_PENTING]: 'bg-amber-100 text-amber-800',
        [SifatSurat.RAHASIA]: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[sifat]}`}>{sifat}</span>;
}

const DashboardSettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    settings: DashboardWidgetSettings;
    onSave: (settings: DashboardWidgetSettings) => void;
}> = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleToggle = (widget: keyof DashboardWidgetSettings) => {
        setLocalSettings(prev => ({...prev, [widget]: !prev[widget]}));
    }

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    }

    const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: () => void }> = ({ label, enabled, onChange }) => (
        <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
            <span className="text-sm text-slate-600">{label}</span>
            <button
                type="button"
                onClick={onChange}
                className={`${enabled ? 'bg-slate-700' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                role="switch"
                aria-checked={enabled}
            >
                <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sesuaikan Tampilan Dashboard">
            <div className="space-y-4">
                <p className="text-sm text-slate-500">Pilih widget yang ingin Anda tampilkan di halaman dashboard.</p>
                <ToggleSwitch label="Kartu Statistik" enabled={localSettings.stats} onChange={() => handleToggle('stats')} />
                <ToggleSwitch label="Grafik Tren Surat" enabled={localSettings.chart} onChange={() => handleToggle('chart')} />
                <ToggleSwitch label="Aktivitas Surat Terkini" enabled={localSettings.recent} onChange={() => handleToggle('recent')} />
                <ToggleSwitch label="Widget Tugas Saya" enabled={localSettings.tasks} onChange={() => handleToggle('tasks')} />
            </div>
             <div className="flex justify-end pt-6">
                <button type="button" onClick={handleSave} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                    Simpan
                </button>
            </div>
        </Modal>
    );
}


const Dashboard: React.FC<DashboardProps> = ({ suratMasukCount, suratKeluarCount, archivedCount, allSurat, allTugas, currentUser, widgetSettings, onWidgetSettingsChange }) => {
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    
    const recentSurat = allSurat.slice(0, 5);
    const myTasks = allTugas.filter(t => t.ditugaskanKepada.id === currentUser.id && t.status !== 'Selesai');
    
    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={() => setSettingsModalOpen(true)} className="flex items-center text-sm bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shadow-sm">
                    <CogIcon className="w-4 h-4 mr-2" />
                    Sesuaikan
                </button>
            </div>

            {/* Stat Cards */}
            {widgetSettings.stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        icon={<InboxIcon className="w-6 h-6 text-blue-600" />} 
                        title="Surat Masuk Aktif" 
                        value={suratMasukCount} 
                        color="bg-blue-100"
                    />
                    <StatCard 
                        icon={<OutboxIcon className="w-6 h-6 text-amber-600" />} 
                        title="Surat Keluar Aktif" 
                        value={suratKeluarCount} 
                        color="bg-amber-100"
                    />
                    <StatCard 
                        icon={<ArchiveIcon className="w-6 h-6 text-emerald-600" />} 
                        title="Total Arsip Surat" 
                        value={archivedCount} 
                        color="bg-emerald-100"
                    />
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                {widgetSettings.chart && (
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Tren Surat 12 Bulan Terakhir</h3>
                        <div className="h-80">
                            <SuratChart allSurat={allSurat} />
                        </div>
                    </div>
                )}

                {/* My Tasks */}
                {widgetSettings.tasks && (
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                         <h3 className="text-lg font-semibold text-slate-800 mb-4">Tugas Saya</h3>
                         <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {myTasks.length > 0 ? myTasks.map(tugas => (
                                <div key={tugas.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <p className="text-sm font-medium text-slate-800">{tugas.deskripsi}</p>
                                    <p className="text-xs text-slate-500 mt-1">Jatuh Tempo: {new Date(tugas.tanggalJatuhTempo).toLocaleDateString()}</p>
                                    <p className="text-xs text-slate-500">Dari Surat: {allSurat.find(s => s.id === tugas.suratId)?.nomorSurat || 'N/A'}</p>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-500">
                                    <CheckCircleIcon className="w-8 h-8 mx-auto text-slate-300" />
                                    <p className="mt-2 text-sm">Tidak ada tugas aktif.</p>
                                </div>
                            )}
                         </div>
                    </div>
                )}
            </div>


            {/* Recent Activity */}
            {widgetSettings.recent && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Aktivitas Surat Terkini</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Tipe</th>
                                    <th scope="col" className="px-6 py-3">Nomor Surat</th>
                                    <th scope="col" className="px-6 py-3">Perihal</th>
                                    <th scope="col" className="px-6 py-3">Sifat Surat</th>
                                    <th scope="col" className="px-6 py-3">Tanggal</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSurat.map(surat => (
                                    <tr key={surat.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                surat.tipe === TipeSurat.MASUK 
                                                ? 'bg-sky-100 text-sky-800' 
                                                : (surat.tipe === TipeSurat.KELUAR ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800')
                                            }`}>
                                                {surat.tipe}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{surat.nomorSurat}</td>
                                        <td className="px-6 py-4">{surat.perihal}</td>
                                        <td className="px-6 py-4">{getSifatBadge(surat.sifat)}</td>
                                        <td className="px-6 py-4">{new Date(surat.tanggal).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                surat.isArchived 
                                                ? 'bg-emerald-100 text-emerald-800' 
                                                : 'bg-slate-100 text-slate-800'
                                            }`}>
                                                {surat.isArchived ? 'Diarsipkan' : 'Aktif'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
             <DashboardSettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                settings={widgetSettings}
                onSave={onWidgetSettingsChange}
             />
        </div>
    );
};

export default Dashboard;