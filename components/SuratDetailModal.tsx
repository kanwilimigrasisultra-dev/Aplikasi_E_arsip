import React, { useState } from 'react';
import { AnySurat, SuratMasuk, SuratKeluar, TipeSurat, KategoriSurat, User, SifatDisposisi, StatusDisposisi, KopSuratSettings, AppSettings, UnitKerja, SignatureMethod, MasalahUtama, KlasifikasiSurat, ApprovalStep, Tugas, NotaDinas } from '../types';
import Modal from './Modal';
import { ArchiveIcon, CheckCircleIcon, ClockIcon, LinkIcon, PencilAltIcon, PlusIcon, PrinterIcon, SparklesIcon, PaperClipIcon, UsersIcon, TrashIcon, ShieldCheckIcon, ClipboardListIcon } from './icons';
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
  onKirimUntukPersetujuan?: (suratId: string) => void;
  onPersetujuan?: (suratId: string, stepId: string, decision: 'Disetujui' | 'Ditolak', notes: string) => void;
  onReplyWithAI: (surat: SuratMasuk) => void;
  onAddKomentar: (suratId: string, teks: string) => void;
  onAddTask: (tugas: Omit<Tugas, 'id'>) => void;
}

const TTESimulationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
    const [step, setStep] = useState(1);

    React.useEffect(() => {
        if (isOpen) {
            setStep(1);
            setTimeout(() => setStep(2), 2000);
            setTimeout(() => {
                setStep(3);
                onConfirm(); // Simulate successful signing
            }, 4000);
            setTimeout(() => onClose(), 5500); // Close modal after success message
        }
    }, [isOpen, onConfirm, onClose]);

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <><svg className="animate-spin h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-3">Mengarahkan ke layanan TTE tersertifikasi...</p></>;
            case 2:
                return <><ClockIcon className="h-8 w-8 text-amber-500" /><p className="mt-3">Menunggu tanda tangan Anda...</p></>;
            case 3:
                return <><CheckCircleIcon className="h-8 w-8 text-emerald-500" /><p className="mt-3">Dokumen berhasil disahkan secara digital!</p></>;
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Simulasi Tanda Tangan Elektronik" size="sm">
            <div className="flex flex-col items-center justify-center h-32 text-slate-600">
                {renderStepContent()}
            </div>
        </Modal>
    );
};


const SuratDetailModal: React.FC<SuratDetailModalProps> = (props) => {
    const { isOpen, onClose, surat } = props;
    const [activeTab, setActiveTab] = useState('detail');
    const [isPrintModalOpen, setPrintModalOpen] = useState(false);
    const [isDisposisiPrintModalOpen, setDisposisiPrintModalOpen] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [isTTEModalOpen, setTTEModalOpen] = useState(false);
    
    let sigPad = React.useRef<SignaturePad>(null);

    if (!isOpen) return null;

    const isSuratMasuk = surat.tipe === TipeSurat.MASUK;
    const isSuratKeluar = surat.tipe === TipeSurat.KELUAR;
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
        return (
            <div className="space-y-4">
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
                    ) : null}
                    {isSuratKeluar ? (
                        <>
                            <InfoItem label="Tujuan" value={surat.tujuan} />
                            <InfoItem label="Pembuat" value={surat.pembuat.nama} />
                            <InfoItem label="Jenis Surat" value={surat.jenisSuratKeluar} />
                             <div className="md:col-span-2">
                                <InfoItem label="Klasifikasi Arsip" value={`${props.klasifikasiList?.find(k => k.id === surat.klasifikasiId)?.kode || ''} - ${props.klasifikasiList?.find(k => k.id === surat.klasifikasiId)?.deskripsi || 'N/A'}`} />
                            </div>
                            <div className="md:col-span-2">
                                <InfoItem label="Isi Surat (Ringkasan)" value={surat.ringkasan} />
                            </div>
                            {surat.suratAsliId && (() => {
                                const suratAsli = props.allSurat.find(s => s.id === surat.suratAsliId) as SuratMasuk;
                                return suratAsli ? (
                                    <div className="md:col-span-2 mt-2 p-3 bg-slate-50 border rounded-md">
                                        <p className="text-xs font-semibold text-slate-600 flex items-center">
                                            <LinkIcon className="w-4 h-4 mr-2" />
                                            Surat ini adalah balasan untuk:
                                        </p>
                                        <p className="text-sm text-slate-800 pl-6 mt-1">
                                            <span className="font-medium">{suratAsli.nomorSurat}</span> - {suratAsli.perihal}
                                        </p>
                                    </div>
                                ) : null;
                            })()}
                        </>
                    ) : null}
                    {surat.tipe === TipeSurat.NOTA_DINAS && (
                         <>
                            <InfoItem label="Tujuan" value={surat.tujuanUserIds.map(id => props.allUsers.find(u => u.id === id)?.nama).filter(Boolean).join(', ')} />
                            <InfoItem label="Pembuat" value={surat.pembuat.nama} />
                             <div className="md:col-span-2">
                                <InfoItem label="Isi Nota Dinas (Ringkasan)" value={surat.ringkasan} />
                            </div>
                        </>
                    )}
                </div>
                 {surat.attachments && surat.attachments.length > 0 && (
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-slate-800 text-sm mb-2">Lampiran</h4>
                        <div className="space-y-2">
                        {surat.attachments.map(att => (
                            <a href={att.content} download={att.name} key={att.id} className="flex items-center text-sm p-2 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">
                                <PaperClipIcon className="w-4 h-4 mr-2 flex-shrink-0 text-slate-500"/>
                                <span className="truncate text-slate-700" title={att.name}>{att.name}</span>
                                <span className="ml-2 text-slate-500 flex-shrink-0">({(att.size / 1024).toFixed(1)} KB)</span>
                            </a>
                        ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    const renderDisposisi = () => {
        if (!isSuratMasuk) return null;
        return <DisposisiSection {...props} />;
    }

    const renderApprovalAndHistory = () => {
        if (!isSuratKeluar) return null;
        return <ApprovalAndHistorySection {...props} />;
    }

    const renderTandaTangan = () => {
        if (!isSuratKeluar) return null;
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
            <div className="space-y-4">
                <button 
                    onClick={() => setTTEModalOpen(true)} 
                    className="w-full flex items-center justify-center bg-sky-600 text-white px-4 py-3 rounded-lg hover:bg-sky-700 transition-colors shadow-lg font-semibold"
                >
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    Sahkan dengan TTE Tersertifikasi (Simulasi)
                </button>

                 <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300" /></div>
                    <div className="relative flex justify-center"><span className="px-2 bg-white text-sm text-gray-500">Atau gunakan metode lain</span></div>
                </div>

                 <button onClick={() => setIsSigning(true)} className="w-full flex items-center justify-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                    <PencilAltIcon className="w-5 h-5 mr-2" />
                    {useQR ? 'Sahkan dengan QR Code Internal' : 'Tambahkan Tanda Tangan Gambar'}
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

    const renderActionButtons = () => {
        const buttons = [];
        
        if (isSuratKeluar && (surat.status === 'Draf' || surat.status === 'Revisi') && surat.pembuat.id === props.currentUser.id && props.onKirimUntukPersetujuan) {
            buttons.push(
                 <button key="kirim" onClick={() => props.onKirimUntukPersetujuan!(surat.id)} className="flex items-center bg-slate-700 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-sm font-medium">
                    <SparklesIcon className="w-4 h-4 mr-2" /> Kirim untuk Persetujuan
                </button>
            );
        }

        buttons.push(
            <button key="arsip" onClick={props.onArchive} className="flex items-center bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-md hover:bg-emerald-200 text-sm font-medium">
                <ArchiveIcon className="w-4 h-4 mr-2" /> Arsipkan
            </button>,
             <button key="print" onClick={() => setPrintModalOpen(true)} className="flex items-center bg-slate-100 text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-200 text-sm font-medium">
                <PrinterIcon className="w-4 h-4 mr-2" /> Cetak Surat
            </button>
        );

        if (isSuratMasuk) {
             buttons.push(
                 <button key="print-disposisi" onClick={() => setDisposisiPrintModalOpen(true)} className="flex items-center bg-slate-100 text-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-200 text-sm font-medium">
                    <PrinterIcon className="w-4 h-4 mr-2" /> Cetak Disposisi
                </button>,
                <button key="reply" onClick={() => {
                    props.onReplyWithAI(surat as SuratMasuk);
                    onClose();
                }} className="flex items-center bg-slate-700 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-sm font-medium">
                    <SparklesIcon className="w-4 h-4 mr-2" /> Balas dengan AI
                </button>
            );
        }

        return <div className="flex justify-end space-x-2">{buttons}</div>;
    }


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Detail Surat" size="3xl">
                <div className="space-y-6">
                    {renderActionButtons()}

                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <TabButton label="Detail Surat" isActive={activeTab === 'detail'} onClick={() => setActiveTab('detail')} />
                            {isSuratMasuk && <TabButton label="Disposisi" isActive={activeTab === 'disposisi'} onClick={() => setActiveTab('disposisi')} />}
                            {isSuratKeluar && <TabButton label={`Riwayat & Persetujuan (v${surat.version})`} isActive={activeTab === 'approval'} onClick={() => setActiveTab('approval')} />}
                            {isSuratKeluar && <TabButton label="Tanda Tangan" isActive={activeTab === 'ttd'} onClick={() => setActiveTab('ttd')} disabled={surat.status !== 'Disetujui'} />}
                            <TabButton label="Tugas Terkait" isActive={activeTab === 'tugas'} onClick={() => setActiveTab('tugas')} />
                            <TabButton label="Komentar" isActive={activeTab === 'komentar'} onClick={() => setActiveTab('komentar')} />
                        </nav>
                    </div>
                    
                    <div className="pt-2">
                        {activeTab === 'detail' && renderDetailInfo()}
                        {activeTab === 'disposisi' && isSuratMasuk && <DisposisiSection {...props} />}
                        {activeTab === 'approval' && isSuratKeluar && <ApprovalAndHistorySection {...props} />}
                        {activeTab === 'ttd' && isSuratKeluar && renderTandaTangan()}
                        {activeTab === 'tugas' && <TugasSection {...props} />}
                        {activeTab === 'komentar' && <KomentarSection {...props} />}
                    </div>
                </div>
            </Modal>
            {isPrintModalOpen && <SuratPrintModal isOpen={isPrintModalOpen} onClose={() => setPrintModalOpen(false)} surat={surat} kopSuratSettings={props.kopSuratSettings} unitKerjaList={props.unitKerjaList} currentUser={props.currentUser} />}
            {isDisposisiPrintModalOpen && isSuratMasuk && <LembarDisposisiPrintModal isOpen={isDisposisiPrintModalOpen} onClose={() => setDisposisiPrintModalOpen(false)} surat={surat as SuratMasuk} currentUser={props.currentUser} kopSuratSettings={props.kopSuratSettings} unitKerjaList={props.unitKerjaList} />}
            <TTESimulationModal isOpen={isTTEModalOpen} onClose={() => setTTEModalOpen(false)} onConfirm={() => props.onTambahTandaTangan(surat.id, 'SIGNED_WITH_TTE')} />
        </>
    );
};

// ... (Rest of the components: DisposisiSection, ApprovalAndHistorySection, etc. remain unchanged)

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

const ApprovalAndHistorySection: React.FC<SuratDetailModalProps> = ({ surat, currentUser, onPersetujuan }) => {
    const s = surat as SuratKeluar;
    const [notes, setNotes] = useState('');

    const nextApproverStep = s.approvalChain.find(step => step.status === 'Menunggu');
    const isCurrentUserApprover = nextApproverStep?.approver.id === currentUser.id;
    
    const handleDecision = (decision: 'Disetujui' | 'Ditolak') => {
        if (!onPersetujuan || !nextApproverStep) return;
        if (decision === 'Ditolak' && !notes.trim()) {
            alert('Catatan wajib diisi jika menolak persetujuan.');
            return;
        }
        onPersetujuan(s.id, nextApproverStep.id, decision, notes);
        setNotes('');
    }

    const getStatusIcon = (status: ApprovalStep['status']) => {
        switch(status) {
            case 'Disetujui': return <div className="bg-emerald-500 rounded-full h-8 w-8 flex items-center justify-center ring-4 ring-emerald-100"><CheckCircleIcon className="h-5 w-5 text-white"/></div>;
            case 'Ditolak': return <div className="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center ring-4 ring-red-100"><TrashIcon className="h-5 w-5 text-white"/></div>;
            case 'Menunggu': return <div className="bg-sky-500 rounded-full h-8 w-8 flex items-center justify-center ring-4 ring-sky-100"><ClockIcon className="h-5 w-5 text-white"/></div>;
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-slate-800 mb-2">Alur Persetujuan</h4>
                <div className="flow-root">
                    <ul className="-mb-8">
                        {s.approvalChain.map((step, stepIdx) => (
                        <li key={step.id}>
                            <div className="relative pb-8">
                            {stepIdx !== s.approvalChain.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex items-start space-x-3">
                                {getStatusIcon(step.status)}
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm">
                                        <p className="font-semibold text-slate-800">{step.approver.nama}</p>
                                        <p className="text-slate-500">{step.approver.jabatan}</p>
                                    </div>
                                    {step.timestamp && (
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {new Date(step.timestamp).toLocaleString('id-ID')}
                                        </p>
                                    )}
                                    {step.notes && (
                                         <div className="mt-2 text-sm bg-slate-50 p-2 rounded-md border">
                                            <p className="text-slate-600">{step.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            </div>
                        </li>
                        ))}
                    </ul>
                </div>

                {isCurrentUserApprover && s.status === 'Menunggu Persetujuan' && (
                     <div className="mt-6 border-t pt-4">
                         <h4 className="font-semibold text-slate-800 mb-2">Tindakan Persetujuan</h4>
                         <div>
                            <label htmlFor="approval_notes" className="block text-sm font-medium text-slate-700">Catatan (Wajib jika menolak)</label>
                            <textarea
                                id="approval_notes"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                placeholder="Berikan alasan atau instruksi revisi..."
                            />
                        </div>
                        <div className="mt-2 flex justify-end space-x-2">
                             <button onClick={() => handleDecision('Ditolak')} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">
                                Tolak & Kembalikan
                            </button>
                            <button onClick={() => handleDecision('Disetujui')} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700">
                                Setujui & Lanjutkan
                            </button>
                        </div>
                     </div>
                )}
            </div>
             {s.history.length > 0 && (
                <div className="border-t pt-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Riwayat Versi</h4>
                     <ul className="space-y-1 text-sm list-disc list-inside text-slate-500">
                        {s.history.map((h, i) => (
                            <li key={i}>
                                <span className="font-semibold text-slate-700">Versi {h.version}:</span> Direvisi pada {h.tanggal ? new Date(h.tanggal).toLocaleDateString() : '-'}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

const KomentarSection: React.FC<SuratDetailModalProps> = ({ surat, onAddKomentar, currentUser }) => {
    const [teks, setTeks] = useState('');
    const sortedKomentar = [...surat.komentar].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (teks.trim()) {
            onAddKomentar(surat.id, teks.trim());
            setTeks('');
        }
    };

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">Komentar & Diskusi Internal</h4>
            <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                    <label htmlFor="komentar-teks" className="sr-only">Tambah Komentar</label>
                    <textarea
                        id="komentar-teks"
                        value={teks}
                        onChange={e => setTeks(e.target.value)}
                        rows={3}
                        placeholder="Tulis komentar atau pertanyaan di sini..."
                        className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
                <div className="text-right">
                    <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800">
                        Kirim Komentar
                    </button>
                </div>
            </form>
            <div className="space-y-4 pt-4 border-t max-h-64 overflow-y-auto pr-2">
                {sortedKomentar.length > 0 ? sortedKomentar.map(k => (
                    <div key={k.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-slate-600 font-bold">{k.user.nama.charAt(0)}</span>
                        </div>
                        <div className="flex-1 bg-slate-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-semibold text-slate-800">{k.user.nama}</p>
                                <p className="text-xs text-slate-500">{new Date(k.timestamp).toLocaleString('id-ID')}</p>
                            </div>
                            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{k.teks}</p>
                        </div>
                    </div>
                )) : <p className="text-center text-sm text-slate-500 p-4">Belum ada komentar.</p>}
            </div>
        </div>
    );
};

const TugasSection: React.FC<SuratDetailModalProps> = ({ surat, allUsers, currentUser, onAddTask }) => {
    const [showForm, setShowForm] = useState(false);
    const [deskripsi, setDeskripsi] = useState('');
    const [tujuanId, setTujuanId] = useState('');
    const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (deskripsi && tujuanId && tanggalJatuhTempo) {
            const tujuanUser = allUsers.find(u => u.id === tujuanId);
            if (!tujuanUser) return;
            const newTask: Omit<Tugas, 'id'> = {
                suratId: surat.id,
                deskripsi,
                ditugaskanKepada: tujuanUser,
                tanggalJatuhTempo,
                status: 'Belum Dikerjakan',
                dibuatOleh: currentUser,
            };
            onAddTask(newTask);
            setShowForm(false);
            setDeskripsi('');
            setTujuanId('');
            setTanggalJatuhTempo('');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-slate-800">Tugas Terkait Surat</h4>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center bg-slate-700 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-sm font-medium">
                    <PlusIcon className="w-4 h-4 mr-2" /> {showForm ? 'Batal' : 'Tambah Tugas'}
                </button>
            </div>
            {showForm && (
                <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border rounded-lg space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Deskripsi Tugas</label>
                        <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} required rows={2} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tugaskan Kepada</label>
                            <select value={tujuanId} onChange={e => setTujuanId(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                <option value="">Pilih Pengguna</option>
                                {allUsers.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tanggal Jatuh Tempo</label>
                            <input type="date" value={tanggalJatuhTempo} onChange={e => setTanggalJatuhTempo(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
                        </div>
                    </div>
                    <div className="text-right">
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">Simpan Tugas</button>
                    </div>
                </form>
            )}
            <div className="space-y-2">
                {surat.tugasTerkait.length > 0 ? surat.tugasTerkait.map(t => (
                    <div key={t.id} className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-medium">{t.deskripsi}</p>
                            <p className="text-xs text-slate-500">Untuk: {t.ditugaskanKepada.nama} | Jatuh Tempo: {new Date(t.tanggalJatuhTempo).toLocaleDateString()}</p>
                        </div>
                        <span className="text-xs font-semibold bg-slate-100 text-slate-800 px-2 py-1 rounded-full">{t.status}</span>
                    </div>
                )) : (
                    <p className="text-center text-sm text-slate-500 p-4">Belum ada tugas terkait surat ini.</p>
                )}
            </div>
        </div>
    );
};


const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="font-semibold text-slate-800">{label}</p>
        <div className="text-slate-600" dangerouslySetInnerHTML={{ __html: value }}></div>
    </div>
);

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void, disabled?: boolean }> = ({ label, isActive, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isActive ? 'border-slate-700 text-slate-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} disabled:text-gray-300 disabled:hover:border-transparent disabled:cursor-not-allowed`}
    >
        {label}
    </button>
);


export default SuratDetailModal;