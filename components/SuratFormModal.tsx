import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    AnySurat, TipeSurat, KategoriSurat, SifatSurat, UnitKerja, User,
    MasalahUtama, KlasifikasiSurat, PenomoranSettings, SuratMasuk,
    TemplateSurat, RincianBiaya, SuratKeluar, NotaDinas, Attachment, MasterBiaya, UserRole,
    PerjalananDinas as TPerjalananDinas,
    PengikutPerjalananDinas
} from '../types';
import Modal from './Modal';
import RichTextEditor from './RichTextEditor';
import { PaperClipIcon, XIcon, PlusIcon, TrashIcon } from './icons';

interface SuratFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (surat: any) => void;
    tipe: TipeSurat;
    kategoriList: KategoriSurat[];
    unitKerjaList: UnitKerja[];
    currentUser: User;
    suratToEdit?: AnySurat | null;
    masalahUtamaList?: MasalahUtama[];
    klasifikasiList?: KlasifikasiSurat[];
    penomoranSettings?: PenomoranSettings;
    allUsers?: User[];
    allSurat?: AnySurat[];
    allTemplates?: TemplateSurat[];
    masterBiayaList?: MasterBiaya[];
    perjalananDinasList?: TPerjalananDinas[];
    initialData?: (Partial<SuratKeluar> & { suratAsli?: SuratMasuk }) | null;
}

const getInitialState = (tipe: TipeSurat, currentUser: User, unitKerjaList: UnitKerja[], kategoriList: KategoriSurat[]) => ({
    // Common fields
    nomorSurat: '',
    tanggal: new Date().toISOString().split('T')[0],
    perihal: '',
    kategoriId: kategoriList[0]?.id || '',
    sifat: SifatSurat.BIASA,
    attachments: [] as Attachment[],
    // Surat Masuk
    pengirim: '',
    tanggalDiterima: new Date().toISOString().split('T')[0],
    // Surat Keluar
    tujuan: '',
    tujuanUnitKerjaId: '',
    jenisSuratKeluar: 'Biasa' as 'Biasa' | 'SK' | 'SPPD',
    masalahUtamaId: '',
    klasifikasiId: '',
    ringkasan: '',
    pembuat: currentUser,
    suratAsliId: '',
    // Nota Dinas
    tujuanUserIds: [] as string[],
    // Perjalanan Dinas (part of Surat Keluar)
    perjalananDinasData: {
        pejabatPembuatKomitmenId: '',
        penandatanganPihakLainId: '',
        pegawaiUtamaId: '',
        tingkatBiaya: 'B',
        maksudPerjalanan: '',
        alatAngkut: '',
        tempatBerangkat: unitKerjaList.find(u => u.id === currentUser.unitKerjaId)?.alamat || '',
        kotaTujuan: '',
        tanggalBerangkat: '',
        tanggalKembali: '',
        pengikut: [] as PengikutPerjalananDinas[],
        pembebananAnggaranInstansi: unitKerjaList.find(u => u.id === currentUser.unitKerjaId)?.nama || '',
        pembebananAnggaranAkun: '',
        dasarSuratTugasNomor: '',
        dasarSuratTugasTanggal: '',
        rincianBiaya: [] as Omit<RincianBiaya, 'id'>[],
    },
});

export const SuratFormModal: React.FC<SuratFormModalProps> = (props) => {
    const { isOpen, onClose, onSubmit, tipe, suratToEdit, initialData, ...lists } = props;
    const [formState, setFormState] = useState(getInitialState(tipe, props.currentUser, lists.unitKerjaList, lists.kategoriList));
    const [pengikutSearch, setPengikutSearch] = useState('');
    const [isPengikutDropdownOpen, setIsPengikutDropdownOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const baseState = getInitialState(tipe, props.currentUser, lists.unitKerjaList, lists.kategoriList);
            if (suratToEdit) {
                const s = suratToEdit;
                const baseSuratState = {
                    ...baseState,
                    nomorSurat: s.nomorSurat,
                    tanggal: new Date(s.tanggal).toISOString().split('T')[0],
                    perihal: s.perihal,
                    kategoriId: s.kategoriId,
                    sifat: s.sifat,
                    attachments: s.attachments || [],
                    pengirim: s.tipe === TipeSurat.MASUK ? s.pengirim : '',
                    tanggalDiterima: s.tipe === TipeSurat.MASUK ? new Date(s.tanggalDiterima).toISOString().split('T')[0] : baseState.tanggalDiterima,
                    tujuan: s.tipe === TipeSurat.KELUAR ? s.tujuan : '',
                    jenisSuratKeluar: s.tipe === TipeSurat.KELUAR ? s.jenisSuratKeluar : 'Biasa',
                    masalahUtamaId: s.tipe === TipeSurat.KELUAR ? s.masalahUtamaId : '',
                    klasifikasiId: s.tipe === TipeSurat.KELUAR ? s.klasifikasiId : '',
                    ringkasan: (s as SuratKeluar | NotaDinas).ringkasan || '',
                };

                if (s.tipe === TipeSurat.KELUAR && s.jenisSuratKeluar === 'SPPD' && s.perjalananDinasId && lists.perjalananDinasList) {
                    const pdData = lists.perjalananDinasList.find(pd => pd.id === s.perjalananDinasId);
                    if (pdData) {
                        setFormState({
                            ...baseSuratState,
                            perjalananDinasData: {
                                pejabatPembuatKomitmenId: pdData.pejabatPembuatKomitmenId || '',
                                penandatanganPihakLainId: pdData.penandatanganPihakLainId || '',
                                pegawaiUtamaId: pdData.pegawaiUtamaId,
                                tingkatBiaya: pdData.tingkatBiaya,
                                maksudPerjalanan: pdData.tujuanPerjalanan,
                                alatAngkut: pdData.alatAngkut,
                                tempatBerangkat: pdData.tempatBerangkat,
                                kotaTujuan: pdData.kotaTujuan,
                                tanggalBerangkat: new Date(pdData.tanggalBerangkat).toISOString().split('T')[0],
                                tanggalKembali: new Date(pdData.tanggalKembali).toISOString().split('T')[0],
                                pengikut: pdData.pengikut,
                                pembebananAnggaranInstansi: pdData.pembebananAnggaranInstansi,
                                pembebananAnggaranAkun: pdData.pembebananAnggaranAkun,
                                dasarSuratTugasNomor: pdData.dasarSuratTugasNomor || '',
                                dasarSuratTugasTanggal: pdData.dasarSuratTugasTanggal ? new Date(pdData.dasarSuratTugasTanggal).toISOString().split('T')[0] : '',
                                rincianBiaya: pdData.rincianBiaya,
                            }
                        });
                    }
                } else {
                    setFormState(baseSuratState);
                }
            } else if (initialData) { 
                setFormState(prev => ({
                    ...prev,
                    perihal: initialData.perihal || '',
                    suratAsliId: initialData.suratAsliId || '',
                    tujuan: initialData.tujuan || '',
                    ringkasan: `<p>Menanggapi surat dari ${initialData.suratAsli?.pengirim || ''} dengan nomor ${initialData.suratAsli?.nomorSurat || ''} perihal "${initialData.suratAsli?.perihal || ''}", dengan ini kami sampaikan bahwa...</p><p><br></p>`,
                }));
            }
             else {
                setFormState(baseState);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, suratToEdit, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleRichTextChange = (html: string) => {
        setFormState(prev => ({ ...prev, ringkasan: html }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newAttachment: Attachment = {
                        id: `att-${Date.now()}-${file.name}`,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: event.target?.result as string,
                    };
                    setFormState(prev => ({...prev, attachments: [...prev.attachments, newAttachment]}));
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    const removeAttachment = (id: string) => {
        setFormState(prev => ({...prev, attachments: prev.attachments.filter(att => att.id !== id)}));
    };

    const handleGenerateNomorSurat = () => {
        if (!lists.penomoranSettings || !props.allSurat || !lists.masalahUtamaList || !lists.klasifikasiList || !lists.unitKerjaList) {
            alert("Data untuk penomoran otomatis tidak lengkap.");
            return;
        }
        const { jenisSuratKeluar, masalahUtamaId, klasifikasiId, tanggal } = formState;
        if (!masalahUtamaId || !klasifikasiId) {
            alert("Harap pilih Masalah Utama dan Klasifikasi Arsip terlebih dahulu.");
            return;
        }
        const format = jenisSuratKeluar === 'SK' ? lists.penomoranSettings.sk : lists.penomoranSettings.biasa;
        const unitKerja = lists.unitKerjaList.find(u => u.id === props.currentUser.unitKerjaId);
        if (!unitKerja) return;
        let kodeUnitLengkap = unitKerja.kode;
        if (unitKerja.tipe === 'Cabang' && unitKerja.indukId) {
            const induk = lists.unitKerjaList.find(u => u.id === unitKerja.indukId);
            if (induk) kodeUnitLengkap = `${induk.kode}.${unitKerja.kode}`;
        }
        const klasifikasi = lists.klasifikasiList.find(k => k.id === klasifikasiId);
        if (!klasifikasi) return;
        const currentYear = new Date(tanggal).getFullYear();
        const suratTerkait = props.allSurat.filter(s => 
            s.tipe === TipeSurat.KELUAR && 
            (s as SuratKeluar).masalahUtamaId === masalahUtamaId &&
            new Date(s.tanggal).getFullYear() === currentYear
        );
        const nomorUrut = suratTerkait.length + 1;
        let nomorSurat = format
            .replace(/\[KODE_UNIT_KERJA_LENGKAP\]/g, kodeUnitLengkap)
            .replace(/\[KODE_KLASIFIKASI_ARSIP\]/g, klasifikasi.kode)
            .replace(/\[NOMOR_URUT_PER_MASALAH\]/g, nomorUrut.toString())
            .replace(/\[TAHUN_SAAT_INI\]/g, currentYear.toString());
        
        if (jenisSuratKeluar === 'SPPD') {
            nomorSurat = nomorSurat.replace(/NOMOR\s|TAHUN\s/g, '');
        }

        setFormState(prev => ({ ...prev, nomorSurat }));
    };
    
    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        const template = lists.allTemplates?.find(t => t.id === templateId);
        if (template) {
            setFormState(prev => ({
                ...prev,
                perihal: template.perihal,
                kategoriId: template.kategoriId,
                sifat: template.sifat,
                jenisSuratKeluar: template.jenisSuratKeluar,
                masalahUtamaId: template.masalahUtamaId,
                ringkasan: template.ringkasan,
                klasifikasiId: '', 
            }));
        } else {
            const baseState = getInitialState(tipe, props.currentUser, lists.unitKerjaList, lists.kategoriList);
            setFormState(prev => ({
                ...prev,
                perihal: '',
                kategoriId: lists.kategoriList[0]?.id || '',
                sifat: SifatSurat.BIASA,
                masalahUtamaId: '',
                klasifikasiId: '',
                ringkasan: '',
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formState,
            tipe,
            perihal: formState.jenisSuratKeluar === 'SPPD' ? `Surat Perintah Perjalanan Dinas: ${formState.perjalananDinasData.maksudPerjalanan.substring(0, 50)}...` : formState.perihal,
        };
        if (suratToEdit) {
            onSubmit({ ...finalData, id: suratToEdit.id });
        } else {
            onSubmit(finalData);
        }
        onClose();
    };


    const renderSuratMasukFields = () => (
        <>
            <div>
                <label className="block text-sm font-medium text-slate-700">Nomor Surat</label>
                <input type="text" name="nomorSurat" value={formState.nomorSurat} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Tanggal Surat</label>
                <input type="date" name="tanggal" value={formState.tanggal} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Perihal</label>
                <input type="text" name="perihal" value={formState.perihal} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Kategori</label>
                <select name="kategoriId" value={formState.kategoriId} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">Pilih Kategori</option>
                    {lists.kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Sifat Surat</label>
                <select name="sifat" value={formState.sifat} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                   {Object.values(SifatSurat).map(s => <option key={s as string} value={s as string}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Pengirim</label>
                <input type="text" name="pengirim" value={formState.pengirim} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Tanggal Diterima</label>
                <input type="date" name="tanggalDiterima" value={formState.tanggalDiterima} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
        </>
    );

    const handlePDChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({...prev, perjalananDinasData: {...prev.perjalananDinasData, [name]: value}}));
    };
    
    const handleSelectPengikut = (userId: string) => {
        const user = props.allUsers?.find(u => u.id === userId);
        if (!user) return;
    
        setFormState(prev => {
            if (!prev.perjalananDinasData.pengikut.some(p => p.userId === userId)) {
                const pengikut = [...prev.perjalananDinasData.pengikut, { userId, keterangan: user.jabatan }];
                return {...prev, perjalananDinasData: {...prev.perjalananDinasData, pengikut}};
            }
            return prev;
        });
        setPengikutSearch('');
        setIsPengikutDropdownOpen(false);
    };

    const handleRemovePengikut = (userId: string) => {
        setFormState(prev => ({...prev, perjalananDinasData: {...prev.perjalananDinasData, pengikut: prev.perjalananDinasData.pengikut.filter(p => p.userId !== userId)}}));
    };

    const handlePengikutKeteranganChange = (userId: string, keterangan: string) => {
        setFormState(prev => ({
            ...prev,
            perjalananDinasData: {
                ...prev.perjalananDinasData,
                pengikut: prev.perjalananDinasData.pengikut.map(p => 
                    p.userId === userId ? { ...p, keterangan } : p
                )
            }
        }));
    };

    const filteredPengikut = useMemo(() => {
        const { pegawaiUtamaId, pengikut } = formState.perjalananDinasData;
        if (!pengikutSearch) return [];
        return (props.allUsers || []).filter(user => user.id !== pegawaiUtamaId && !pengikut.some(p => p.userId === user.id)).filter(user => user.nama.toLowerCase().includes(pengikutSearch.toLowerCase()));
    }, [pengikutSearch, props.allUsers, formState.perjalananDinasData.pegawaiUtamaId, formState.perjalananDinasData.pengikut]);

    const pegawaiUtama = useMemo(() => props.allUsers?.find(u => u.id === formState.perjalananDinasData.pegawaiUtamaId), [formState.perjalananDinasData.pegawaiUtamaId, props.allUsers]);

    const calculateDuration = useCallback(() => {
        const { tanggalBerangkat, tanggalKembali } = formState.perjalananDinasData;
        if (!tanggalBerangkat || !tanggalKembali) return '-';
        const start = new Date(tanggalBerangkat);
        const end = new Date(tanggalKembali);
        if (start > end) return 'Tanggal tidak valid';
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
        return `${diffDays} Hari`;
    }, [formState.perjalananDinasData.tanggalBerangkat, formState.perjalananDinasData.tanggalKembali]);

    const SPPDField: React.FC<{ number: string, label: string, children: React.ReactNode}> = ({ number, label, children }) => (
        <div className="grid grid-cols-12 gap-x-2 py-1 items-center"><div className="col-span-1 text-center self-start pt-1">{number}</div><div className="col-span-4 self-start pt-1">{label}</div><div className="col-span-7">{children}</div></div>
    );

    const renderSPPDFields = () => {
        const pimpinanOptions = props.allUsers?.filter(u => 
            [UserRole.PIMPINAN, UserRole.MANAJERIAL, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(u.role)
        );
        return (
        <div className="md:col-span-2 mt-4 p-4 border-t-2 border-slate-200 border-dashed space-y-2 text-sm">
            <SPPDField number="1" label="Pejabat Pembuat Komitmen (Hal. 1 & 2)">
                 <select name="pejabatPembuatKomitmenId" value={formState.perjalananDinasData.pejabatPembuatKomitmenId} onChange={handlePDChange} required className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">-- Pilih Pejabat --</option>
                    {pimpinanOptions?.map(u => <option key={u.id} value={u.id}>{u.nama} ({u.jabatan})</option>)}
                </select>
            </SPPDField>
            <SPPDField number="" label="Penandatangan Hal. 2 (Kepala Kantor/Mewakili)">
                 <select name="penandatanganPihakLainId" value={formState.perjalananDinasData.penandatanganPihakLainId} onChange={handlePDChange} className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">-- Sama dengan Pejabat Pembuat Komitmen --</option>
                    {pimpinanOptions?.map(u => <option key={u.id} value={u.id}>{u.nama} ({u.jabatan})</option>)}
                </select>
            </SPPDField>
            <SPPDField number="2" label="Nama / NIP Pegawai yang melaksanakan Perjalanan Dinas">
                 <div className="grid grid-cols-2 gap-2">
                    <select name="pegawaiUtamaId" value={formState.perjalananDinasData.pegawaiUtamaId} onChange={handlePDChange} required className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md"><option value="">-- Pilih Pegawai --</option>{props.allUsers?.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}</select>
                    <input type="text" value={pegawaiUtama?.nip || ''} readOnly placeholder="NIP Pegawai" className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-slate-100" />
                </div>
            </SPPDField>
            <SPPDField number="3" label="a. Pangkat dan Golongan ruang"><input type="text" value={pegawaiUtama?.pangkatGolongan || ''} readOnly className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-slate-100" /></SPPDField>
            <SPPDField number="" label="b. Jabatan / Instansi"><input type="text" value={pegawaiUtama ? `${pegawaiUtama.jabatan} / ${lists.unitKerjaList.find(u => u.id === pegawaiUtama.unitKerjaId)?.nama}` : ''} readOnly className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-slate-100" /></SPPDField>
            <SPPDField number="" label="c. Tingkat Biaya Perjalanan Dinas"><input type="text" name="tingkatBiaya" value={formState.perjalananDinasData.tingkatBiaya} onChange={handlePDChange} required className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></SPPDField>
            <SPPDField number="4" label="Maksud Perjalanan Dinas"><textarea name="maksudPerjalanan" value={formState.perjalananDinasData.maksudPerjalanan} onChange={handlePDChange} required rows={3} className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></SPPDField>
            <SPPDField number="5" label="Alat angkut yang dipergunakan"><input type="text" name="alatAngkut" value={formState.perjalananDinasData.alatAngkut} onChange={handlePDChange} required className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></SPPDField>
            <SPPDField number="6" label="a. Tempat berangkat"><input type="text" name="tempatBerangkat" value={formState.perjalananDinasData.tempatBerangkat} onChange={handlePDChange} required className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></SPPDField>
            <SPPDField number="" label="b. Tempat tujuan"><input type="text" name="kotaTujuan" value={formState.perjalananDinasData.kotaTujuan} onChange={handlePDChange} required className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></SPPDField>
            <SPPDField number="7" label="a. Lamanya Perjalanan Dinas"><input type="text" value={calculateDuration()} readOnly className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-slate-100" /></SPPDField>
            <SPPDField number="" label="b. Tanggal berangkat"><input type="date" name="tanggalBerangkat" value={formState.perjalananDinasData.tanggalBerangkat} onChange={handlePDChange} required className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></SPPDField>
            <SPPDField number="" label="c. Tanggal harus kembali"><input type="date" name="tanggalKembali" value={formState.perjalananDinasData.tanggalKembali} onChange={handlePDChange} required className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></SPPDField>
            <SPPDField number="8" label="Pengikut">
                <div>
                    <div className="relative"><input type="text" value={pengikutSearch} onChange={(e) => setPengikutSearch(e.target.value)} onFocus={() => setIsPengikutDropdownOpen(true)} onBlur={() => setTimeout(() => setIsPengikutDropdownOpen(false), 150)} placeholder="Cari & tambah pengikut..." className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />{isPengikutDropdownOpen && filteredPengikut.length > 0 && (<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">{filteredPengikut.map(user => <div key={user.id} onMouseDown={() => handleSelectPengikut(user.id)} className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer">{user.nama}</div>)}</div>)}</div>
                    <div className="flex flex-col gap-1 mt-2">{formState.perjalananDinasData.pengikut.map(p => { const user = props.allUsers?.find(u => u.id === p.userId); if (!user) return null; return (<div key={p.userId} className="grid grid-cols-12 gap-2 items-center text-xs"><div className="col-span-4 bg-slate-100 px-2 py-1 rounded"><span>{user.nama}</span></div><div className="col-span-3 bg-slate-100 px-2 py-1 rounded"><span>{user.nip}</span></div><div className="col-span-4"><input type="text" value={p.keterangan} onChange={(e) => handlePengikutKeteranganChange(p.userId, e.target.value)} placeholder="Keterangan..." className="w-full shadow-sm sm:text-xs border-gray-300 rounded-md"/></div><div className="col-span-1 text-right"><button type="button" onClick={() => handleRemovePengikut(p.userId)} className="text-slate-500 hover:text-slate-700"><XIcon className="w-3 h-3"/></button></div></div>)})}</div>
                </div>
            </SPPDField>
            <SPPDField number="9" label="Pembebanan Anggaran"><div className="space-y-2"><input type="text" name="pembebananAnggaranInstansi" value={formState.perjalananDinasData.pembebananAnggaranInstansi} onChange={handlePDChange} placeholder="a. Instansi" required className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /><input type="text" name="pembebananAnggaranAkun" value={formState.perjalananDinasData.pembebananAnggaranAkun} onChange={handlePDChange} placeholder="b. Akun" required className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div></SPPDField>
            <SPPDField number="10" label="Keterangan lain-lain">
                 <div className="space-y-2">
                    <div className="p-2 bg-slate-50 rounded-md border">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Dasar Surat Tugas</p>
                        <input type="text" name="dasarSuratTugasNomor" value={formState.perjalananDinasData.dasarSuratTugasNomor} onChange={handlePDChange} placeholder="Nomor Surat Tugas" className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md mb-1" />
                        <input type="date" name="dasarSuratTugasTanggal" value={formState.perjalananDinasData.dasarSuratTugasTanggal} onChange={handlePDChange} className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                    <textarea name="ringkasan" value={formState.ringkasan} onChange={handleChange} rows={2} className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Isi catatan tambahan jika ada..." />
                </div>
            </SPPDField>
        </div>
        )
    };

    const RenderSuratKeluarBiasaFields = () => (
         <>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Perihal</label>
                <input type="text" name="perihal" value={formState.perihal} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Kategori</label>
                <select name="kategoriId" value={formState.kategoriId} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">Pilih Kategori</option>
                    {lists.kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Sifat Surat</label>
                <select name="sifat" value={formState.sifat} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    {Object.values(SifatSurat).map(s => <option key={s as string} value={s as string}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Gunakan Template</label>
                <select onChange={handleTemplateChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">-- Tanpa Template --</option>
                    {props.allTemplates?.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Tujuan (Eksternal)</label>
                <input type="text" name="tujuan" value={formState.tujuan} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Masalah Utama</label>
                <select name="masalahUtamaId" value={formState.masalahUtamaId} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">Pilih Masalah Utama...</option>
                    {lists.masalahUtamaList?.map(m => <option key={m.id} value={m.id}>{m.kode} - {m.deskripsi}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Klasifikasi Arsip</label>
                <select name="klasifikasiId" value={formState.klasifikasiId} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">Pilih Klasifikasi...</option>
                    {lists.klasifikasiList?.filter(k => k.masalahUtamaId === formState.masalahUtamaId).map(k => <option key={k.id} value={k.id}>{k.kode} - {k.deskripsi}</option>)}
                </select>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Ringkasan / Isi Surat</label>
                <RichTextEditor value={formState.ringkasan} onChange={handleRichTextChange} />
            </div>
        </>
    );
    
    const renderSuratKeluarFields = () => (
        <>
            <div>
                <label className="block text-sm font-medium text-slate-700">Nomor Surat</label>
                <div className="flex items-center mt-1">
                    <input type="text" name="nomorSurat" value={formState.nomorSurat} readOnly className={`block w-full shadow-sm sm:text-sm border-gray-300 rounded-l-md bg-slate-100 ${formState.nomorSurat ? 'font-bold text-slate-800' : ''}`} placeholder="Klik untuk generate nomor" />
                    <button type="button" onClick={handleGenerateNomorSurat} className="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-r-md hover:bg-slate-700">Generate</button>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Tanggal Surat</label>
                <input type="date" name="tanggal" value={formState.tanggal} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Jenis Surat Keluar</label>
                <select name="jenisSuratKeluar" value={formState.jenisSuratKeluar} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                   <option value="Biasa">Biasa</option>
                   <option value="SK">Surat Keputusan (SK)</option>
                   <option value="SPPD">Surat Perintah Perjalanan Dinas (SPPD)</option>
                </select>
            </div>
            
            {formState.jenisSuratKeluar !== 'SPPD' ? <RenderSuratKeluarBiasaFields /> : renderSPPDFields()}
        </>
    );

    const renderNotaDinasFields = () => (
        <>
            {/* Logic for Nota Dinas form */}
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={suratToEdit ? 'Edit Surat' : 'Tambah Surat Baru'} size={tipe === TipeSurat.KELUAR && formState.jenisSuratKeluar === 'SPPD' ? '4xl' : '3xl'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tipe === TipeSurat.MASUK && renderSuratMasukFields()}
                    {tipe === TipeSurat.KELUAR && renderSuratKeluarFields()}
                    {tipe === TipeSurat.NOTA_DINAS && renderNotaDinasFields()}
                </div>

                <div className="md:col-span-2 space-y-2 pt-4 border-t">
                    <label className="block text-sm font-medium text-slate-700">Lampiran</label>
                    <div className="mt-1">
                        <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                            <PaperClipIcon className="w-4 h-4 mr-2 inline-block"/>
                            <span>Tambah File</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple/>
                        </label>
                    </div>
                    <div className="space-y-2">
                        {formState.attachments.map(att => (
                            <div key={att.id} className="flex items-center justify-between p-2 bg-slate-100 rounded text-sm">
                                <span className="truncate">{att.name} ({(att.size/1024).toFixed(1)} KB)</span>
                                <button type="button" onClick={() => removeAttachment(att.id)} className="ml-2 text-red-500 hover:text-red-700"><XIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
                    <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        {suratToEdit ? 'Simpan Perubahan' : 'Simpan Surat'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};