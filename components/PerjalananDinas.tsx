import React, { useState, useMemo } from 'react';
import { PerjalananDinas, SuratKeluar, User, LaporanPerjalananDinas, UserRole } from '../types';
import { GlobeAltIcon } from './icons';

interface PerjalananDinasProps {
    perjalananDinasList: PerjalananDinas[];
    suratKeluarList: SuratKeluar[];
    currentUser: User;
    allUsers: User[];
    onAddLaporan: (perjalananDinasId: string, laporan: LaporanPerjalananDinas) => void;
}

const getStatusBadge = (status: PerjalananDinas['status']) => {
    const colorMap = {
        'Direncanakan': 'bg-sky-100 text-sky-800',
        'Selesai': 'bg-slate-100 text-slate-800',
        'Laporan Dikirim': 'bg-emerald-100 text-emerald-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[status]}`}>{status}</span>;
}

const PerjalananDinasComponent: React.FC<PerjalananDinasProps> = ({ perjalananDinasList, suratKeluarList, currentUser, allUsers, onAddLaporan }) => {
    
    const myPerjalananDinas = useMemo(() => {
        const isAdminOrPimpinan = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PIMPINAN, UserRole.MANAJERIAL].includes(currentUser.role);
        
        if (isAdminOrPimpinan) {
            return perjalananDinasList;
        }
        
        // Staf view: only see trips they are a participant in.
        return perjalananDinasList.filter(pd => pd.pesertaIds.includes(currentUser.id));

    }, [perjalananDinasList, currentUser]);


    const combinedData = myPerjalananDinas.map(pd => {
        const suratTugas = suratKeluarList.find(s => s.id === pd.suratTugasId);
        return { ...pd, suratTugas };
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                     <div className="flex items-center">
                        <GlobeAltIcon className="w-6 h-6 mr-3 text-slate-700" />
                        <h3 className="text-xl font-bold text-slate-800">Manajemen Perjalanan Dinas (SPPD)</h3>
                    </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">Monitor semua perjalanan dinas yang direncanakan, sedang berlangsung, dan telah selesai.</p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Perihal (Surat Tugas)</th>
                                <th scope="col" className="px-6 py-3">Kota Tujuan</th>
                                <th scope="col" className="px-6 py-3">Tanggal</th>
                                <th scope="col" className="px-6 py-3">Peserta</th>
                                <th scope="col" className="px-6 py-3">Status Perjalanan</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {combinedData.map(item => {
                                if (!item.suratTugas) return null;
                                const peserta = item.pesertaIds.map(id => allUsers.find(u => u.id === id)?.nama).filter(Boolean).join(', ');
                                const isParticipant = item.pesertaIds.includes(currentUser.id);
                                const canSubmitLaporan = isParticipant && item.status === 'Selesai';

                                return (
                                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 max-w-sm truncate" title={item.suratTugas.perihal}>{item.suratTugas.perihal}</td>
                                    <td className="px-6 py-4">{item.kotaTujuan}</td>
                                    <td className="px-6 py-4">{new Date(item.tanggalBerangkat).toLocaleDateString()} - {new Date(item.tanggalKembali).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={peserta}>{peserta}</td>
                                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => alert('Fitur lihat detail SPPD sedang dikembangkan.')} 
                                            className="font-medium text-blue-600 hover:text-blue-800 mr-2"
                                        >
                                            Detail
                                        </button>
                                         <button 
                                            onClick={() => alert('Fungsi Lapor sedang dikembangkan.')} 
                                            disabled={!canSubmitLaporan}
                                            className="font-medium text-emerald-600 hover:text-emerald-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                                        >
                                            {item.status === 'Laporan Dikirim' ? 'Laporan Terkirim' : 'Kirim Laporan'}
                                        </button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                     {combinedData.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>Belum ada data perjalanan dinas yang tercatat untuk Anda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerjalananDinasComponent;