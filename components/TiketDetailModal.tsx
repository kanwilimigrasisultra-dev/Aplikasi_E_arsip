import React, { useState } from 'react';
import { Tiket, User, UserRole, BalasanTiket } from '../types';
import Modal from './Modal';
import { PaperAirplaneIcon } from './icons';

interface TiketDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    tiket: Tiket;
    currentUser: User;
    allUsers: User[];
    onUpdate: (tiket: Tiket) => void;
}

const TiketDetailModal: React.FC<TiketDetailModalProps> = ({ isOpen, onClose, tiket, currentUser, allUsers, onUpdate }) => {
    const [balasanTeks, setBalasanTeks] = useState('');
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN;
    
    const handleAddBalasan = () => {
        if (!balasanTeks.trim()) return;

        const newBalasan: BalasanTiket = {
            id: `balasan-${Date.now()}`,
            user: currentUser,
            teks: balasanTeks,
            timestamp: new Date().toISOString(),
            isInternalNote: false, // For now, all are public
        };

        const updatedTiket = { ...tiket, balasan: [...tiket.balasan, newBalasan] };
        
        // If user replies, change status to 'Menunggu Respon' (from admin)
        if (!isAdmin) {
            updatedTiket.status = 'Menunggu Respon';
        }

        onUpdate(updatedTiket);
        setBalasanTeks('');
    };
    
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as Tiket['status'];
        onUpdate({ ...tiket, status: newStatus });
    };

    const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const assigneeId = e.target.value;
        const assignee = allUsers.find(u => u.id === assigneeId);
        onUpdate({ ...tiket, ditugaskanKepada: assignee });
    };

    const adminUsers = allUsers.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detail Tiket #${tiket.id.split('-')[1]}`} size="2xl">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800">{tiket.judul}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-y py-3">
                    <div><span className="font-semibold text-slate-600">Pembuat:</span> {tiket.pembuat.nama}</div>
                    <div><span className="font-semibold text-slate-600">Kategori:</span> {tiket.kategori}</div>
                    <div><span className="font-semibold text-slate-600">Prioritas:</span> {tiket.prioritas}</div>
                </div>

                {isAdmin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-md">
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Ubah Status</label>
                            <select value={tiket.status} onChange={handleStatusChange} className="mt-1 w-full text-sm border-gray-300 rounded-md">
                                <option value="Baru">Baru</option>
                                <option value="Sedang Diproses">Sedang Diproses</option>
                                <option value="Menunggu Respon">Menunggu Respon</option>
                                <option value="Selesai">Selesai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600">Ditugaskan Kepada</label>
                             <select value={tiket.ditugaskanKepada?.id || ''} onChange={handleAssigneeChange} className="mt-1 w-full text-sm border-gray-300 rounded-md">
                                <option value="">-- Belum Ditugaskan --</option>
                                {adminUsers.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                            </select>
                        </div>
                    </div>
                )}
                
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{tiket.pembuat.nama.charAt(0)}</div>
                        <div className="flex-1 bg-slate-100 p-3 rounded-lg">
                             <div className="flex justify-between items-center">
                                <p className="text-sm font-semibold text-slate-800">{tiket.pembuat.nama}</p>
                                <p className="text-xs text-slate-500">{new Date(tiket.tanggalDibuat).toLocaleString('id-ID')}</p>
                            </div>
                            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{tiket.deskripsi}</p>
                        </div>
                    </div>
                    {tiket.balasan.map(b => (
                        <div key={b.id} className={`flex items-start gap-3 ${b.user.id === currentUser.id ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{b.user.nama.charAt(0)}</div>
                            <div className={`flex-1 p-3 rounded-lg ${b.user.id === currentUser.id ? 'bg-sky-100' : 'bg-slate-100'}`}>
                                <div className={`flex justify-between items-center ${b.user.id === currentUser.id ? 'flex-row-reverse' : ''}`}>
                                    <p className="text-sm font-semibold text-slate-800">{b.user.nama}</p>
                                    <p className="text-xs text-slate-500">{new Date(b.timestamp).toLocaleString('id-ID')}</p>
                                </div>
                                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{b.teks}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {tiket.status !== 'Selesai' && (
                <div className="pt-4 border-t">
                     <h4 className="text-sm font-semibold text-slate-800 mb-2">Tambah Balasan</h4>
                     <textarea value={balasanTeks} onChange={e => setBalasanTeks(e.target.value)} rows={3} className="w-full text-sm border-gray-300 rounded-md" placeholder="Tulis balasan Anda..."></textarea>
                     <div className="text-right mt-2">
                         <button onClick={handleAddBalasan} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800">
                             <PaperAirplaneIcon className="w-4 h-4 mr-2"/>
                             Kirim
                         </button>
                     </div>
                </div>
                )}
            </div>
        </Modal>
    );
};

export default TiketDetailModal;