import React, { useState } from 'react';
import { ShieldCheckIcon, BellIcon, UsersIcon, ClipboardListIcon, CogIcon } from './icons';
import { User, KopSuratSettings, AppSettings, SignatureMethod, PenomoranSettings, BrandingSettings, Delegasi } from '../types';
import PengaturanKopSurat from './PengaturanKopSurat';
import PengaturanPenomoran from './PengaturanPenomoran';
import PengaturanBranding from './PengaturanBranding';


const SettingsCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="text-lg font-semibold text-slate-800 ml-3">{title}</h3>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
        <span className="text-sm text-slate-600">{label}</span>
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`${
                enabled ? 'bg-slate-700' : 'bg-slate-300'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2`}
            role="switch"
            aria-checked={enabled}
        >
            <span
                className={`${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
);

type ActiveTab = 'preferensi' | 'akun' | 'delegasi' | 'kopSurat' | 'sistem' | 'penomoran' | 'branding';

const Pengaturan: React.FC<{
    settings: AppSettings;
    onSettingsChange: (newSettings: AppSettings) => void;
    currentUser: User;
    allUsers: User[];
    onSetDelegasi: (kepadaUserId: string, tanggalMulai: string, tanggalSelesai: string) => void;
    kopSuratSettings: KopSuratSettings;
    onUpdateKopSurat: (settings: KopSuratSettings) => void;
    penomoranSettings: PenomoranSettings;
    onUpdatePenomoran: (settings: PenomoranSettings) => void;
    brandingSettings: BrandingSettings;
    onUpdateBranding: (settings: BrandingSettings) => void;
}> = (props) => {
    const { settings, onSettingsChange, currentUser, allUsers, onSetDelegasi, kopSuratSettings, onUpdateKopSurat, penomoranSettings, onUpdatePenomoran, brandingSettings, onUpdateBranding } = props;
    const [activeTab, setActiveTab] = useState<ActiveTab>('preferensi');
    const [delegasiKepada, setDelegasiKepada] = useState('');
    const [delegasiMulai, setDelegasiMulai] = useState('');
    const [delegasiSelesai, setDelegasiSelesai] = useState('');
    
    const handleSettingsChange = (key: keyof AppSettings, value: any) => {
        onSettingsChange({
            ...settings,
            [key]: value
        });
    };

    const handleDelegasiSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(delegasiKepada && delegasiMulai && delegasiSelesai) {
            onSetDelegasi(delegasiKepada, delegasiMulai, delegasiSelesai);
            alert('Delegasi berhasil diatur!');
        }
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'preferensi':
                return (
                     <div className="space-y-6">
                        <SettingsCard icon={<BellIcon className="w-6 h-6 text-slate-700" />} title="Preferensi Notifikasi">
                            <ToggleSwitch 
                                label="Notifikasi Disposisi Baru"
                                enabled={settings.notifications.disposisiBaru}
                                onChange={(value) => handleSettingsChange('notifications', {...settings.notifications, disposisiBaru: value})}
                            />
                            <ToggleSwitch 
                                label="Notifikasi Surat Masuk Baru"
                                enabled={settings.notifications.suratMasukBaru}
                                onChange={(value) => handleSettingsChange('notifications', {...settings.notifications, suratMasukBaru: value})}
                            />
                            <ToggleSwitch 
                                label="Status Disposisi Diperbarui"
                                enabled={settings.notifications.statusDisposisiUpdate}
                                onChange={(value) => handleSettingsChange('notifications', {...settings.notifications, statusDisposisiUpdate: value})}
                            />
                        </SettingsCard>
                        
                        <SettingsCard icon={<ShieldCheckIcon className="w-6 h-6 text-emerald-700" />} title="Tampilan & Tema">
                            <ToggleSwitch 
                                label="Mode Gelap"
                                enabled={settings.theme.darkMode}
                                onChange={(value) => handleSettingsChange('theme', {...settings.theme, darkMode: value})}
                            />
                        </SettingsCard>
                    </div>
                );
            case 'akun':
                return (
                     <SettingsCard icon={<UsersIcon className="w-6 h-6 text-amber-700" />} title="Pengaturan Akun">
                        <div className="text-sm text-slate-600 p-4 bg-slate-50 rounded-lg">
                            <p><span className="font-semibold">Nama:</span> {currentUser.nama}</p>
                            <p><span className="font-semibold">Jabatan:</span> {currentUser.jabatan}</p>
                        </div>
                        <div className="flex space-x-2 pt-2">
                            <button 
                                onClick={() => alert('Fungsi ubah kata sandi belum tersedia.')}
                                className="flex-1 text-center bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors shadow-sm text-sm font-medium"
                            >
                                Ubah Kata Sandi
                            </button>
                            <button 
                                onClick={() => alert('Fungsi ekspor data belum tersedia.')}
                                className="flex-1 text-center bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors shadow-sm text-sm font-medium"
                            >
                                Ekspor Data Pengguna
                            </button>
                        </div>
                    </SettingsCard>
                );
             case 'delegasi':
                return (
                    <SettingsCard icon={<UsersIcon className="w-6 h-6 text-sky-700" />} title="Delegasi Wewenang">
                        {currentUser.delegasi && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                <p><span className="font-semibold">Status Delegasi Saat Ini:</span> Aktif</p>
                                <p>Wewenang Anda didelegasikan kepada <span className="font-semibold">{currentUser.delegasi.kepadaUser.nama}</span> hingga tanggal {new Date(currentUser.delegasi.tanggalSelesai).toLocaleDateString()}.</p>
                                <button className="text-red-600 text-xs mt-1 hover:underline">Batalkan Delegasi</button>
                            </div>
                        )}
                        <form onSubmit={handleDelegasiSubmit} className="space-y-4 pt-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Delegasikan Kepada</label>
                                <select value={delegasiKepada} onChange={e => setDelegasiKepada(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                    <option value="">Pilih Pengguna...</option>
                                    {allUsers.filter(u => u.id !== currentUser.id && u.unitKerjaId === currentUser.unitKerjaId).map(u => (
                                        <option key={u.id} value={u.id}>{u.nama} ({u.jabatan})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Tanggal Mulai</label>
                                    <input type="date" value={delegasiMulai} onChange={e => setDelegasiMulai(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Tanggal Selesai</label>
                                    <input type="date" value={delegasiSelesai} onChange={e => setDelegasiSelesai(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>
                            </div>
                            <div className="text-right">
                                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">Atur Delegasi</button>
                            </div>
                        </form>
                    </SettingsCard>
                )
            case 'kopSurat':
                return <PengaturanKopSurat settings={kopSuratSettings} onSave={onUpdateKopSurat} />;
            case 'penomoran':
                return <PengaturanPenomoran settings={penomoranSettings} onSave={onUpdatePenomoran} />;
             case 'branding':
                return <PengaturanBranding settings={brandingSettings} onSave={onUpdateBranding} />;
            case 'sistem':
                return (
                     <SettingsCard icon={<CogIcon className="w-6 h-6 text-slate-700" />} title="Pengaturan Tanda Tangan Digital">
                        <div>
                            <p className="text-sm text-slate-600 mb-3">Pilih metode tanda tangan digital yang akan digunakan untuk surat keluar.</p>
                            <fieldset className="space-y-2">
                                <div className="relative flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="sig-gambar"
                                            name="signature-method"
                                            type="radio"
                                            value={SignatureMethod.GAMBAR}
                                            checked={settings.signatureMethod === SignatureMethod.GAMBAR}
                                            onChange={() => handleSettingsChange('signatureMethod', SignatureMethod.GAMBAR)}
                                            className="focus:ring-slate-500 h-4 w-4 text-slate-600 border-gray-300"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="sig-gambar" className="font-medium text-gray-700">Tanda Tangan Gambar</label>
                                        <p className="text-gray-500">Pengguna menggambar tanda tangan secara manual di layar.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="sig-qrcode"
                                            name="signature-method"
                                            type="radio"
                                            value={SignatureMethod.QR_CODE}
                                            checked={settings.signatureMethod === SignatureMethod.QR_CODE}
                                            onChange={() => handleSettingsChange('signatureMethod', SignatureMethod.QR_CODE)}
                                            className="focus:ring-slate-500 h-4 w-4 text-slate-600 border-gray-300"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="sig-qrcode" className="font-medium text-gray-700">Tanda Tangan QR Code</label>
                                        <p className="text-gray-500">Sistem otomatis menghasilkan QR code unik untuk verifikasi.</p>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </SettingsCard>
                );
            default:
                return null;
        }
    }

    const TabButton: React.FC<{tabId: ActiveTab; label: string}> = ({ tabId, label}) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tabId ? 'border-slate-700 text-slate-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
            {label}
        </button>
    )

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Pengaturan Aplikasi</h2>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton tabId="preferensi" label="Preferensi" />
                    <TabButton tabId="akun" label="Akun" />
                    <TabButton tabId="delegasi" label="Delegasi Wewenang" />
                    <TabButton tabId="kopSurat" label="Kop Surat" />
                    <TabButton tabId="penomoran" label="Penomoran" />
                    <TabButton tabId="branding" label="Branding & Logo" />
                    <TabButton tabId="sistem" label="Sistem" />
                </nav>
            </div>

            <div className="pt-4">
                {renderContent()}
            </div>

        </div>
    );
};

export default Pengaturan;
