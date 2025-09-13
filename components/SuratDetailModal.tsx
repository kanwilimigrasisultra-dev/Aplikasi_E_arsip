import React, { useState } from 'react';
import { AnySurat, SuratMasuk, SuratKeluar, TipeSurat, KategoriSurat, User, SifatDisposisi, StatusDisposisi, KopSuratSettings, AppSettings, UnitKerja, SignatureMethod, MasalahUtama, KlasifikasiSurat } from '../types';
import Modal from './Modal';
import { ArchiveIcon, CheckCircleIcon, ClockIcon, LinkIcon, PencilAltIcon, PlusIcon, PrinterIcon, SparklesIcon } from './icons';
import SuratPrintModal from './SuratPrintModal';
import LembarDisposisiPrintModal from './LembarDisposisiPrintModal';
// Note: In a real app, you would use a proper signature pad library
import SignaturePad from 'react-signature-canvas';


interface SuratDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: AnySurat;
  kategoriList: KategoriSurat[];
  masalahUtamaList?: MasalahUtama[];
  klasifikasiList?: KlasifikasiSurat[];
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
  onReplyWithAI: (surat: SuratMasuk) => void;
}

const SuratDetailModal: React.FC<SuratDetailModalProps> = (props) => {
    const { isOpen, onClose, surat } = props;
    const [activeTab, setActiveTab] = useState('detail');
    const [isPrintModalOpen, setPrintModalOpen] = useState(false);
    const [isDisposisiPrintModalOpen, setDisposisiPrintModalOpen] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    
    let sigPad = React.useRef<SignaturePad>(null);

    if (!isOpen) return null;

    const isSuratMasuk = surat.tipe === TipeSurat.MASUK;
    const kategori = props.kategoriList.find(k => k.id === surat.kategoriId)?.nama || 'N/A';
    
    const handleSign = () => {
        if(sigPad.current) {
            const dataUrl = sigPad.current.toDataURL();
            props.onTambahTandaTangan(surat.id, dataUrl);
            setIsSigning(false);
        }
    }
    
    const handleSignWithQR = () => {
         props.onTambahTandaTangan(surat.id); // No data URL needed for QR
         setIsSigning(false);
    }
    
    const renderDetailInfo = () => {
        const suratKeluar = surat as SuratKeluar;
        const suratAsli = suratKeluar.suratAsliId ? props.allSurat.find(s => s.id === suratKeluar.suratAsliId) as SuratMasuk : null;

        const masalahUtama = surat.tipe === TipeSurat.KELUAR ? props.masalahUtamaList?.find(m => m.id === surat.masalahUtamaId) : null;
        const klasifikasi = surat.tipe === TipeSurat.KELUAR ? props.klasifikasiList?.find(k => k.id === surat.klasifikasiId) : null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <InfoItem label="Nomor Surat" value={surat.nomorSurat} />
                <InfoItem label="Kategori" value={kategori} />
                <InfoItem label="Tanggal Surat" value={new Date(surat.tanggal).toLocaleDateString('id-ID')} />
                <InfoItem label="Sifat" value={surat.sifat} />
                <div className="md:col-span-2">
                    <InfoItem label="Perihal" value={surat.perihal} />
                </div>
                {isSuratMasuk ? (
                    <>
                        <InfoItem label="Pengirim" value={surat.pengirim} />
                        <InfoItem label="Tanggal Diterima" value={new Date(surat.tanggalDiterima).toLocaleDateString('id-ID')} />
                    </>
                ) : (
                    <>
                        <InfoItem label="Tujuan" value={surat.tujuan} />
                        <InfoItem label="Pembuat" value={surat.pembuat.nama} />
                        <InfoItem label="Jenis Surat" value={surat.jenisSuratKeluar} />
                        <InfoItem label="Masalah Utama" value={`${masalahUtama?.kode || ''} - ${masalahUtama?.deskripsi || 'N/A'}`} />
                        <div className="md:col-span-2">
                          <InfoItem label="Klasifikasi Arsip" value={`${klasifikasi?.kode || ''} - ${klasifikasi?.deskripsi || 'N/A'}`} />
                        </div>
                        <div className="md:col-span-2">
                            <InfoItem label="Isi Surat (Ringkasan)" value={surat.ringkasan} />
                        </div>
                        {suratAsli && (
                             <div className="md:col-span-2 mt-2 p-3 bg-slate-50 border rounded-md">
                                <p className="text-xs font-semibold text-slate-600 flex items-center">
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Surat ini adalah balasan untuk:
                                </p>
                                <p className="text-sm text-slate-800 pl-6 mt-1">
                                    <span className="font-medium">{suratAsli.nomorSurat}</span> - {suratAsli.perihal}
                                </p>
                             </div>
                        )}
                    </>
                )}
            </div>
        );
    }
    
    const renderDisposisi = () => {
        if (!isSuratMasuk) return null;
        return <DisposisiSection {...props} />;
    }

    const renderTandaTangan = () => {
        if (isSuratMasuk) return null;
        const s = surat as SuratKeluar;
        const useQR = props.appSettings.signatureMethod === SignatureMethod.QR_CODE;

        if (s.tandaTangan) {
            return (
                 <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto" />
                    <p className="mt-2 font-semibold text-emerald-800">Surat Telah Ditandatangani</p>
                    <p className="text-sm text-emerald-700">Dokumen ini telah sah secara digital.</p>
                </div>
            )
        }
        
        return (
            <div>
                 <button onClick={() => setIsSigning(true)} className="w-full flex items-center justify-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                    <PencilAltIcon className="w-5 h-5 mr-2" />
                    {useQR ? 'Sahkan dengan QR Code' : 'Tambahkan Tanda Tangan'}
                </button>
                {isSigning && (
                    <div className="mt-4 border-t pt-4">
                        {useQR ? (
                            <div className="text-center">
                                <p className="text-sm text-slate-600 mb-4">Sistem akan menghasilkan QR code unik pada dokumen cetak untuk verifikasi keaslian surat.</p>
                                <button onClick={handleSignWithQR} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">Konfirmasi & Sahkan</button>
                            </div>
                        ) : (
                             <>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Goreskan Tanda Tangan:</label>
                                <div className="border rounded-lg overflow-hidden">
                                     <SignaturePad ref={sigPad} canvasProps={{className: 'w-full h-48'}} />
                                </div>
                                <div className="mt-2 flex justify-end space-x-2">
                                    <button onClick={() => sigPad.current?.clear()} className="text-sm text-slate-600 hover:text-slate-800">Bersihkan</button>
                                    <button onClick={handleSign} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 text-sm">Simpan Tanda Tangan</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detail Surat" size="2xl">
            <div className="space-y-6">
                <div className="flex justify-end space-x-2">
                    <button onClick={props.onArchive} className="flex items-center bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-md hover:bg-emerald-200 text-sm font-medium">
                        <ArchiveIcon className="w-4 h-4 mr-2" /> Arsipkan
                    </button>
                     <button onClick={() => setPrintModalOpen(true)} className="flex items-center bg-slate-100 text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-200 text-sm font-medium">
                        <PrinterIcon className="w-4 h-4 mr-2" /> Cetak Surat
                    </button>
                    {isSuratMasuk && (
                         <button onClick={() => setDisposisiPrintModalOpen(true)} className="flex items-center bg-slate-100 text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-200 text-sm font-medium">
                            <PrinterIcon className="w-4 h-4 mr-2" /> Cetak Disposisi
                        </button>
                    )}
                    {isSuratMasuk && (
                        <button onClick={() => {
                            props.onReplyWithAI(surat as SuratMasuk);
                            onClose();
                        }} className="flex items-center bg-slate-700 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-sm font-medium">
                            <SparklesIcon className="w-4 h-4 mr-2" /> Balas dengan AI
                        </button>
                    )}
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <TabButton label="Detail Surat" isActive={activeTab === 'detail'} onClick={() => setActiveTab('detail')} />
                        {isSuratMasuk && <TabButton label="Disposisi" isActive={activeTab === 'disposisi'} onClick={() => setActiveTab('disposisi')} />}
                        {!isSuratMasuk && <TabButton label="Tanda Tangan" isActive={activeTab === 'ttd'} onClick={() => setActiveTab('ttd')} />}
                    </nav>
                </div>
                
                <div className="pt-2">
                    {activeTab === 'detail' && renderDetailInfo()}
                    {activeTab === 'disposisi' && renderDisposisi()}
                    {activeTab === 'ttd' && renderTandaTangan()}
                </div>
            </div>
            {isPrintModalOpen && <SuratPrintModal isOpen={isPrintModalOpen} onClose={() => setPrintModalOpen(false)} surat={surat} kopSuratSettings={props.kopSuratSettings} unitKerjaList={props.unitKerjaList} />}
            {isDisposisiPrintModalOpen && isSuratMasuk && <LembarDisposisiPrintModal isOpen={isDisposisiPrintModalOpen} onClose={() => setDisposisiPrintModalOpen(false)} surat={surat as SuratMasuk} currentUser={props.currentUser} kopSuratSettings={props.kopSuratSettings} unitKerjaList={props.unitKerjaList} />}
        </Modal>
    );
};

const DisposisiSection: React.FC<SuratDetailModalProps> = ({ surat, allUsers, currentUser, onAddDisposisi, onUpdateDisposisiStatus }) => {
    const [showForm, setShowForm] = useState(false);
    const [catatan, setCatatan] = useState('');
    const [tujuanId, setTujuanId] = useState('');
    const [sifat, setSifat] = useState<SifatDisposisi>(SifatDisposisi.BIASA);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(catatan && tujuanId) {
            onAddDisposisi(surat.id, catatan, tujuanId, sifat);
            setShowForm(false);
            setCatatan('');
        }
    }
    
    const disposisiList = (surat as SuratMasuk).disposisi;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <h4 className="font-semibold text-slate-800">Riwayat Disposisi</h4>
                 <button onClick={() => setShowForm(!showForm)} className="flex items-center bg-slate-700 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-sm font-medium">
                    <PlusIcon className="w-4 h-4 mr-2" /> {showForm ? 'Batal' : 'Tambah Disposisi'}
                </button>
            </div>
           
            {showForm && (
                <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border rounded-lg space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tujuan Disposisi</label>
                        <select value={tujuanId} onChange={e => setTujuanId(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <option value="">Pilih Pengguna</option>
                            {allUsers.filter(u => u.id !== currentUser.id).map(u => <option key={u.id} value={u.id}>{u.nama} ({u.jabatan})</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Sifat</label>
                        <select value={sifat} onChange={e => setSifat(e.target.value as SifatDisposisi)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            {Object.values(SifatDisposisi).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Instruksi / Catatan</label>
                        <textarea value={catatan} onChange={e => setCatatan(e.target.value)} required rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                    </div>
                    <div className="text-right">
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">Kirim Disposisi</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {disposisiList.length > 0 ? disposisiList.map(d => (
                    <div key={d.id} className="p-4 border rounded-lg bg-white">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-slate-800">Dari: {d.pembuat.nama}</p>
                                <p className="text-sm text-slate-600">Kepada: {d.tujuan.nama}</p>
                                <p className="text-xs text-slate-400 mt-1">{new Date(d.tanggal).toLocaleString('id-ID')}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${d.sifat === SifatDisposisi.SEGERA ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>{d.sifat}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 bg-slate-50 p-2 rounded">{d.catatan}</p>
                        {d.tujuan.id === currentUser.id && d.status === StatusDisposisi.DIPROSES && (
                             <div className="mt-3 border-t pt-3 flex items-center justify-end space-x-2">
                                <span className="text-sm font-medium text-slate-700">Ubah Status:</span>
                                 <button onClick={() => onUpdateDisposisiStatus(surat.id, d.id, StatusDisposisi.SELESAI)} className="text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md hover:bg-emerald-200">Selesai</button>
                                 <button onClick={() => onUpdateDisposisiStatus(surat.id, d.id, StatusDisposisi.DITOLAK)} className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200">Tolak</button>
                            </div>
                        )}
                         <div className="mt-3 border-t pt-2">
                            <p className="text-xs font-semibold text-slate-500">Status: <span className="font-bold text-slate-800">{d.status}</span></p>
                        </div>
                    </div>
                )) : <p className="text-center text-sm text-slate-500 p-4">Belum ada disposisi.</p>}
            </div>
        </div>
    )
}

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-slate-600">{value}</p>
    </div>
);

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive ? 'border-slate-700 text-slate-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
    >
        {label}
    </button>
);


export default SuratDetailModal;