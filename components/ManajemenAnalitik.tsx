import React from 'react';
import { AnySurat, User, UnitKerja, TipeSurat, SuratKeluar, SuratMasuk, StatusDisposisi, ApprovalStep } from '../types';
import SuratChart from './SuratChart'; // Re-using for consistency
import { ClockIcon, UsersIcon, TagIcon } from './icons';


interface ManajemenAnalitikProps {
    allSurat: AnySurat[];
    allUsers: User[];
    unitKerjaList: UnitKerja[];
}

const AnalyticsCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <div className="flex items-center mb-4">
            {icon}
            <h3 className="text-lg font-semibold text-slate-800 ml-3">{title}</h3>
        </div>
        <div>
            {children}
        </div>
    </div>
);

const ManajemenAnalitik: React.FC<ManajemenAnalitikProps> = ({ allSurat, allUsers, unitKerjaList }) => {

    const avgDispoResponseTime = () => {
        const responseTimes: { [unitId: string]: { totalMs: number, count: number } } = {};

        const suratMasuk = allSurat.filter(s => s.tipe === TipeSurat.MASUK) as SuratMasuk[];

        suratMasuk.forEach(s => {
            s.disposisi.forEach(d => {
                const created = d.riwayatStatus.find(r => r.status === StatusDisposisi.DIPROSES);
                const finished = d.riwayatStatus.find(r => r.status === StatusDisposisi.SELESAI);
                const unit = unitKerjaList.find(u => u.id === d.tujuan.unitKerjaId);

                if (created && finished && unit) {
                    const diffMs = new Date(finished.tanggal).getTime() - new Date(created.tanggal).getTime();
                    if (!responseTimes[unit.id]) {
                        responseTimes[unit.id] = { totalMs: 0, count: 0 };
                    }
                    responseTimes[unit.id].totalMs += diffMs;
                    responseTimes[unit.id].count++;
                }
            });
        });
        
        const avgData = Object.entries(responseTimes).map(([unitId, data]) => {
             const unit = unitKerjaList.find(u => u.id === unitId);
             const avgHours = (data.totalMs / data.count) / (1000 * 60 * 60);
             return { unitName: unit?.nama || 'N/A', avgHours: parseFloat(avgHours.toFixed(2)) };
        });

        return avgData.sort((a,b) => b.avgHours - a.avgHours);
    };

    const approvalBottlenecks = () => {
         const delayTimes: { [userId: string]: { totalMs: number, count: number } } = {};
         const suratKeluar = allSurat.filter(s => s.tipe === TipeSurat.KELUAR) as SuratKeluar[];

         suratKeluar.forEach(s => {
            let lastTimestamp = new Date(s.tanggal); // Start from surat creation
            s.approvalChain.forEach(step => {
                if(step.status !== 'Menunggu' && step.timestamp) {
                    const currentTimestamp = new Date(step.timestamp);
                    const diffMs = currentTimestamp.getTime() - lastTimestamp.getTime();
                    
                    if (!delayTimes[step.approver.id]) {
                        delayTimes[step.approver.id] = { totalMs: 0, count: 0 };
                    }
                    delayTimes[step.approver.id].totalMs += diffMs;
                    delayTimes[step.approver.id].count++;
                    lastTimestamp = currentTimestamp;
                }
            });
         });

         const avgData = Object.entries(delayTimes).map(([userId, data]) => {
             const user = allUsers.find(u => u.id === userId);
             const avgDays = (data.totalMs / data.count) / (1000 * 60 * 60 * 24);
             return { userName: user?.nama || 'N/A', avgDays: parseFloat(avgDays.toFixed(2)) };
        });
        
        return avgData.sort((a,b) => b.avgDays - a.avgDays).slice(0, 5); // Top 5
    }
    
    const dataDispo = avgDispoResponseTime();
    const dataBottleneck = approvalBottlenecks();

    return (
        <div className="space-y-6">
             <AnalyticsCard icon={<ClockIcon className="w-6 h-6 text-sky-700" />} title="Waktu Respons Disposisi Rata-Rata">
                 <div className="space-y-3">
                    {dataDispo.map(item => (
                        <div key={item.unitName}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700">{item.unitName}</span>
                                <span className="text-sm font-medium text-slate-700">{item.avgHours} jam</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${(item.avgHours / Math.max(...dataDispo.map(d => d.avgHours))) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                 </div>
            </AnalyticsCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <AnalyticsCard icon={<UsersIcon className="w-6 h-6 text-amber-700" />} title="Analisis Bottleneck Persetujuan (Top 5)">
                     <p className="text-xs text-slate-500 mb-4 -mt-2">Waktu rata-rata yang dibutuhkan per pengguna untuk memberikan persetujuan.</p>
                     <div className="space-y-2">
                        {dataBottleneck.map(item => (
                             <div key={item.userName} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                                <span className="text-sm font-medium text-slate-800">{item.userName}</span>
                                <span className="text-sm font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded-md">{item.avgDays} hari</span>
                            </div>
                        ))}
                     </div>
                </AnalyticsCard>
                 <AnalyticsCard icon={<TagIcon className="w-6 h-6 text-emerald-700" />} title="Tren Kategori Surat (12 Bulan)">
                     <div className="h-64">
                         <SuratChart allSurat={allSurat} />
                     </div>
                </AnalyticsCard>
            </div>
        </div>
    );
};

export default ManajemenAnalitik;
