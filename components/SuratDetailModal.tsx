import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { 
    AnySurat, KategoriSurat, User, SifatDisposisi, StatusDisposisi, TipeSurat, 
    SuratMasuk as TSuratMasuk, SuratKeluar as TSuratKeluar, SifatSurat, KopSuratSettings, 
    AppSettings, UnitKerja, SignatureMethod, UserRole 
} from '../types';
import { 
    PencilIcon, CheckCircleIcon, ClockIcon, RefreshIcon, UsersIcon, PrinterIcon, 
    ArchiveIcon, LinkIcon, ShieldCheckIcon, PaperClipIcon, ShieldExclamationIcon, TagIcon
} from './icons';
import SuratPrintModal from './SuratPrintModal';
import LembarDisposisiPrintModal from './LembarDisposisiPrintModal';

interface SuratDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    surat: AnySurat;
    kategoriList: KategoriSurat[];
    allUsers: User[];
    currentUser: User;
    allSurat: AnySurat[];
    unitKerjaList: UnitKerja[];
    kopSuratSettings: KopSuratSettings;
    appSettings: AppSettings;
    onArchive: () => void;
    onAddDisposisi: (suratId: string, catatan: string, tujuanId: string, sifat: SifatDisposisi) => void;
    onUpdateDisposisiStatus: (suratId: string, disposisiId: string, status: StatusDisposisi) => void;
    onTambahTandaTangan: (suratId: string, signatureDataUrl?: string) => void;
}

const getSifatBadge = (sifat: SifatSurat) => {
    const colorMap = {
        [SifatSurat.BIASA]: 'bg-slate-100 text-slate-800',
        [SifatSurat.PENTING]: 'bg-sky-100 text-sky-800',
        [SifatSurat.SANGAT_PENTING]: 'bg-amber-100 text-amber-800',
        [SifatSurat.RAHASIA]: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[sifat]}`}>{sifat}</span>;
}

const getStatusDisposisiBadge = (status: StatusDisposisi) => {
    const colorMap = {
        [StatusDisposisi.PENDING]: 'bg-amber-100 text-amber-800',
        [StatusDisposisi.DIPROSES]: 'bg-sky-100 text-sky-800',
        [StatusDisposisi.SELESAI]: 'bg-emerald-100 text-emerald-800',
        [StatusDisposisi.DIBACA]: 'bg-indigo-100 text-indigo-800'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[status]}`}>{status}</span>;
};

const SuratDetailModal: React.FC<SuratDetailModalProps> = ({
    isOpen, onClose, surat, kategoriList, allUsers, currentUser, allSurat, unitKerjaList,
    kopSuratSettings, appSettings, onArchive, onAddDisposisi, onUpdateDisposisiStatus, onTambahTandaTangan
}) => {
    const [activeTab, setActiveTab] = useState('detail');
    
    // Disposisi state
    const [isDisposisiFormVisible, setDisposisiFormVisible] = useState(false);
    const [disposisiCatatan, setDisposisiCatatan] = useState('');
    const [disposisiTujuanId, setDisposisiTujuanId] = useState('');
    const [disposisiSifat, setDisposisiSifat] = useState<SifatDisposisi>(SifatDisposisi.BIASA);

    // Print state
    const [isPrintModalOpen, setPrintModalOpen] = useState(false);
    const [isDisposisiPrintModalOpen, setDisposisiPrintModalOpen] = useState(false);
    
    // Type guards
    const isSuratMasuk = surat.tipe === TipeSurat.MASUK;
    const suratMasuk = isSuratMasuk ? (surat as TSuratMasuk) : null;
    const suratKeluar = !isSuratMasuk ? (surat as TSuratKeluar) : null;
    
    const relatedSurat = useMemo(() => {
        if (!surat.relatedSuratIds || surat.relatedSuratIds.length === 0) return [];
        return allSurat.filter(s => surat.relatedSuratIds?.includes(s.id));
    }, [surat, allSurat]);
    
    // RBAC Logic for Disposition
    const canCreateDisposisi = useMemo(() => {
        if (!isSuratMasuk) return false;
        const allowedRoles = [
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.PIMPINAN,
            UserRole.MANAJERIAL,
        ];
        return allowedRoles.includes(currentUser.role);
    }, [currentUser.role, isSuratMasuk]);

    const disposableUsers = useMemo(() => {
        if (!canCreateDisposisi) return [];

        const usersInSameUnit = allUsers.filter(u => 
            u.unitKerjaId === currentUser.unitKerjaId && u.id !== currentUser.id
        );

        if (currentUser.role === UserRole.MANAJERIAL) {
            return usersInSameUnit.filter(u => 
                u.role === UserRole.MANAJERIAL || u.role === UserRole.STAF
            );
        }
        
        // Super Admin, Admin, and Pimpinan can dispose to anyone in their unit
        return usersInSameUnit;
    }, [allUsers, currentUser, canCreateDisposisi]);

    const handleDisposisiSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (disposisiCatatan && disposisiTujuanId) {
            onAddDisposisi(surat.id, disposisiCatatan, disposisiTujuanId, disposisiSifat);
            setDisposisiCatatan('');
            setDisposisiTujuanId('');
            setDisposisiSifat(SifatDisposisi.BIASA);
            setDisposisiFormVisible(false);
        }
    };
    
    const handleSign = () => {
        if (appSettings.signatureMethod === SignatureMethod.GAMBAR) {
            // In a real app, this would open a signature pad modal.
            // For this mock, we'll use a placeholder signature.
            const mockSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACgCAMAAACow3svAAAAbFBMVEUAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkKCgoLCwsMDAwNDQ0ODg4PDw8QEBARERESEhITExMUFBQVFRUWFhYXFxcYGBgZGRkaGhobGxscHBwdHR0eHh4fHx8gICAhISEjIyMlJSUqKiotLS0AAAC5358xAAADQklEQVR4nO3a6XKqQBBA0bZpGABVVEHw/k/sqoVCAwRMCG3V7M65n/2Y2cyk7D0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAy2b58bMvX+LXUfC8L2/P5YfN+b4Uft/5lV++58/292b/vj5v+65/16/V2t/4/F8u++Z9r//3l/a3fr7e71f5lX7cRfr/evN/vV/uVft1F+P16836/2q/06y7C79eb9/vV/uVfxxA+AogIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiIiiIiIAiI-1d/V/1+2UX4/Xrzfr/ar/zrdsLv15v3+9V+5V+3UX4/Xrzfr/ar/TrLsLv15v3+9V+5V9/fwP/b/QCAAAAAElFTSuQmCC';
            onTambahTandaTangan(surat.id, mockSignature);
        } else { // QR Code method
            onTambahTandaTangan(surat.id);
        }
    }
    
    const TabButton: React.FC<{tabId: string; label: string}> = ({ tabId, label}) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`py-2 px-4 text-sm font-medium rounded-t-lg ${activeTab === tabId ? 'bg-white border-slate-200 border-b-0 border-l border-r border-t text-sky-600' : 'text-slate-500 hover:text-slate-700 bg-slate-100'}`}
        >
            {label}
        </button>
    )

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Detail Surat" size="4xl">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="p-4 bg-slate-50 rounded-lg border">
                        <h3 className="text-lg font-bold text-slate-800">{surat.perihal}</h3>
                        <p className="text-sm text-slate-500">Nomor: {surat.nomorSurat}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                             <button onClick={() => setPrintModalOpen(true)} className="flex items-center bg-slate-600 text-white px-3 py-1.5 rounded-md hover:bg-slate-700 text-sm">
                                <PrinterIcon className="w-4 h-4 mr-2" /> Cetak Surat
                            </button>
                             {isSuratMasuk && (
                                 <button onClick={() => setDisposisiPrintModalOpen(true)} className="flex items-center bg-slate-600 text-white px-3 py-1.5 rounded-md hover:bg-slate-700 text-sm">
                                     <PrinterIcon className="w-4 h-4 mr-2" /> Cetak Lembar Disposisi
                                 </button>
                             )}
                            <button onClick={onArchive} className="flex items-center bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 text-sm">
                                <ArchiveIcon className="w-4 h-4 mr-2" /> Arsipkan
                            </button>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                     <div className="border-b border-slate-200 -mb-px">
                        <nav className="flex space-x-2">
                            <TabButton tabId="detail" label="Detail Informasi" />
                            {isSuratMasuk && <TabButton tabId="disposisi" label={`Riwayat Disposisi (${suratMasuk?.disposisi.length || 0})`} />}
                            {relatedSurat.length > 0 && <TabButton tabId="terkait" label="Surat Terkait" />}
                        </nav>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-b-lg rounded-tr-lg bg-white">
                        {/* Detail Tab */}
                        {activeTab === 'detail' && (
                            <div className="space-y-6">
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b"><td className="font-semibold p-2 w-1/4">Tanggal Surat</td><td className="p-2">{new Date(surat.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'})}</td></tr>
                                        {isSuratMasuk && <tr className="border-b"><td className="font-semibold p-2">Tanggal Diterima</td><td className="p-2">{new Date(suratMasuk!.tanggalDiterima).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'})}</td></tr>}
                                        <tr className="border-b"><td className="font-semibold p-2">{isSuratMasuk ? 'Pengirim' : 'Tujuan'}</td><td className="p-2">{isSuratMasuk ? surat.pengirim : surat.tujuan}</td></tr>
                                        <tr className="border-b"><td className="font-semibold p-2">Sifat</td><td className="p-2">{getSifatBadge(surat.sifat)}</td></tr>
                                        <tr className="border-b"><td className="font-semibold p-2">Kategori</td><td className="p-2">{kategoriList.find(k => k.id === surat.kategoriId)?.nama || 'Tidak ada kategori'}</td></tr>
                                    </tbody>
                                </table>

                                {surat.isi && (
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-2">Isi Surat:</h4>
                                        <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-md whitespace-pre-wrap">{surat.isi}</p>
                                    </div>
                                )}
                                
                                {suratKeluar && (
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-2">Tanda Tangan Digital</h4>
                                        {suratKeluar.tandaTangan ? (
                                             <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-4">
                                                <CheckCircleIcon className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-emerald-800">Telah ditandatangani secara digital oleh:</p>
                                                    <p className="text-sm text-emerald-700">{suratKeluar.tandaTangan.namaPenandaTangan} ({suratKeluar.tandaTangan.jabatanPenandaTangan})</p>
                                                    <p className="text-xs text-slate-500 mt-1">Pada: {new Date(suratKeluar.tandaTangan.timestamp).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-4">
                                                 <ShieldExclamationIcon className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                                 <div>
                                                     <p className="font-semibold text-amber-800">Surat belum ditandatangani.</p>
                                                     {currentUser.role === 'Pimpinan' && (
                                                         <button onClick={handleSign} className="mt-2 text-sm bg-sky-600 text-white px-3 py-1 rounded hover:bg-sky-700">
                                                            Tandatangani Sekarang
                                                         </button>
                                                     )}
                                                 </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Disposisi Tab */}
                        {activeTab === 'disposisi' && suratMasuk && (
                             <div className="space-y-4">
                                {suratMasuk.disposisi.map(d => (
                                     <div key={d.id} className="p-3 bg-slate-50 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm"><span className="font-semibold">{d.pembuat.nama}</span> mendisposisikan kepada <span className="font-semibold">{d.tujuan.nama}</span></p>
                                                <p className="text-xs text-slate-500">{new Date(d.tanggalDisposisi).toLocaleString('id-ID')}</p>
                                            </div>
                                            {getStatusDisposisiBadge(d.status)}
                                        </div>
                                        <p className="mt-2 text-sm text-slate-700 pl-4 border-l-2 border-slate-300">"{d.catatan}"</p>
                                         {d.tujuan.id === currentUser.id && d.status === StatusDisposisi.PENDING && (
                                             <div className="mt-2 flex items-center gap-2">
                                                 <button onClick={() => onUpdateDisposisiStatus(surat.id, d.id, StatusDisposisi.DIPROSES)} className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded hover:bg-sky-200">Tandai Diproses</button>
                                                 <button onClick={() => onUpdateDisposisiStatus(surat.id, d.id, StatusDisposisi.SELESAI)} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded hover:bg-emerald-200">Tandai Selesai</button>
                                             </div>
                                         )}
                                    </div>
                                ))}

                                {suratMasuk.disposisi.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Belum ada riwayat disposisi.</p>}
                                
                                {canCreateDisposisi && (
                                    <>
                                        <button onClick={() => setDisposisiFormVisible(!isDisposisiFormVisible)} className="text-sm font-medium text-sky-600 hover:text-sky-800">
                                            {isDisposisiFormVisible ? 'Tutup Form Disposisi' : '+ Buat Disposisi Baru'}
                                        </button>

                                        {isDisposisiFormVisible && (
                                             <form onSubmit={handleDisposisiSubmit} className="p-4 border rounded-lg bg-slate-50 space-y-3">
                                                <h4 className="font-semibold">Formulir Disposisi</h4>
                                                <div>
                                                    <label className="text-sm font-medium">Tujuan</label>
                                                    <select value={disposisiTujuanId} onChange={e => setDisposisiTujuanId(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                                                        <option value="">Pilih Tujuan...</option>
                                                        {disposableUsers.map(u => <option key={u.id} value={u.id}>{u.nama} - {u.jabatan}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Catatan / Instruksi</label>
                                                    <textarea value={disposisiCatatan} onChange={e => setDisposisiCatatan(e.target.value)} required rows={3} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"></textarea>
                                                </div>
                                                 <div>
                                                    <label className="text-sm font-medium">Sifat</label>
                                                    <select value={disposisiSifat} onChange={e => setDisposisiSifat(e.target.value as SifatDisposisi)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                                                        {Object.values(SifatDisposisi).map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700">Kirim Disposisi</button>
                                            </form>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        
                        {/* Terkait Tab */}
                        {activeTab === 'terkait' && (
                            <div>
                                {relatedSurat.map(s => (
                                    <div key={s.id} className="p-3 border-b last:border-b-0">
                                        <p className="font-semibold">{s.perihal}</p>
                                        <p className="text-sm text-slate-500">{s.nomorSurat} ({s.tipe === TipeSurat.MASUK ? 'Masuk' : 'Keluar'})</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
            
            {isPrintModalOpen && (
                <SuratPrintModal isOpen={isPrintModalOpen} onClose={() => setPrintModalOpen(false)} surat={surat} kopSuratSettings={kopSuratSettings} unitKerjaList={unitKerjaList} />
            )}
             {isDisposisiPrintModalOpen && isSuratMasuk && (
                <LembarDisposisiPrintModal isOpen={isDisposisiPrintModalOpen} onClose={() => setDisposisiPrintModalOpen(false)} surat={suratMasuk!} currentUser={currentUser} kopSuratSettings={kopSuratSettings} unitKerjaList={unitKerjaList} />
            )}
        </>
    );
};

export default SuratDetailModal;