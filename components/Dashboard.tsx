import React, { useState, useMemo } from 'react';
import { AnySurat, TipeSurat, SifatSurat, Tugas, User, DashboardLayoutSettings, PermintaanLaporan, PengirimanLaporan, UserRole, DashboardWidget, DashboardWidgetId } from '../types';
import { ArchiveIcon, InboxIcon, OutboxIcon, CogIcon, CheckCircleIcon, DocumentChartBarIcon, GripVerticalIcon } from './icons';
import SuratChart from './SuratChart';
import Modal from './Modal';

interface DashboardProps {
    suratMasukCount: number;
    suratKeluarCount: number;
    archivedCount: number;
    allSurat: AnySurat[];
    allTugas: Tugas[];
    permintaanLaporanList: PermintaanLaporan[];
    pengirimanLaporanList: PengirimanLaporan[];
    currentUser: User;
    widgetLayout: DashboardLayoutSettings;
    onWidgetLayoutChange: (settings: DashboardLayoutSettings) => void;
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
    layout: DashboardLayoutSettings;
    onSave: (settings: DashboardLayoutSettings) => void;
}> = ({ isOpen, onClose, layout, onSave }) => {
    const [localLayout, setLocalLayout] = useState(layout);

    const handleToggle = (widgetId: DashboardWidgetId) => {
        setLocalLayout(prev => 
            prev.map(widget => 
                widget.id === widgetId ? {...widget, visible: !widget.visible } : widget
            )
        );
    }

    const handleSave = () => {
        onSave(localLayout);
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
                <p className="text-sm text-slate-500">Pilih widget yang ingin Anda tampilkan di halaman dashboard. Anda dapat mengatur urutan widget langsung di dashboard.</p>
                {localLayout.map(widget => (
                    <ToggleSwitch key={widget.id} label={widget.name} enabled={widget.visible} onChange={() => handleToggle(widget.id)} />
                ))}
            </div>
             <div className="flex justify-end pt-6">
                <button type="button" onClick={handleSave} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                    Simpan
                </button>
            </div>
        </Modal>
    );
}


const Dashboard: React.FC<DashboardProps> = (props) => {
    const { suratMasukCount, suratKeluarCount, archivedCount, allSurat, allTugas, currentUser, widgetLayout, onWidgetLayoutChange, permintaanLaporanList, pengirimanLaporanList } = props;
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    
    const [draggedWidgetId, setDraggedWidgetId] = useState<DashboardWidgetId | null>(null);

    const recentSurat = allSurat.slice(0, 5);
    const myTasks = allTugas
        .filter(t => t.ditugaskanKepada.id === currentUser.id && t.status !== 'Selesai')
        .sort((a, b) => new Date(a.tanggalJatuhTempo).getTime() - new Date(b.tanggalJatuhTempo).getTime());
    
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.PIMPINAN;

    const myKewajibanLaporan = useMemo(() => {
        if (isAdmin) return []; // Admin view is different
        return permintaanLaporanList
            .filter(p => p.unitTujuanIds.includes(currentUser.unitKerjaId))
            .filter(p => !pengirimanLaporanList.some(peng => peng.permintaanId === p.id && peng.unitKerjaId === currentUser.unitKerjaId)); // Show only unsubmitted
    }, [permintaanLaporanList, pengirimanLaporanList, currentUser, isAdmin]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widgetId: DashboardWidgetId) => {
        setDraggedWidgetId(widgetId);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
        setDraggedWidgetId(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow drop
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetWidgetId: DashboardWidgetId) => {
        e.preventDefault();
        if (!draggedWidgetId || draggedWidgetId === targetWidgetId) return;

        const draggedIndex = widgetLayout.findIndex(w => w.id === draggedWidgetId);
        const targetIndex = widgetLayout.findIndex(w => w.id === targetWidgetId);

        const newLayout = [...widgetLayout];
        const [draggedItem] = newLayout.splice(draggedIndex, 1);
        newLayout.splice(targetIndex, 0, draggedItem);
        
        onWidgetLayoutChange(newLayout);
    };

    const renderWidget = (widget: DashboardWidget) => {
        const components: { [key in DashboardWidgetId]: React.ReactNode } = {
            stats: (
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
            ),
            chart: (
                <div className="h-96">
                    <SuratChart allSurat={allSurat} />
                </div>
            ),
            tasks: (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {myTasks.length > 0 ? myTasks.map(tugas => (
                        <div key={tugas.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-sm font-medium text-slate-800">{tugas.deskripsi}</p>
                            <p className="text-xs text-slate-500 mt-1">Jatuh Tempo: {new Date(tugas.tanggalJatuhTempo).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500">Dari Surat: {allSurat.find(s => s.id === tugas.suratId)?.nomorSurat || 'N/A'}</p>
                        </div>
                    )) : (
                        <div className="text-center py-6 text-slate-500">
                            <CheckCircleIcon className="w-8 h-8 mx-auto text-slate-300" />
                            <p className="mt-2 text-sm">Tidak ada tugas aktif.</p>
                        </div>
                    )}
                </div>
            ),
            pelaporan: (
                 <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {isAdmin ? (
                        permintaanLaporanList.length > 0 ? permintaanLaporanList.map(p => {
                            const submissions = pengirimanLaporanList.filter(peng => peng.permintaanId === p.id).length;
                            const progress = submissions / p.unitTujuanIds.length * 100;
                            return (
                                <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <p className="text-sm font-medium text-slate-800 truncate">{p.nama}</p>
                                    <p className="text-xs text-slate-500 mt-1">{p.aturanJatuhTempo}</p>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                        <div className="bg-slate-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-600 text-right mt-1">{submissions} / {p.unitTujuanIds.length} Terkirim</p>
                                </div>
                            )
                        }) : (
                            <div className="text-center py-6 text-slate-500">
                                <DocumentChartBarIcon className="w-8 h-8 mx-auto text-slate-300" />
                                <p className="mt-2 text-sm">Belum ada permintaan laporan.</p>
                            </div>
                        )
                    ) : (
                        myKewajibanLaporan.length > 0 ? myKewajibanLaporan.map(k => (
                             <div key={k.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="text-sm font-medium text-slate-800">{k.nama}</p>
                                <p className="text-xs text-slate-500 mt-1">Periode: {k.periode} | Jatuh Tempo: {k.aturanJatuhTempo}</p>
                             </div>
                        )) : (
                            <div className="text-center py-6 text-slate-500">
                                <CheckCircleIcon className="w-8 h-8 mx-auto text-slate-300" />
                                <p className="mt-2 text-sm">Tidak ada laporan yang perlu dikirim.</p>
                            </div>
                        )
                    )}
                </div>
            ),
            recent: (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Tipe</th>
                                <th scope="col" className="px-6 py-3">Nomor Surat</th>
                                <th scope="col" className="px-6 py-3">Perihal</th>
                                <th scope="col" className="px-6 py-3">Sifat</th>
                                <th scope="col" className="px-6 py-3">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSurat.map(surat => (
                                <tr key={surat.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ surat.tipe === TipeSurat.MASUK ? 'bg-sky-100 text-sky-800' : (surat.tipe === TipeSurat.KELUAR ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800') }`}>{surat.tipe}</span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{surat.nomorSurat}</td>
                                    <td className="px-6 py-4">{surat.perihal}</td>
                                    <td className="px-6 py-4">{getSifatBadge(surat.sifat)}</td>
                                    <td className="px-6 py-4">{new Date(surat.tanggal).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        };
        
        const widgetTitles: {[key in DashboardWidgetId]: string} = {
            stats: 'Statistik Utama',
            chart: 'Tren Surat 12 Bulan Terakhir',
            tasks: 'Tugas Saya',
            pelaporan: isAdmin ? "Pemantauan Laporan" : "Kewajiban Laporan Anda",
            recent: 'Aktivitas Surat Terkini',
        }

        return (
            <div 
                draggable 
                onDragStart={(e) => handleDragStart(e, widget.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, widget.id)}
                className={`bg-white p-6 rounded-xl shadow-md border border-slate-200 transition-all duration-300 ${draggedWidgetId === widget.id ? 'opacity-50' : ''}`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">{widgetTitles[widget.id]}</h3>
                    <div className="cursor-move text-slate-400 hover:text-slate-600">
                        <GripVerticalIcon className="w-5 h-5" />
                    </div>
                </div>
                {components[widget.id]}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Selamat datang, {currentUser.nama.split(' ')[0]}!</h1>
                <button onClick={() => setSettingsModalOpen(true)} className="flex items-center text-sm bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shadow-sm">
                    <CogIcon className="w-4 h-4 mr-2" />
                    Sesuaikan
                </button>
            </div>
            
            <div className="space-y-6">
                {widgetLayout.filter(w => w.visible).map(widget => (
                     <div key={widget.id}>
                        {renderWidget(widget)}
                     </div>
                ))}
            </div>
            
             <DashboardSettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                layout={widgetLayout}
                onSave={onWidgetLayoutChange}
             />
        </div>
    );
};

export default Dashboard;