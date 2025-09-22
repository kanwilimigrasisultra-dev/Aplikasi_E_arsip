import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import {
    AnySurat, TipeSurat, SifatSurat, KategoriSurat, UnitKerja, User,
    SuratMasuk, SuratKeluar, NotaDinas, MasalahUtama, KlasifikasiSurat, PenomoranSettings, Attachment, TemplateSurat, Disposisi, Komentar, Tugas, DokumenTerkait, ApprovalStep
} from '../types';
import Modal from './Modal';
import { PaperClipIcon, SparklesIcon, XIcon, LinkIcon } from './icons';

interface SuratFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (surat: Omit<AnySurat, 'id' | 'isArchived' | 'disposisi' | 'fileUrl' | 'unitKerjaId' | 'status' | 'version' | 'history' | 'approvalChain' | 'komentar'> | AnySurat) => void;
    tipe: TipeSurat;
    kategoriList: KategoriSurat[];
    masalahUtamaList?: MasalahUtama[];
    klasifikasiList?: KlasifikasiSurat[];
    unitKerjaList: UnitKerja[];
    currentUser: User;
    allUsers?: User[];
    allSurat?: AnySurat[];
    penomoranSettings?: PenomoranSettings;
    suratToEdit?: AnySurat | null;
    initialData?: (Partial<SuratKeluar> & { suratAsli?: SuratMasuk }) | null;
    allTemplates?: TemplateSurat[];
}

type FormData = {
    // from SuratBase
    nomorSurat?: string;
    tanggal?: string;
    perihal?: string;
    kategoriId?: string;
    sifat?: SifatSurat;
    attachments?: Attachment[];
    komentar?: Komentar[];
    tugasTerkait?: Tugas[];
    dokumenTerkait?: DokumenTerkait[];
    
    // from SuratMasuk
    pengirim?: string;
    tanggalDiterima?: string;
    disposisi?: Disposisi[];
    isiRingkasAI?: string;

    // from SuratKeluar
    tujuan?: string;
    tembusan?: string; // Stored as string in form, converted to string[] on submit
    tujuanUnitKerjaId?: string;
    pembuat?: User;
// FIX: Added 'SPPD' to the type to match the TemplateSurat type.
    jenisSuratKeluar?: 'Biasa' | 'SK' | 'SPPD';
    masalahUtamaId?: string;
    klasifikasiId?: string;
    ringkasan?: string;
    tandaTangan?: string;
    suratAsliId?: string;
    status?: SuratKeluar['status'] | NotaDinas['status']; 
    version?: number;
    history?: Partial<SuratKeluar>[];
    approvalChain?: ApprovalStep[];

    // from NotaDinas
    tujuanUserIds?: string[];
    
    // Other
    suratAsli?: SuratMasuk;
};


// FIX: Changed to a named export
export const SuratFormModal: React.FC<SuratFormModalProps> = (props) => {
    const { isOpen, onClose, onSubmit, tipe, suratToEdit, initialData } = props;
    
    const getInitialState = (): FormData => {
        const defaults = {
            nomorSurat: '',
            tanggal: new Date().toISOString().split('T')[0],
            perihal: '',
            kategoriId: props.kategoriList[0]?.id || '',
            sifat: SifatSurat.BIASA,
            attachments: [],
        };

        if (tipe === TipeSurat.MASUK) {
            return {
                ...defaults,
                pengirim: '',
                tanggalDiterima: new Date().toISOString().split('T')[0],
                isiRingkasAI: '',
            };
        } else if (tipe === TipeSurat.NOTA_DINAS) {
            return {
                ...defaults,
                tujuanUserIds: [],
                ringkasan: '',
            };
        } else { // KELUAR
            return {
                ...defaults,
                tujuan: '',
                tembusan: '',
                jenisSuratKeluar: 'Biasa',
                masalahUtamaId: props.masalahUtamaList?.[0]?.id || '',
                klasifikasiId: '',
                ringkasan: '',
                suratAsliId: initialData?.suratAsliId,
            };
        }
    };
    
    const [formData, setFormData] = useState<FormData>(getInitialState());
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiSearchQuery, setAiSearchQuery] = useState('');
    const [aiSearchResults, setAiSearchResults] = useState<{ sources: any[], content: string } | null>(null);
    const [poinBalasan, setPoinBalasan] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    const filteredKlasifikasi = useMemo(() => {
        if (!props.klasifikasiList || !formData.masalahUtamaId) return [];
        return props.klasifikasiList.filter(k => k.masalahUtamaId === formData.masalahUtamaId);
    }, [props.klasifikasiList, formData.masalahUtamaId]);

    useEffect(() => {
        if (isOpen) {
            const initialState = getInitialState();
            if (suratToEdit) {
                // FIX: Use `any` for `editState` to bypass strict type checking for `tembusan`.
                const editState: any = {
                    ...initialState,
                    ...suratToEdit,
                    tanggal: new Date(suratToEdit.tanggal).toISOString().split('T')[0],
                };
                if (suratToEdit.tipe === TipeSurat.KELUAR) {
                    editState.tembusan = (suratToEdit as SuratKeluar).tembusan?.join('\n') || '';
                }
                if (suratToEdit.tipe === TipeSurat.MASUK) {
                    editState.tanggalDiterima = new Date((suratToEdit as SuratMasuk).tanggalDiterima).toISOString().split('T')[0];
                }
                setFormData(editState);
                setAttachments(suratToEdit.attachments || []);
            } else if (initialData) {
                // FIX: Use `any` for `initialData` to avoid type conflict with `tembusan`.
                setFormData({ ...initialState, ...(initialData as any) });
                setAttachments([]);
            } else {
                setFormData(initialState);
                setAttachments([]);
            }
            setPoinBalasan('');
            setSelectedTemplateId('');
            setAiSearchQuery('');
            setAiSearchResults(null);
        }
    }, [isOpen, suratToEdit, initialData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'masalahUtamaId') {
            setFormData(prev => ({ ...prev, klasifikasiId: '' }));
        }
    };
    
    const handleTujuanUserIdsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, tujuanUserIds: value }));
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);
        if (templateId) {
            const template = props.allTemplates?.find(t => t.id === templateId);
            if (template) {
                setFormData(prev => ({
                    ...prev,
                    perihal: template.perihal,
                    kategoriId: template.kategoriId,
                    sifat: template.sifat,
                    jenisSuratKeluar: template.jenisSuratKeluar,
                    masalahUtamaId: template.masalahUtamaId,
                    ringkasan: template.ringkasan,
                    klasifikasiId: '', // Reset klasifikasi as it depends on masalah utama
                }));
            }
        } else {
            // Reset to initial state if "No Template" is selected, but keep initialData if present
            const baseState = getInitialState();
            setFormData({ ...baseState, ...(initialData as any) });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newAttachment: Attachment = {
                        id: `att-${Date.now()}-${Math.random()}`,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: event.target?.result as string,
                    };
                    setAttachments(prev => [...prev, newAttachment]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
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
    
    const handleAiDraftReplyWithSearch = async () => {
        if (!aiSearchQuery.trim()) {
            alert("Mohon isi kueri pencarian untuk membuat draf AI.");
            return;
        }
        setIsGenerating(true);
        setAiSearchResults(null);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: aiSearchQuery,
                config: {
                    tools: [{googleSearch: {}}],
                },
            });

            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const content = response.text.trim();
            setAiSearchResults({ sources, content });
            setFormData(prev => ({ ...prev, ringkasan: content }));

        } catch (error) {
            console.error("AI draft reply with search failed:", error);
            alert("Gagal membuat draf balasan dengan AI. Pastikan format kueri Anda benar.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullData = { ...formData, attachments };
        
        if (suratToEdit) {
            const updatedSurat = {
                ...suratToEdit,
                ...fullData,
            } as AnySurat;
             if (updatedSurat.tipe === TipeSurat.KELUAR && typeof (updatedSurat as any).tembusan === 'string') {
                (updatedSurat as SuratKeluar).tembusan = (updatedSurat as any).tembusan.split('\n').map((t: string) => t.trim()).filter(Boolean);
            }
            onSubmit(updatedSurat);
        } else {
             if (tipe === TipeSurat.MASUK) {
                const newSurat: Omit<SuratMasuk, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'disposisi' | 'komentar'> = {
                    nomorSurat: fullData.nomorSurat || '',
                    tanggal: fullData.tanggal || '',
                    perihal: fullData.perihal || '',
                    kategoriId: fullData.kategoriId || '',
                    sifat: fullData.sifat || SifatSurat.BIASA,
                    tipe: TipeSurat.MASUK,
                    pengirim: fullData.pengirim || '',
                    tanggalDiterima: fullData.tanggalDiterima || '',
                    isiRingkasAI: fullData.isiRingkasAI,
                    attachments: fullData.attachments,
                    tugasTerkait: [],
                    dokumenTerkait: [],
                };
                onSubmit(newSurat);
            } else if (tipe === TipeSurat.NOTA_DINAS) {
                const newSurat: Omit<NotaDinas, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'status' | 'komentar' | 'pembuat'> = {
                    nomorSurat: fullData.nomorSurat || '',
                    tanggal: fullData.tanggal || '',
                    perihal: fullData.perihal || '',
                    kategoriId: fullData.kategoriId || '',
                    sifat: fullData.sifat || SifatSurat.BIASA,
                    tipe: TipeSurat.NOTA_DINAS,
                    tujuanUserIds: fullData.tujuanUserIds || [],
                    ringkasan: fullData.ringkasan || '',
                    attachments: fullData.attachments,
                    tugasTerkait: [],
                    dokumenTerkait: [],
                };
                onSubmit(newSurat);
            } else { // KELUAR
                const tembusanArray = (fullData.tembusan && typeof fullData.tembusan === 'string')
                    ? fullData.tembusan.split('\n').map(t => t.trim()).filter(Boolean)
                    : [];

                const newSurat: Omit<SuratKeluar, 'id' | 'isArchived' | 'fileUrl' | 'unitKerjaId' | 'status' | 'version' | 'history' | 'approvalChain' | 'komentar'> = {
                    nomorSurat: fullData.nomorSurat || '',
                    tanggal: fullData.tanggal || '',
                    perihal: fullData.perihal || '',
                    kategoriId: fullData.kategoriId || '',
                    sifat: fullData.sifat || SifatSurat.BIASA,
                    tipe: TipeSurat.KELUAR,
                    tujuan: fullData.tujuan || '',
                    tujuanUnitKerjaId: fullData.tujuanUnitKerjaId,
                    pembuat: props.currentUser,
                    jenisSuratKeluar: fullData.jenisSuratKeluar || 'Biasa',
                    masalahUtamaId: fullData.masalahUtamaId || '',
                    klasifikasiId: fullData.klasifikasiId || '',
                    ringkasan: fullData.ringkasan || '',
                    suratAsliId: fullData.suratAsliId,
                    attachments: fullData.attachments,
                    tugasTerkait: [],
                    dokumenTerkait: [],
                    tembusan: tembusanArray,
                };
                onSubmit(newSurat);
            }
        }
        onClose();
    };


    const isEditMode = !!suratToEdit;
    const title = `${isEditMode ? 'Edit' : 'Tambah'} Surat ${tipe === TipeSurat.MASUK ? 'Masuk' : tipe === TipeSurat.KELUAR ? 'Keluar' : 'Nota Dinas'}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                {tipe === TipeSurat.KELUAR && props.allTemplates && !isEditMode && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Gunakan Template</label>
                        <select value={selectedTemplateId} onChange={handleTemplateChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <option value="">-- Tanpa Template --</option>
                            {props.allTemplates.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                        </select>
                    </div>
                )}

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
                                {isGenerating ? 'Memproses...' : 'Dapatkan Saran AI'}
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
                ) : tipe === TipeSurat.NOTA_DINAS ? (
                     <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nomor Nota Dinas</label>
                            <input type="text" name="nomorSurat" value={formData.nomorSurat || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tujuan Internal</label>
                            <select
                                name="tujuanUserIds"
                                multiple
                                value={formData.tujuanUserIds || []}
                                onChange={handleTujuanUserIdsChange}
                                required
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-32"
                            >
                                {props.allUsers?.filter(u => u.id !== props.currentUser.id).map(u => (
                                    <option key={u.id} value={u.id}>{u.nama} ({u.jabatan})</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Tahan Ctrl (atau Cmd di Mac) untuk memilih beberapa tujuan.</p>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Isi Nota Dinas (Ringkasan)</label>
                           <textarea name="ringkasan" value={formData.ringkasan || ''} onChange={handleChange} rows={5} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                       </div>
                    </>
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
                                <input 
                                    type="text" 
                                    name="nomorSurat" 
                                    value={formData.nomorSurat || ''} 
                                    onChange={handleChange} 
                                    required 
                                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Generate otomatis atau isi manual..."
                                />
                                <button type="button" onClick={handleGenerateNomor} className="flex-shrink-0 flex items-center bg-slate-100 text-slate-700 px-3 py-2 rounded-md hover:bg-slate-200 text-sm font-medium">
                                    <SparklesIcon className="w-4 h-4 mr-1.5" />
                                    Generate
                                </button>
                            </div>
                        </div>

                        {initialData?.suratAsli && (
                            <div className="p-3 bg-slate-50 border rounded-md">
                                <p className="text-xs font-semibold text-slate-600 flex items-center">
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Membalas Surat Masuk:
                                </p>
                                <p className="text-sm text-slate-800 pl-6 mt-1">
                                    <span className="font-medium">{initialData.suratAsli.nomorSurat}</span> - {initialData.suratAsli.perihal}
                                </p>
                            </div>
                        )}
                        
                        <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg space-y-3">
                            <h4 className="font-medium text-sky-800">Buat Draf Balasan dengan AI</h4>
                            <p className="text-xs text-sky-700">Gunakan Google Search untuk mencari informasi relevan dan membuat draf balasan. Tulis kueri atau poin-poin utama yang ingin disampaikan.</p>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    value={aiSearchQuery} 
                                    onChange={e => setAiSearchQuery(e.target.value)} 
                                    placeholder="Contoh: Kapan jadwal libur Idul Fitri 2024 dari pemerintah?"
                                    className="w-full pl-4 pr-32 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" 
                                />
                                <button type="button" onClick={handleAiDraftReplyWithSearch} disabled={isGenerating} className="absolute top-1/2 -translate-y-1/2 right-1.5 flex items-center bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700 text-sm font-medium disabled:opacity-50">
                                    <SparklesIcon className="w-4 h-4 mr-1" />
                                    {isGenerating ? 'Memproses...' : 'Buat Draf'}
                                </button>
                            </div>
                            {aiSearchResults && (
                                <div className="text-xs text-slate-600 pt-2 border-t">
                                    <p className="font-semibold">Sumber yang digunakan AI:</p>
                                    <ul className="list-disc list-inside">
                                        {aiSearchResults.sources.map((s: any, i: number) => (
                                            <li key={i}><a href={s.web?.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{s.web?.title}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Tujuan (Eksternal)</label>
                                <input type="text" name="tujuan" value={formData.tujuan || ''} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Tujuan (Internal)</label>
                                <select name="tujuanUnitKerjaId" value={formData.tujuanUnitKerjaId || ''} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                    <option value="">-- Tidak ada (Surat Eksternal) --</option>
                                    {props.unitKerjaList.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Isi Surat (Ringkasan)</label>
                           <textarea name="ringkasan" value={formData.ringkasan || ''} onChange={handleChange} rows={8} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                       </div>
                       
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Tembusan</label>
                           <textarea name="tembusan" value={formData.tembusan || ''} onChange={handleChange} rows={3} placeholder="Satu tembusan per baris" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
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
                    <label className="block text-sm font-medium text-slate-700">Lampiran</label>
                    <div className="mt-1 flex items-center">
                        <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                            <PaperClipIcon className="w-4 h-4 mr-2 inline-block"/>
                            <span>Pilih File</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple />
                        </label>
                    </div>
                    {attachments.length > 0 && (
                        <div className="mt-2 space-y-1 text-sm">
                            {attachments.map(att => (
                                <div key={att.id} className="flex items-center justify-between p-1 bg-slate-100 rounded">
                                    <span className="truncate">{att.name}</span>
                                    <button type="button" onClick={() => removeAttachment(att.id)} className="ml-2 text-red-500 hover:text-red-700"><XIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>
                    )}
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