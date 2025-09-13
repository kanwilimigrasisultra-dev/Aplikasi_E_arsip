import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import {
    AnySurat, TipeSurat, SifatSurat, KategoriSurat, UnitKerja, User,
    SuratMasuk, SuratKeluar, MasalahUtama, KlasifikasiSurat, PenomoranSettings
} from '../types';
import Modal from './Modal';
import { PaperClipIcon, SparklesIcon } from './icons';

interface SuratFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (surat: Omit<AnySurat, 'id' | 'isArchived' | 'disposisi' | 'fileUrl' | 'unitKerjaId'> | AnySurat) => void;
    tipe: TipeSurat;
    kategoriList: KategoriSurat[];
    masalahUtamaList?: MasalahUtama[];
    klasifikasiList?: KlasifikasiSurat[];
    unitKerjaList: UnitKerja[];
    currentUser: User;
    allSurat?: AnySurat[];
    penomoranSettings?: PenomoranSettings;
    suratToEdit?: AnySurat | null;
    initialData?: (Partial<SuratKeluar> & { suratAsli?: SuratMasuk }) | null;
}

type FormData = Partial<Omit<SuratMasuk, 'tipe'> & Omit<SuratKeluar, 'tipe'>> & { suratAsli?: SuratMasuk };


const SuratFormModal: React.FC<SuratFormModalProps> = (props) => {
    const { isOpen, onClose, onSubmit, tipe, suratToEdit, initialData } = props;
    
    const getInitialState = (): FormData => {
        const defaults = {
            nomorSurat: '',
            tanggal: new Date().toISOString().split('T')[0],
            perihal: '',
            kategoriId: props.kategoriList[0]?.id || '',
            sifat: SifatSurat.BIASA,
        };

        if (tipe === TipeSurat.MASUK) {
            return {
                ...defaults,
                pengirim: '',
                tanggalDiterima: new Date().toISOString().split('T')[0],
                isiRingkasAI: '',
            };
        } else { // KELUAR
            return {
                ...defaults,
                tujuan: '',
                jenisSuratKeluar: 'Biasa',
                masalahUtamaId: props.masalahUtamaList?.[0]?.id || '',
                klasifikasiId: '',
                ringkasan: '',
                suratAsliId: initialData?.suratAsliId,
            };
        }
    };
    
    const [formData, setFormData] = useState<FormData>(getInitialState());
    const [isGenerating, setIsGenerating] = useState(false);
    const [poinBalasan, setPoinBalasan] = useState('');

    const filteredKlasifikasi = useMemo(() => {
        if (!props.klasifikasiList || !formData.masalahUtamaId) return [];
        return props.klasifikasiList.filter(k => k.masalahUtamaId === formData.masalahUtamaId);
    }, [props.klasifikasiList, formData.masalahUtamaId]);

    useEffect(() => {
        if (isOpen) {
            const initialState = getInitialState();
            if (suratToEdit) {
                const editState: FormData = {
                    ...initialState,
                    ...suratToEdit,
                    tanggal: new Date(suratToEdit.tanggal).toISOString().split('T')[0],
                };
                if (suratToEdit.tipe === TipeSurat.MASUK) {
                    (editState as Partial<SuratMasuk>).tanggalDiterima = new Date((suratToEdit as SuratMasuk).tanggalDiterima).toISOString().split('T')[0];
                }
                setFormData(editState);
            } else if (initialData) {
                setFormData({ ...initialState, ...initialData });
            } else {
                setFormData(initialState);
            }
            setPoinBalasan('');
        }
    }, [isOpen, suratToEdit, initialData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'masalahUtamaId') {
            setFormData(prev => ({ ...prev, klasifikasiId: '' }));
        }
    };
    
    const handleGenerateNomor = () => {
        if (!props.penomoranSettings || !props.allSurat || !formData.klasifikasiId || !formData.masalahUtamaId || !formData.jenisSuratKeluar) {
            alert("Harap pilih Jenis Surat, Masalah Utama, dan Klasifikasi Arsip terlebih dahulu.");
            return;
        }

        const { penomoranSettings, allSurat, klasifikasiList, unitKerjaList, currentUser } = props;
        
        const format = formData.jenisSuratKeluar === 'SK' ? penomoranSettings.sk : penomoranSettings.biasa;

        // 1. Get Sequence Number (per Masalah Utama)
        const currentYear = new Date().getFullYear();
        const suratKeluarTahunIniDenganMasalahSama = allSurat.filter(s => {
            if (s.tipe !== TipeSurat.KELUAR) return false;
            const sKeluar = s as SuratKeluar;
            return new Date(sKeluar.tanggal).getFullYear() === currentYear && sKeluar.masalahUtamaId === formData.masalahUtamaId;
        });
        const nomorUrut = suratKeluarTahunIniDenganMasalahSama.length + 1;

        // 2. Get Klasifikasi Code
        const klasifikasi = klasifikasiList?.find(k => k.id === formData.klasifikasiId);
        if (!klasifikasi) {
            alert("Klasifikasi tidak ditemukan.");
            return;
        }
        const kodeKlasifikasi = klasifikasi.kode;

        // 3. Get Unit Kerja Code (Hierarchical)
        const unitKerja = unitKerjaList.find(u => u.id === currentUser.unitKerjaId);
        if (!unitKerja) {
            alert("Unit kerja pengguna tidak ditemukan.");
            return;
        }

        let kodeUnitKerjaLengkap: string;
        if (unitKerja.tipe === 'Cabang' && unitKerja.indukId) {
            const induk = unitKerjaList.find(u => u.id === unitKerja.indukId);
            kodeUnitKerjaLengkap = induk ? `${induk.kode}.${unitKerja.kode}` : unitKerja.kode;
        } else {
            kodeUnitKerjaLengkap = unitKerja.kode;
        }
        
        // 4. Replace placeholders
        const nomorSurat = format
            .replace(/\[KODE_UNIT_KERJA_LENGKAP\]/g, kodeUnitKerjaLengkap)
            .replace(/\[KODE_KLASIFIKASI_ARSIP\]/g, kodeKlasifikasi)
            .replace(/\[NOMOR_URUT_PER_MASALAH\]/g, nomorUrut.toString())
            .replace(/\[TAHUN_SAAT_INI\]/g, currentYear.toString());

        setFormData(prev => ({ ...prev, nomorSurat }));
    };
    
    const handleAiAssist = async () => {
        if (!formData.isiRingkasAI) {
            alert("Mohon isi ringkasan surat untuk menggunakan Bantuan AI.");
            return;
        }
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const schema = {
                type: Type.OBJECT,
                properties: {
                    perihal: { type: Type.STRING, description: 'Judul perihal surat yang singkat dan jelas, maksimal 10 kata.' },
                    kategori: { type: Type.STRING, description: 'Kategori yang paling sesuai untuk surat ini.', enum: props.kategoriList.map(k => k.nama) },
                    sifat: { type: Type.STRING, description: 'Sifat urgensi surat ini.', enum: Object.values(SifatSurat) }
                },
                required: ['perihal', 'kategori', 'sifat']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analisis isi ringkas surat berikut dan ekstrak informasi yang diminta dalam format JSON: "${formData.isiRingkasAI}"`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                }
            });

            const result = JSON.parse(response.text.trim());
            const kategori = props.kategoriList.find(k => k.nama === result.kategori);

            setFormData(prev => ({
                ...prev,
                perihal: result.perihal,
                kategoriId: kategori ? kategori.id : prev.kategoriId,
                sifat: result.sifat as SifatSurat,
            }));

        } catch (error) {
            console.error("AI assist failed:", error);
            alert("Gagal mendapatkan bantuan dari AI. Silakan coba lagi.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAiDraftReply = async () => {
        if (!poinBalasan || !initialData?.suratAsli) {
            alert("Mohon isi poin-poin balasan untuk membuat draf AI.");
            return;
        }
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const { suratAsli } = initialData;
            const prompt = `Anda adalah asisten administrasi yang profesional. Berdasarkan surat masuk berikut:
- Perihal: "${suratAsli.perihal}"
- Dari: "${suratAsli.pengirim}"
- Tanggal Diterima: "${new Date(suratAsli.tanggalDiterima).toLocaleDateString('id-ID')}"

Dan poin-poin balasan yang harus disampaikan berikut:
"${poinBalasan}"

Buatkan draf isi surat balasan yang lengkap, formal, dan sopan dalam Bahasa Indonesia. Mulai dengan sapaan pembuka dan akhiri dengan penutup, tanpa perlu menyertakan bagian kop, nomor, atau tanda tangan.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setFormData(prev => ({ ...prev, ringkasan: response.text.trim() }));
        } catch (error) {
            console.error("AI draft reply failed:", error);
            alert("Gagal membuat draf balasan dengan AI.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isEditMode = !!suratToEdit;

        // For update, merge formData into the existing suratToEdit object
        if (isEditMode) {
            const updatedSurat: AnySurat = {
                ...suratToEdit,
                ...formData,
            };
            onSubmit(updatedSurat);
            onClose();
            return;
        }

        // For create, build a new, clean object based on the 'tipe'
        if (tipe === TipeSurat.MASUK) {
            const newSurat: Omit<SuratMasuk, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'disposisi'> = {
                nomorSurat: formData.nomorSurat || '',
                tanggal: formData.tanggal || '',
                perihal: formData.perihal || '',
                kategoriId: formData.kategoriId || '',
                sifat: formData.sifat || SifatSurat.BIASA,
                tipe: TipeSurat.MASUK,
                pengirim: formData.pengirim || '',
                tanggalDiterima: formData.tanggalDiterima || '',
                isiRingkasAI: formData.isiRingkasAI,
            };
            onSubmit(newSurat);
        } else { // KELUAR
            const newSurat: Omit<SuratKeluar, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'tandaTangan'> = {
                nomorSurat: formData.nomorSurat || '',
                tanggal: formData.tanggal || '',
                perihal: formData.perihal || '',
                kategoriId: formData.kategoriId || '',
                sifat: formData.sifat || SifatSurat.BIASA,
                tipe: TipeSurat.KELUAR,
                tujuan: formData.tujuan || '',
                tujuanUnitKerjaId: formData.tujuanUnitKerjaId,
                pembuat: props.currentUser,
                jenisSuratKeluar: formData.jenisSuratKeluar || 'Biasa',
                masalahUtamaId: formData.masalahUtamaId || '',
                klasifikasiId: formData.klasifikasiId || '',
                ringkasan: formData.ringkasan || '',
                suratAsliId: formData.suratAsliId,
            };
            onSubmit(newSurat);
        }

        onClose();
    };

    const isEditMode = !!suratToEdit;
    const title = `${isEditMode ? 'Edit' : 'Tambah'} Surat ${tipe === TipeSurat.MASUK ? 'Masuk' : 'Keluar'}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                {tipe === TipeSurat.MASUK && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <label className="block text-sm font-medium text-slate-700">Isi Ringkas Surat (untuk Bantuan AI)</label>
                        <textarea name="isiRingkasAI" value={formData.isiRingkasAI || ''} onChange={handleChange} rows={3} placeholder="Salin-tempel atau tulis ringkasan isi surat di sini..." className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-slate-700">Perihal</label>
                    <div className="relative">
                        <input type="text" name="perihal" value={formData.perihal || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        {tipe === TipeSurat.MASUK && (
                             <button type="button" onClick={handleAiAssist} disabled={isGenerating || !formData.isiRingkasAI} className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center bg-slate-700 text-white px-2 py-1 rounded-md hover:bg-slate-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                <SparklesIcon className="w-4 h-4 mr-1" />
                                {isGenerating ? 'Memproses...' : 'Bantuan AI'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Tanggal Surat</label>
                        <input type="date" name="tanggal" value={formData.tanggal || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Kategori</label>
                        <select name="kategoriId" value={formData.kategoriId || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            {props.kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                        </select>
                    </div>
                </div>
                
                {tipe === TipeSurat.MASUK ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Nomor Surat</label>
                            <input type="text" name="nomorSurat" value={formData.nomorSurat || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Pengirim</label>
                            <input type="text" name="pengirim" value={formData.pengirim || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Tanggal Diterima</label>
                            <input type="date" name="tanggalDiterima" value={formData.tanggalDiterima || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                    </div>
                ) : ( // SURAT KELUAR
                    <>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Jenis Surat</label>
                                <select name="jenisSuratKeluar" value={formData.jenisSuratKeluar || 'Biasa'} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                    <option value="Biasa">Surat Biasa</option>
                                    <option value="SK">Surat Keputusan (SK)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Masalah Utama</label>
                                <select name="masalahUtamaId" value={formData.masalahUtamaId || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                    <option value="">Pilih Masalah...</option>
                                    {props.masalahUtamaList?.map(m => <option key={m.id} value={m.id}>{m.kode} - {m.deskripsi}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Klasifikasi Arsip</label>
                                <select name="klasifikasiId" value={formData.klasifikasiId || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" disabled={!formData.masalahUtamaId}>
                                    <option value="">Pilih Klasifikasi...</option>
                                    {filteredKlasifikasi.map(k => <option key={k.id} value={k.id}>{k.kode} - {k.deskripsi}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-slate-700">Nomor Surat</label>
                             <div className="flex items-center space-x-2">
                                <input type="text" name="nomorSurat" value={formData.nomorSurat || ''} onChange={handleChange} required placeholder="Klik tombol untuk generate nomor..." className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-slate-100" readOnly />
                                <button type="button" onClick={handleGenerateNomor} className="mt-1 whitespace-nowrap bg-slate-700 text-white px-3 py-2 rounded-lg hover:bg-slate-800 text-sm font-medium disabled:opacity-50" disabled={!formData.klasifikasiId}>
                                    Buat Nomor Otomatis
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tujuan</label>
                            <input type="text" name="tujuan" value={formData.tujuan || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        {initialData?.suratAsli && (
                             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                                <h4 className="text-sm font-semibold text-blue-800">Membalas Surat:</h4>
                                <p className="text-xs text-slate-600">
                                    <span className="font-bold">Perihal:</span> {initialData.suratAsli.perihal} <br/>
                                    <span className="font-bold">Dari:</span> {initialData.suratAsli.pengirim}
                                </p>
                                <label className="block text-sm font-medium text-slate-700 pt-2">Poin-poin utama balasan</label>
                                <textarea value={poinBalasan} onChange={e => setPoinBalasan(e.target.value)} rows={3} placeholder="Contoh: Setujui permohonan, jadwalkan rapat hari Jumat pukul 10.00, minta data tambahan." className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                                <div className="text-right">
                                    <button type="button" onClick={handleAiDraftReply} disabled={isGenerating || !poinBalasan} className="inline-flex items-center bg-slate-700 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                        <SparklesIcon className="w-4 h-4 mr-2" />
                                        {isGenerating ? 'Membuat...' : 'Buat Draf Isi Surat dengan AI'}
                                    </button>
                                </div>
                            </div>
                        )}
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Isi Surat (Ringkasan)</label>
                             <textarea name="ringkasan" value={formData.ringkasan || ''} onChange={handleChange} rows={5} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                        </div>
                    </>
                )}
                
                 <div>
                        <label className="block text-sm font-medium text-slate-700">Sifat</label>
                        <select name="sifat" value={formData.sifat || SifatSurat.BIASA} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            {Object.values(SifatSurat).map(s => <option key={s as string} value={s as string}>{s}</option>)}
                        </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Lampiran File</label>
                    <div className="mt-1 flex items-center">
                        <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                            <PaperClipIcon className="w-4 h-4 inline-block mr-2" />
                            <span>Pilih File</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <span className="ml-3 text-sm text-slate-500">(Fitur unggah file disimulasikan)</span>
                    </div>
                </div>

                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        {isEditMode ? 'Simpan Perubahan' : 'Simpan Surat'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SuratFormModal;