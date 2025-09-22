import React, { useState } from 'react';
import { Tiket, User, UserRole } from '../types';
import { PlusIcon, CheckCircleIcon, ClockIcon, PaperAirplaneIcon, TagIcon } from './icons';
import TiketFormModal from './TiketFormModal';
import TiketDetailModal from './TiketDetailModal';

interface HelpdeskProps {
    tiketList: Tiket[];
    currentUser: User;
    allUsers: User[];
    onCreateTiket: (tiket: Omit<Tiket, 'id' | 'pembuat' | 'tanggalDibuat' | 'tanggalUpdate' | 'status' | 'balasan'>) => void;
    onUpdateTiket: (tiket: Tiket) => void;
}

const getStatusBadge = (status: Tiket['status']) => {
    const colorMap = {
        'Baru': 'bg-sky-100 text-sky-800',
        'Sedang Diproses': 'bg-amber-100 text-amber-800',
        'Menunggu Respon': 'bg-indigo-100 text-indigo-800',
        'Selesai': 'bg-emerald-100 text-emerald-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[status]}`}>{status}</span>;
}

const getPriorityBadge = (priority: Tiket['prioritas']) => {
     const colorMap = {
        'Rendah': 'bg-slate-100 text-slate-800',
        'Sedang': 'bg-blue-100 text-blue-800',
        'Tinggi': 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[priority]}`}>{priority}</span>;
}

const AdminView: React.FC<HelpdeskProps> = ({ tiketList, currentUser, allUsers, onUpdateTiket }) => {
    const [selectedTiket, setSelectedTiket] = useState<Tiket | null>(null);
    const [filterStatus, setFilterStatus] = useState('');

    const stats = {
        baru: tiketList.filter(t => t.status === 'Baru').length,
        diproses: tiketList.filter(t => t.status === 'Sedang Diproses').length,
        selesai: tiketList.filter(t => t.status === 'Selesai').length,
    };

    const filteredTiket = tiketList.filter(t => filterStatus === '' || t.status === filterStatus);

    const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: number, color: string }> = ({ icon, title, value, color }) => (
        <div className={`bg-white p-4 rounded-lg shadow-sm border flex items-center space-x-3 ${color}`}>
            {icon}
            <div>
                <p className="text-sm text-slate-600">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );

    return (
        <>
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Dasbor Helpdesk</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={<PlusIcon className="w-6 h-6 text-sky-600"/>} title="Tiket Baru" value={stats.baru} color="border-sky-200" />
                <StatCard icon={<ClockIcon className="w-6 h-6 text-amber-600"/>} title="Sedang Diproses" value={stats.diproses} color="border-amber-200" />
                <StatCard icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600"/>} title="Selesai" value={stats.selesai} color="border-emerald-200" />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold text-slate-800">Daftar Semua Tiket</h3>
                     <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border-gray-300 rounded-md">
                        <option value="">Semua Status</option>
                        <option value="Baru">Baru</option>
                        <option value="Sedang Diproses">Sedang Diproses</option>
                        <option value="Menunggu Respon">Menunggu Respon</option>
                        <option value="Selesai">Selesai</option>
                     </select>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Judul</th>
                                <th scope="col" className="px-6 py-3">Pembuat</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Prioritas</th>
                                <th scope="col" className="px-6 py-3">Terakhir Update</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTiket.map(tiket => (
                                <tr key={tiket.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 max-w-sm truncate">{tiket.judul}</td>
                                    <td className="px-6 py-4">{tiket.pembuat.nama}</td>
                                    <td className="px-6 py-4">{getStatusBadge(tiket.status)}</td>
                                    <td className="px-6 py-4">{getPriorityBadge(tiket.prioritas)}</td>
                                    <td className="px-6 py-4">{new Date(tiket.tanggalUpdate).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => setSelectedTiket(tiket)} className="font-medium text-blue-600 hover:text-blue-800">Kelola</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        {selectedTiket && (
            <TiketDetailModal
                isOpen={!!selectedTiket}
                onClose={() => setSelectedTiket(null)}
                tiket={selectedTiket}
                currentUser={currentUser}
                allUsers={allUsers}
                onUpdate={onUpdateTiket}
            />
        )}
        </>
    );
};

const UserView: React.FC<HelpdeskProps> = ({ tiketList, currentUser, allUsers, onCreateTiket, onUpdateTiket }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTiket, setSelectedTiket] = useState<Tiket | null>(null);
    const myTickets = tiketList.filter(t => t.pembuat.id === currentUser.id);

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Tiket Bantuan Saya</h2>
                    <button onClick={() => setIsFormOpen(true)} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Buat Tiket Baru
                    </button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Judul</th>
                                    <th scope="col" className="px-6 py-3">Kategori</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Terakhir Update</th>
                                    <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myTickets.map(tiket => (
                                    <tr key={tiket.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900 max-w-sm truncate">{tiket.judul}</td>
                                        <td className="px-6 py-4">{tiket.kategori}</td>
                                        <td className="px-6 py-4">{getStatusBadge(tiket.status)}</td>
                                        <td className="px-6 py-4">{new Date(tiket.tanggalUpdate).toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setSelectedTiket(tiket)} className="font-medium text-blue-600 hover:text-blue-800">Lihat Detail</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {myTickets.length === 0 && <p className="text-center text-slate-500 py-8">Anda belum membuat tiket bantuan.</p>}
                    </div>
                </div>
            </div>
            <TiketFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={onCreateTiket}
            />
            {selectedTiket && (
                 <TiketDetailModal
                    isOpen={!!selectedTiket}
                    onClose={() => setSelectedTiket(null)}
                    tiket={selectedTiket}
                    currentUser={currentUser}
                    allUsers={allUsers}
                    onUpdate={onUpdateTiket}
                />
            )}
        </>
    );
};

const Helpdesk: React.FC<HelpdeskProps> = (props) => {
    const isAdmin = props.currentUser.role === UserRole.ADMIN || props.currentUser.role === UserRole.SUPER_ADMIN;
    return isAdmin ? <AdminView {...props} /> : <UserView {...props} />;
};

export default Helpdesk;