import React from 'react';
import { AnySurat, TipeSurat, SifatSurat } from '../types';
import { ArchiveIcon, InboxIcon, OutboxIcon } from './icons';
import SuratChart from './SuratChart';

interface DashboardProps {
    suratMasukCount: number;
    suratKeluarCount: number;
    archivedCount: number;
    allSurat: AnySurat[];
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

const Dashboard: React.FC<DashboardProps> = ({ suratMasukCount, suratKeluarCount, archivedCount, allSurat }) => {
    const recentSurat = allSurat.slice(0, 5);
    
    return (
        <div className="space-y-6">
            {/* Stat Cards */}
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

            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Tren Surat 12 Bulan Terakhir</h3>
                <div className="h-80">
                    <SuratChart allSurat={allSurat} />
                </div>
            </div>

            {/* Recent Activity */}
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
                                            : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {surat.tipe === TipeSurat.MASUK ? 'Masuk' : 'Keluar'}
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
        </div>
    );
};

export default Dashboard;