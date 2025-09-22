import React, { useState, useEffect } from 'react';
import {
    AnySurat, TipeSurat, KategoriSurat, SifatSurat, UnitKerja, User,
    MasalahUtama, KlasifikasiSurat, PenomoranSettings, SuratMasuk,
    TemplateSurat, PerjalananDinas, RincianBiaya, SuratKeluar, NotaDinas, Attachment
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
    initialData?: (Partial<SuratKeluar> & { suratAsli?: SuratMasuk }) | null;
}

const getInitialState = (tipe: TipeSurat, currentUser: User) => ({
    // Common fields
    nomorSurat: '',
    tanggal: new Date().toISOString().split('T')[0],
    perihal: '',
    kategoriId: '',
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
        tujuanPerjalanan: '',
        kotaTujuan: '',
        tanggalBerangkat: '',
        tanggalKembali: '',
        pesertaIds: [] as string[],
        rincianBiaya: [] as Omit<RincianBiaya, 'id'>[],
    },
});

export const SuratFormModal: React.FC<SuratFormModalProps> = (props) => {
    const { isOpen, onClose, onSubmit, tipe, suratToEdit, initialData, ...lists } = props;
    const [formState, setFormState] = useState(getInitialState(tipe, props.currentUser));

    useEffect(() => {
        if (isOpen) {
            const baseState = getInitialState(tipe, props.currentUser);
            if (suratToEdit) {
                const s = suratToEdit;
                setFormState({
                    ...baseState,
                    nomorSurat: s.nomorSurat,
                    tanggal: new Date(s.tanggal).toISOString().split('T')[0],
                    perihal: s.perihal,
                    kategoriId: s.kategoriId,
                    sifat: s.sifat,
                    attachments: s.attachments || [],
                    // Type-specific fields
                    pengirim: (s as SuratMasuk).pengirim || '',
                    tanggalDiterima: (s as SuratMasuk).tanggalDiterima ? new Date((s as SuratMasuk).tanggalDiterima).toISOString().split('T')[0] : baseState.tanggalDiterima,
                    tujuan: (s as SuratKeluar).tujuan || '',
                    tujuanUnitKerjaId: (s as SuratKeluar).tujuanUnitKerjaId || '',
                    jenisSuratKeluar: (s as SuratKeluar).jenisSuratKeluar || 'Biasa',
                    masalahUtamaId: (s as SuratKeluar).masalahUtamaId || '',
                    klasifikasiId: (s as SuratKeluar).klasifikasiId || '',
                    ringkasan: (s as SuratKeluar | NotaDinas).ringkasan || '',
                    pembuat: (s as SuratKeluar | NotaDinas).pembuat || props.currentUser,
                    suratAsliId: (s as SuratKeluar).suratAsliId || '',
                    tujuanUserIds: (s as NotaDinas).tujuanUserIds || [],
                });
            } else if (initialData) { // For replying
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
    }, [isOpen, suratToEdit, initialData, tipe, props.currentUser]);
    
    // ... more component logic
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleRichTextChange = (html: string) => {
        setFormState(prev => ({ ...prev, ringkasan: html }));
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

        const format = jenisSuratKeluar === 'SK' || jenisSuratKeluar === 'SPPD' 
            ? lists.penomoranSettings.sk 
            : lists.penomoranSettings.biasa;

        // 1. Get KODE_UNIT_KERJA_LENGKAP
        const unitKerja = lists.unitKerjaList.find(u => u.id === props.currentUser.unitKerjaId);
        if (!unitKerja) return;
        let kodeUnitLengkap = unitKerja.kode;
        if (unitKerja.tipe === 'Cabang' && unitKerja.indukId) {
            const induk = lists.unitKerjaList.find(u => u.id === unitKerja.indukId);
            if (induk) kodeUnitLengkap = `${induk.kode}.${unitKerja.kode}`;
        }
        
        // 2. Get KODE_KLASIFIKASI_ARSIP
        const klasifikasi = lists.klasifikasiList.find(k => k.id === klasifikasiId);
        if (!klasifikasi) return;
        
        // 3. Get NOMOR_URUT_PER_MASALAH
        const masalahUtama = lists.masalahUtamaList.find(m => m.id === masalahUtamaId);
        if (!masalahUtama) return;
        const currentYear = new Date(tanggal).getFullYear();
        const suratTerkait = props.allSurat.filter(s => 
            s.tipe === TipeSurat.KELUAR && 
            (s as SuratKeluar).masalahUtamaId === masalahUtamaId &&
            new Date(s.tanggal).getFullYear() === currentYear
        );
        const nomorUrut = suratTerkait.length + 1;

        // 4. Get TAHUN_SAAT_INI
        const tahun = currentYear.toString();

        // Build the number
        let nomorSurat = format
            .replace('[KODE_UNIT_KERJA_LENGKAP]', kodeUnitLengkap)
            .replace('[KODE_KLASIFIKASI_ARSIP]', klasifikasi.kode)
            .replace('[NOMOR_URUT_PER_MASALAH]', nomorUrut.toString())
            .replace('[TAHUN_SAAT_INI]', tahun);

        setFormState(prev => ({ ...prev, nomorSurat }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formState,
            tipe,
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
                <label className="block text-sm font-medium text-slate-700">Pengirim</label>
                <input type="text" name="pengirim" value={formState.pengirim} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Tanggal Diterima</label>
                <input type="date" name="tanggalDiterima" value={formState.tanggalDiterima} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
        </>
    );
    
    const renderSuratKeluarFields = () => (
        <>
             <div>
                <label className="block text-sm font-medium text-slate-700">Gunakan Template</label>
                 <select onChange={(e) => {
                    const template = props.allTemplates?.find(t => t.id === e.target.value);
                    if(template) {
                        setFormState(prev => ({
                            ...prev,
                            perihal: template.perihal,
                            kategoriId: template.kategoriId,
                            sifat: template.sifat,
                            jenisSuratKeluar: template.jenisSuratKeluar,
                            masalahUtamaId: template.masalahUtamaId,
                            ringkasan: template.ringkasan,
                        }));
                    }
                 }} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">-- Tanpa Template --</option>
                    {props.allTemplates?.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Tujuan (Eksternal)</label>
                <input type="text" name="tujuan" value={formState.tujuan} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Jenis Surat Keluar</label>
                <select name="jenisSuratKeluar" value={formState.jenisSuratKeluar} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                   <option value="Biasa">Biasa</option>
                   <option value="SK">Surat Keputusan (SK)</option>
                   <option value="SPPD">Surat Perintah Perjalanan Dinas (SPPD)</option>
                </select>
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

    const renderNotaDinasFields = () => (
        <>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Tujuan Pengguna Internal</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {props.allUsers?.filter(u => u.id !== props.currentUser.id).map(user => (
                        <div key={user.id} className="flex items-center">
                            <input
                                id={`user-${user.id}`}
                                type="checkbox"
                                checked={formState.tujuanUserIds.includes(user.id)}
                                onChange={() => {
                                    setFormState(prev => ({
                                        ...prev,
                                        tujuanUserIds: prev.tujuanUserIds.includes(user.id)
                                            ? prev.tujuanUserIds.filter(id => id !== user.id)
                                            : [...prev.tujuanUserIds, user.id]
                                    }));
                                }}
                                className="h-4 w-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                            />
                            <label htmlFor={`user-${user.id}`} className="ml-2 text-sm text-gray-700">{user.nama}</label>
                        </div>
                    ))}
                </div>
            </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Ringkasan / Isi Nota Dinas</label>
                <RichTextEditor value={formState.ringkasan} onChange={handleRichTextChange} />
            </div>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={suratToEdit ? 'Edit Surat' : 'Tambah Surat Baru'} size={tipe === TipeSurat.KELUAR ? '3xl' : '2xl'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tipe === TipeSurat.KELUAR ? (
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Nomor Surat</label>
                            <div className="flex items-center mt-1">
                                <input 
                                    type="text" 
                                    name="nomorSurat" 
                                    value={formState.nomorSurat} 
                                    readOnly 
                                    className={`block w-full shadow-sm sm:text-sm border-gray-300 rounded-l-md bg-slate-100 ${formState.nomorSurat ? 'font-bold text-slate-800' : ''}`}
                                    placeholder="Klik untuk generate nomor"
                                />
                                <button type="button" onClick={handleGenerateNomorSurat} className="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-r-md hover:bg-slate-700">
                                    Generate
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nomor Surat</label>
                            <input type="text" name="nomorSurat" value={formState.nomorSurat} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                    )}
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

                    {/* Type-specific fields */}
                    {tipe === TipeSurat.MASUK && renderSuratMasukFields()}
                    {tipe === TipeSurat.KELUAR && renderSuratKeluarFields()}
                    {tipe === TipeSurat.NOTA_DINAS && renderNotaDinasFields()}
                </div>

                <div className="flex justify-end pt-6">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
                    <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        {suratToEdit ? 'Simpan Perubahan' : 'Simpan Surat'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};