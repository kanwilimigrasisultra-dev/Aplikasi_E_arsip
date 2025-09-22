
import React, { useState, useMemo } from 'react';
import { PermintaanLaporan, PengirimanLaporan, User, UnitKerja, UserRole, Attachment } from '../types';
import { PlusIcon, CheckCircleIcon, ClockIcon, PaperClipIcon } from './icons';
import Modal from './Modal';
import PermintaanLaporanFormModal from './PermintaanLaporanFormModal';
import PengirimanLaporanFormModal from './PengirimanLaporanFormModal';

interface PelaporanPeriodikProps {
    permintaanList: PermintaanLaporan[];
    pengirimanList: PengirimanLaporan[];
    currentUser: User;
    unitKerjaList: UnitKerja[];
    allUsers: User[];
    onCreatePermintaan: (permintaan: Omit<PermintaanLaporan, 'id'|'dibuatOleh'|'timestamp'>) => void;
    onUpdatePermintaan: (permintaan: PermintaanLaporan) => void;
    onDeletePermintaan: (permintaanId: string) => void;
    onCreatePengiriman: (pengiriman: Omit<PengirimanLaporan, 'id'|'dikirimOleh'|'tanggalPengiriman'|'status'>) => void;
}

const AdminView: React.FC<PelaporanPeriodikProps> = (props) => {
    const { permintaanList, pengirimanList, unitKerjaList, onCreatePermintaan } = props;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [permintaanToEdit, setPermintaanToEdit] = useState<PermintaanLaporan | null>(null);

    const getStatusForUnit = (permintaan: PermintaanLaporan, unitId: string): { status: string; color: string; pengiriman?: PengirimanLaporan } => {
        // This is a simplified logic for mock data. A real app would check based on current date and period.
        const pengiriman = pengirimanList.find(p => p.permintaanId === permintaan.id && p.unitKerjaId === unitId);
        if (pengiriman) {
            return { status: pengiriman.status, color: pengiriman.status === 'Tepat Waktu' ? 'text-emerald-600' : 'text-amber-600', pengiriman };
        }
        // Simplified pending status
        return { status: 'Menunggu Pengiriman', color: 'text-slate-500' };
    };

    const handleOpenCreateModal = () => {
        setPermintaanToEdit(null);
        setIsFormOpen(true);
    };
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Pemantauan Laporan Periodik</h2>
                    <button onClick={handleOpenCreateModal} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Buat Permintaan Laporan
                    </button>
                </div>
                
                {permintaanList.map(permintaan => {
                    const submissions = pengirimanList.filter(p => p.permintaanId === permintaan.id);
                    const progress = `${submissions.length} / ${permintaan.unitTujuanIds.length}`;

                    return (
                        <div key={permintaan.id} className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">{permintaan.nama}</h3>
                                    <p className="text-sm text-slate-500">{permintaan.periode} - Jatuh Tempo: {permintaan.aturanJatuhTempo}</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-slate-700 text-lg">{progress}</span>
                                    <p className="text-xs text-slate-500">Terkirim</p>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-semibold text-sm text-slate-600 mb-2">Status Pengiriman per Unit:</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {permintaan.unitTujuanIds.map(unitId => {
                                        const unit = unitKerjaList.find(u => u.id === unitId);
                                        if (!unit) return null;
                                        const { status, color, pengiriman } = getStatusForUnit(permintaan, unitId);
                                        return (
                                            <div key={unitId} className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                                <p className="text-sm font-medium text-slate-800">{unit.nama}</p>
                                                <div className="flex items-center space-x-2">
                                                    {pengiriman && <a href={pengiriman.attachment.content} download={pengiriman.attachment.name} title={pengiriman.attachment.name}><PaperClipIcon className="w-4 h-4 text-slate-400"/></a>}
                                                    <span className={`text-xs font-semibold ${color}`}>{status}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <PermintaanLaporanFormModal 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={onCreatePermintaan}
                unitKerjaList={unitKerjaList.filter(u => u.tipe === 'Cabang')} // Only branches can be destinations
                permintaanToEdit={permintaanToEdit}
            />
        </>
    );
};

const StafView: React.FC<PelaporanPeriodikProps> = (props) => {
    const { permintaanList, pengirimanList, currentUser, onCreatePengiriman } = props;
    const [isPengirimanModalOpen, setIsPengirimanModalOpen] = useState(false);
    const [selectedPermintaan, setSelectedPermintaan] = useState<PermintaanLaporan | null>(null);

    const myUnitId = currentUser.unitKerjaId;
    const myKewajiban = useMemo(() => {
        return permintaanList.filter(p => p.unitTujuanIds.includes(myUnitId));
    }, [permintaanList, myUnitId]);

    const hasSubmitted = (permintaanId: string) => {
        // Simplified check for mock data
        return pengirimanList.some(p => p.permintaanId === permintaanId && p.unitKerjaId === myUnitId);
    };

    const handleOpenPengirimanModal = (permintaan: PermintaanLaporan) => {
        setSelectedPermintaan(permintaan);
        setIsPengirimanModalOpen(true);
    };

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Kewajiban Laporan Unit Anda</h2>

                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nama Laporan</th>
                                    <th scope="col" className="px-6 py-3">Periode</th>
                                    <th scope="col" className="px-6 py-3">Jatuh Tempo</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myKewajiban.map(permintaan => {
                                    const submitted = hasSubmitted(permintaan.id);
                                    return (
                                    <tr key={permintaan.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{permintaan.nama}</td>
                                        <td className="px-6 py-4">{permintaan.periode}</td>
                                        <td className="px-6 py-4">{permintaan.aturanJatuhTempo}</td>
                                        <td className="px-6 py-4">
                                            {submitted ? (
                                                <span className="flex items-center text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-full"><CheckCircleIcon className="w-4 h-4 mr-1.5"/> Sudah Dikirim</span>
                                            ) : (
                                                <span className="flex items-center text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded-full"><ClockIcon className="w-4 h-4 mr-1.5"/> Menunggu Pengiriman</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleOpenPengirimanModal(permintaan)} disabled={submitted} className="font-medium text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed">
                                                {submitted ? 'Sudah Dikirim' : 'Kirim Laporan'}
                                            </button>
                                        </td>
                                    </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {selectedPermintaan && (
                <PengirimanLaporanFormModal
                    isOpen={isPengirimanModalOpen}
                    onClose={() => setIsPengirimanModalOpen(false)}
                    onSubmit={onCreatePengiriman}
                    permintaan={selectedPermintaan}
                    currentUser={currentUser}
                />
            )}
        </>
    );
};


const PelaporanPeriodik: React.FC<PelaporanPeriodikProps> = (props) => {
    const { currentUser } = props;
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.PIMPINAN;

    return isAdmin ? <AdminView {...props} /> : <StafView {...props} />;
};

export default PelaporanPeriodik;
