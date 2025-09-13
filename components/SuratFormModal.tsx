import React, { useState, useEffect, useMemo } from 'react';
import { KategoriSurat, SifatSurat, TipeSurat, AnySurat, UnitKerja, User, KlasifikasiSurat, PenomoranSettings, MasalahUtama, JenisSurat } from '../types';
import Modal from './Modal';
import { PaperClipIcon, SparklesIcon } from './icons';
import { GoogleGenAI, Type } from "@google/genai";

interface SuratFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (surat: Omit<AnySurat, 'id' | 'isArchived' | 'disposisi' | 'fileUrl' | 'unitKerjaId'>) => void;
    tipe: TipeSurat;
    kategoriList: KategoriSurat[];
    masalahUtamaList?: MasalahUtama[];
    klasifikasiList?: KlasifikasiSurat[];
    unitKerjaList: UnitKerja[];
    currentUser: User;
    allSurat?: AnySurat[];
    penomoranSettings?: PenomoranSettings;
    suratToEdit?: AnySurat | null;
    initialData?: Partial<AnySurat> | null;
}

const SuratFormModal: React.FC<SuratFormModalProps> = (props) => {
    const { 
        isOpen, onClose, onSubmit, tipe, kategoriList, masalahUtamaList = [], klasifikasiList = [], unitKerjaList, 
        currentUser, allSurat = [], penomoranSettings, suratToEdit, initialData 
    } = props;
    
    const [jenisSurat, setJenisSurat] = useState<JenisSurat>(JenisSurat.BIASA);
    const [nomorSurat, setNomorSurat] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [perihal, setPerihal] = useState('');
    const [isi, setIsi] = useState('');
    const [tujuanEksternal, setTujuanEksternal] = useState('');
    const [tujuanInternalId, setTujuanInternalId] = useState('');
    const [pengirim, setPengirim] = useState('');
    const [kategoriId, setKategoriId] = useState('');
    const [masalahUtamaId, setMasalahUtamaId] = useState('');
    const [klasifikasiId, setKlasifikasiId] = useState('');
    const [sifat, setSifat] = useState<SifatSurat>(SifatSurat.BIASA);
    const [fileName, setFileName] = useState('');
    const [isCategorySuggested, setIsCategorySuggested] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [isiRingkas, setIsiRingkas] = useState('');
    
    const currentUserUnit = useMemo(() => unitKerjaList.find(u => u.id === currentUser.unitKerjaId), [currentUser.unitKerjaId, unitKerjaList]);
    const canSendInternal = tipe === TipeSurat.KELUAR && currentUserUnit?.tipe === 'Pusat';

    // Auto-numbering logic for Surat Keluar
    useEffect(() => {
        if (!isOpen || tipe !== TipeSurat.KELUAR || suratToEdit || !penomoranSettings || !currentUserUnit) {
            return;
        }

        const generateNomorSurat = () => {
            const currentYear = new Date(tanggal).getFullYear();
            const klasifikasi = klasifikasiList.find(k => k.id === klasifikasiId);
            const kantorWilayah = currentUserUnit.tipe === 'Pusat' ? currentUserUnit : unitKerjaList.find(u => u.id === currentUserUnit.indukId);
            
            if (!kantorWilayah) {
                setNomorSurat('Error: Unit Induk tidak ditemukan.');
                return;
            }
             if (!klasifikasiId || !masalahUtamaId) {
                setNomorSurat('Lengkapi Klasifikasi...');
                return;
            }

            const kodeUnitLengkap = currentUserUnit.tipe === 'Pusat' 
                ? currentUserUnit.kode 
                : `${kantorWilayah.kode}.${currentUserUnit.kode}`;

            if (jenisSurat === JenisSurat.SK) {
                const allUnitIdsInRegion = unitKerjaList.filter(u => u.id === kantorWilayah.id || u.indukId === kantorWilayah.id).map(u => u.id);
                
                const suratSKTerkait = allSurat.filter(s => 
                    s.tipe === TipeSurat.KELUAR &&
                    s.jenisSurat === JenisSurat.SK &&
                    new Date(s.tanggal).getFullYear() === currentYear &&
                    allUnitIdsInRegion.includes(s.unitKerjaId)
                );
                
                const lastNomorUrut = suratSKTerkait.reduce((max, s) => {
                    // Regex updated to match format: -123.
                    const match = s.nomorSurat.match(/-(\d+)\./);
                    return (match && match[1]) ? Math.max(max, parseInt(match[1], 10)) : max;
                }, 0);

                const nextNomorUrut = lastNomorUrut + 1;
                
                const nomor = penomoranSettings.sk
                    .replace(/\[KODE_UNIT_LENGKAP\]/g, kodeUnitLengkap)
                    .replace(/\[KODE_KLASIFIKASI_ARSIP\]/g, klasifikasi?.kode || '?')
                    .replace(/\[NOMOR_SURAT_OTOMATIS\]/g, nextNomorUrut.toString())
                    .replace(/\[TAHUN_SAAT_INI\]/g, currentYear.toString());
                
                setNomorSurat(nomor);

            } else { // Surat Biasa
                const suratBiasaTerkait = allSurat.filter(s => 
                    s.tipe === TipeSurat.KELUAR &&
                    s.jenisSurat !== JenisSurat.SK &&
                    new Date(s.tanggal).getFullYear() === currentYear &&
                    s.unitKerjaId === currentUser.unitKerjaId &&
                    s.masalahUtamaId === masalahUtamaId
                );

                const lastNomorUrut = suratBiasaTerkait.reduce((max, s) => {
                    const match = s.nomorSurat.match(/-(\d+)$/);
                    return (match && match[1]) ? Math.max(max, parseInt(match[1], 10)) : max;
                }, 0);
                
                const nextNomorUrut = lastNomorUrut + 1;
                
                const nomor = penomoranSettings.biasa
                    .replace('[KODE_UNIT_LENGKAP]', kodeUnitLengkap)
                    .replace('[KODE_KLASIFIKASI_ARSIP]', klasifikasi?.kode || '?')
                    .replace('[NOMOR_SURAT_OTOMATIS]', nextNomorUrut.toString());

                setNomorSurat(nomor);
            }
        };

        generateNomorSurat();

    }, [isOpen, tipe, suratToEdit, penomoranSettings, jenisSurat, masalahUtamaId, klasifikasiId, tanggal, allSurat, currentUser.unitKerjaId, unitKerjaList, klasifikasiList, currentUserUnit]);


    useEffect(() => {
        if (isOpen) {
             if (suratToEdit) {
                setNomorSurat(suratToEdit.nomorSurat);
                setTanggal(suratToEdit.tanggal);
                setPerihal(suratToEdit.perihal);
                setIsi(suratToEdit.isi || '');
                setKategoriId(suratToEdit.kategoriId || '');
                setMasalahUtamaId(suratToEdit.masalahUtamaId || '');
                setKlasifikasiId(suratToEdit.klasifikasiId || '');
                setSifat(suratToEdit.sifat);
                setJenisSurat(suratToEdit.jenisSurat || JenisSurat.BIASA);
                if (tipe === TipeSurat.MASUK) {
                    setPengirim(suratToEdit.pengirim);
                } else {
                    setTujuanEksternal(suratToEdit.tujuan);
                    setTujuanInternalId(suratToEdit.tujuanUnitKerjaId || '');
                }

            } else if (initialData) {
                setNomorSurat(initialData.nomorSurat || '');
                setTanggal(initialData.tanggal || new Date().toISOString().split('T')[0]);
                setPerihal(initialData.perihal || '');
                setIsi(initialData.isi || '');
                setKategoriId(initialData.kategoriId || '');
                setSifat(initialData.sifat || SifatSurat.BIASA);
                 if (tipe === TipeSurat.MASUK) {
                    setPengirim(initialData.pengirim || '');
                } else {
                    setTujuanEksternal(initialData.tujuan || '');
                }
                // Reset other fields
                setJenisSurat(JenisSurat.BIASA);
                setMasalahUtamaId('');
                setTujuanInternalId('');
                setKlasifikasiId('');
                setFileName('');
                setIsiRingkas('');
                setAiError('');
                setIsCategorySuggested(false);

            } else {
                // Reset form
                setNomorSurat(tipe === TipeSurat.KELUAR ? '...' : '');
                setTanggal(new Date().toISOString().split('T')[0]);
                setPerihal('');
                setIsi('');
                setPengirim('');
                setTujuanEksternal('');
                setTujuanInternalId('');
                setKategoriId('');
                setMasalahUtamaId('');
                setKlasifikasiId('');
                setSifat(SifatSurat.BIASA);
                setJenisSurat(JenisSurat.BIASA);
                setFileName('');
                setIsiRingkas('');
                setAiError('');
                setIsCategorySuggested(false);
            }
        }
    }, [suratToEdit, initialData, isOpen, tipe]);

    const filteredKlasifikasi = useMemo(() => {
        if (!masalahUtamaId) return [];
        return klasifikasiList.filter(k => k.masalahUtamaId === masalahUtamaId);
    }, [masalahUtamaId, klasifikasiList]);


    const categoryKeywordMap = useMemo(() => {
        const map: { [key: string]: string[] } = {};
        kategoriList.forEach(kategori => {
            const name = kategori.nama.toLowerCase();
            if (name.includes('undangan')) map[kategori.id] = ['undang', 'rapat', 'pertemuan', 'meeting'];
            else if (name.includes('pemberitahuan')) map[kategori.id] = ['info', 'pengumuman', 'pemberitahuan', 'edaran', 'notifikasi'];
            else if (name.includes('permohonan')) map[kategori.id] = ['mohon', 'permohonan', 'request', 'izin', 'pengajuan'];
            else if (name.includes('laporan')) map[kategori.id] = ['laporan', 'report', 'evaluasi', 'hasil', 'progress'];
            else if (name.includes('keuangan')) map[kategori.id] = ['tagihan', 'invoice', 'pembayaran', 'anggaran', 'faktur', 'keuangan', 'dana', 'biaya'];
            else if (name.includes('kerjasama')) map[kategori.id] = ['kerjasama', 'mou', 'perjanjian', 'partnership', 'kolaborasi'];
            else if (name.includes('sdm')) map[kategori.id] = ['pegawai', 'karyawan', 'sdm', 'hrd', 'rekrutmen', 'mutasi', 'personalia'];
        });
        return map;
    }, [kategoriList]);

    useEffect(() => {
        if (tipe === TipeSurat.MASUK && !suratToEdit && !kategoriId) {
            const combinedText = `${perihal.toLowerCase()} ${isi.toLowerCase()}`;
            if (combinedText.trim().length < 5) return;

            let suggestedCatId = '';
            for (const catId in categoryKeywordMap) {
                const keywords = categoryKeywordMap[catId];
                if (keywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(combinedText))) {
                    suggestedCatId = catId;
                    break;
                }
            }
            if (suggestedCatId) {
                 setKategoriId(suggestedCatId);
                 setIsCategorySuggested(true);
            }
        }
    }, [perihal, isi, tipe, suratToEdit, kategoriId, categoryKeywordMap]);

    const handleAiAssist = async () => {
        setIsAiLoading(true);
        setAiError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const kategoriNames = kategoriList.map(k => k.nama);
            const sifatOptions = Object.values(SifatSurat);

            const prompt = `
                Anda adalah asisten administrasi yang cerdas untuk aplikasi E-Arsip. Berdasarkan perihal dan isi ringkas surat masuk berikut, bantu saya melengkapi data.
                Perihal Awal: "${perihal}"
                Isi Ringkas Surat: "${isiRingkas}"

                Tugas Anda:
                1. Buat ringkasan (summary) yang jelas dan padat dalam Bahasa Indonesia untuk dijadikan perihal baru. Maksimal 15 kata.
                2. Pilih Kategori yang paling sesuai dari daftar berikut: [${kategoriNames.join(', ')}].
                3. Tentukan Sifat Surat yang paling sesuai dari daftar berikut: [${sifatOptions.join(', ')}].

                Berikan jawaban HANYA dalam format JSON. Pastikan nilai 'categoryName' dan 'sifat' adalah salah satu dari opsi yang diberikan.
            `;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: {
                                type: Type.STRING,
                                description: "Ringkasan perihal surat yang jelas dan padat."
                            },
                            categoryName: {
                                type: Type.STRING,
                                description: `Salah satu dari kategori berikut: ${kategoriNames.join(', ')}`,
                            },
                            sifat: {
                                type: Type.STRING,
                                description: `Salah satu dari sifat surat berikut: ${sifatOptions.join(', ')}`,
                            },
                        },
                        propertyOrdering: ["summary", "categoryName", "sifat"],
                    },
                },
            });

            const jsonString = response.text.trim();
            const result = JSON.parse(jsonString);
            
            if (result.summary) setPerihal(result.summary);

            if (result.categoryName) {
                const matchedKategori = kategoriList.find(k => k.nama.toLowerCase() === result.categoryName.toLowerCase());
                if (matchedKategori) {
                    setKategoriId(matchedKategori.id);
                    setIsCategorySuggested(false); // AI selection is an explicit choice
                }
            }
            
            if (result.sifat && Object.values(SifatSurat).some(s => s.toLowerCase() === result.sifat.toLowerCase())) {
                const matchedSifat = Object.values(SifatSurat).find(s => s.toLowerCase() === result.sifat.toLowerCase());
                if(matchedSifat) setSifat(matchedSifat);
            }

        } catch (error) {
            console.error("AI Assist Error:", error);
            setAiError("Gagal mendapatkan bantuan AI. Silakan coba lagi.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let suratData: Omit<AnySurat, 'id' | 'isArchived' | 'disposisi' | 'fileUrl' | 'unitKerjaId'>;
        
        if (tipe === TipeSurat.KELUAR) {
            suratData = {
                tipe,
                nomorSurat,
                tanggal,
                perihal,
                isi,
                pengirim: currentUserUnit?.nama || 'Internal',
                tujuan: tujuanInternalId ? (unitKerjaList.find(u=>u.id === tujuanInternalId)?.nama || 'Internal') : tujuanEksternal,
                kategoriId: kategoriId || undefined,
                masalahUtamaId: masalahUtamaId || undefined,
                klasifikasiId: klasifikasiId || undefined,
                jenisSurat: jenisSurat,
                sifat,
                tujuanUnitKerjaId: tujuanInternalId || undefined,
            };
        } else { // Surat Masuk
             suratData = {
                tipe,
                nomorSurat,
                tanggal,
                perihal,
                isi,
                pengirim: pengirim,
                tujuan: 'Internal',
                kategoriId: kategoriId || undefined,
                sifat,
            };
        }
        
        onSubmit(suratData);
        onClose();
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    const title = `${suratToEdit ? 'Edit' : 'Tambah'} Surat ${tipe === TipeSurat.MASUK ? 'Masuk' : 'Keluar'}`;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="3xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                {tipe === TipeSurat.KELUAR && (
                    <div className="p-3 bg-slate-50 border rounded-lg space-y-4">
                        <fieldset>
                            <legend className="block text-sm font-medium text-slate-700">Jenis Surat</legend>
                            <div className="mt-2 flex items-center gap-x-6">
                                {Object.values(JenisSurat).map(js => (
                                    <div key={js} className="flex items-center">
                                        <input
                                            id={`jenis-${js}`}
                                            name="jenis-surat"
                                            type="radio"
                                            value={js}
                                            checked={jenisSurat === js}
                                            onChange={() => setJenisSurat(js)}
                                            className="h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500"
                                        />
                                        <label htmlFor={`jenis-${js}`} className="ml-2 block text-sm text-gray-900">{js}</label>
                                    </div>
                                ))}
                            </div>
                        </fieldset>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label htmlFor="masalahUtama" className="block text-sm font-medium text-slate-700">Masalah Utama</label>
                                  <select id="masalahUtama" value={masalahUtamaId} onChange={e => { setMasalahUtamaId(e.target.value); setKlasifikasiId(''); }} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500">
                                      <option value="">Pilih Masalah...</option>
                                      {masalahUtamaList.map(m => <option key={m.id} value={m.id}>{m.kode} - {m.deskripsi}</option>)}
                                  </select>
                              </div>
                               <div>
                                  <label htmlFor="klasifikasi" className="block text-sm font-medium text-slate-700">Klasifikasi Arsip</label>
                                  <select id="klasifikasi" value={klasifikasiId} onChange={e => setKlasifikasiId(e.target.value)} required disabled={!masalahUtamaId} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-200">
                                      <option value="">{masalahUtamaId ? 'Pilih Klasifikasi...' : 'Pilih Masalah Utama Dulu'}</option>
                                      {filteredKlasifikasi.map(k => <option key={k.id} value={k.id}>{k.kode} - {k.deskripsi}</option>)}
                                  </select>
                              </div>
                          </div>
                    </div>
                )}
                
                <div>
                    <label htmlFor="nomorSurat" className="block text-sm font-medium text-slate-700">Nomor Surat</label>
                    <input 
                        type="text" 
                        id="nomorSurat" 
                        value={nomorSurat} 
                        onChange={e => setNomorSurat(e.target.value)} 
                        required 
                        readOnly={tipe === TipeSurat.KELUAR && !suratToEdit}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 read-only:bg-slate-100 read-only:text-slate-600 font-mono" 
                    />
                </div>
                
                <div className="flex items-end gap-2">
                    <div className="flex-grow">
                        <label htmlFor="perihal" className="block text-sm font-medium text-slate-700">Perihal</label>
                        <input type="text" id="perihal" value={perihal} onChange={e => setPerihal(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    {tipe === TipeSurat.MASUK && (
                        <button 
                            type="button" 
                            onClick={handleAiAssist}
                            disabled={isAiLoading || (!perihal && !isiRingkas)}
                            className="flex-shrink-0 flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                            aria-label="Dapatkan bantuan AI untuk mengisi form"
                        >
                            {isAiLoading ? (
                                <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-4 h-4 mr-2" />
                                    Bantuan AI
                                </>
                            )}
                        </button>
                    )}
                </div>
                 
                {tipe === TipeSurat.MASUK && (
                     <div>
                        <label htmlFor="isiRingkas" className="block text-sm font-medium text-slate-700">Isi Ringkas Surat (untuk Bantuan AI)</label>
                        <textarea id="isiRingkas" value={isiRingkas} onChange={e => setIsiRingkas(e.target.value)} rows={3} placeholder="Salin-tempel atau tulis isi ringkas surat di sini untuk mendapatkan perihal, kategori, dan sifat surat otomatis..." className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"></textarea>
                        {aiError && <p className="text-sm text-red-600 mt-1">{aiError}</p>}
                    </div>
                )}
                
                <div>
                    <label htmlFor="isi" className="block text-sm font-medium text-slate-700">Isi Surat</label>
                    <textarea id="isi" value={isi} onChange={e => setIsi(e.target.value)} rows={tipe === TipeSurat.KELUAR ? 8 : 4} placeholder={tipe === TipeSurat.KELUAR ? "Tulis isi lengkap surat di sini..." : "Isi atau catatan singkat (opsional)..."} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"></textarea>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="tanggal" className="block text-sm font-medium text-slate-700">Tanggal Surat</label>
                        <input type="date" id="tanggal" value={tanggal} onChange={e => setTanggal(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                    </div>
                    {tipe === TipeSurat.MASUK && (
                        <div>
                            <label htmlFor="pengirim" className="block text-sm font-medium text-slate-700">Pengirim</label>
                            <input type="text" id="pengirim" value={pengirim} onChange={e => setPengirim(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                    )}
                 </div>
                 
                 {tipe === TipeSurat.KELUAR && (
                    <div className="bg-slate-50 p-3 rounded-md border">
                        <p className="text-sm font-medium text-slate-800 mb-2">Tujuan Surat</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {canSendInternal && (
                             <div>
                                <label htmlFor="tujuanInternalId" className="block text-sm font-medium text-slate-700">Tujuan Internal (Cabang)</label>
                                 <select id="tujuanInternalId" value={tujuanInternalId} onChange={e => setTujuanInternalId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                                    <option value="">Pilih Kantor Cabang</option>
                                    {unitKerjaList.filter(u => u.tipe === 'Cabang').map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                             <label htmlFor="tujuanEksternal" className="block text-sm font-medium text-slate-700">Tujuan Eksternal</label>
                            <input type="text" id="tujuanEksternal" value={tujuanEksternal} onChange={e => setTujuanEksternal(e.target.value)} required={!tujuanInternalId} disabled={!!tujuanInternalId} placeholder={tujuanInternalId ? 'Tujuan internal dipilih' : ''} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-200" />
                        </div>

                        </div>
                    </div>
                 )}


                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="kategori" className="block text-sm font-medium text-slate-700">
                           Kategori
                           {isCategorySuggested && <span className="ml-2 text-xs font-normal text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Disarankan</span>}
                        </label>
                        <select id="kategori" value={kategoriId} onChange={e => { setKategoriId(e.target.value); setIsCategorySuggested(false); }} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                            <option value="">Pilih Kategori (Opsional)</option>
                            {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sifat" className="block text-sm font-medium text-slate-700">Sifat Surat</label>
                        <select id="sifat" value={sifat} onChange={e => setSifat(e.target.value as SifatSurat)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                            {Object.values(SifatSurat).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-700">Lampiran File</label>
                     <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <PaperClipIcon className="mx-auto h-10 w-10 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500">
                                    <span>Unggah file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx" />
                                </label>
                                <p className="pl-1">atau seret dan lepas</p>
                            </div>
                            <p className="text-xs text-gray-500">PDF, DOCX, atau Excel (maks. 150MB)</p>
                            {fileName && <p className="text-xs text-emerald-600 font-semibold pt-2">{fileName}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700">
                        {suratToEdit ? 'Simpan Perubahan' : 'Simpan Surat'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SuratFormModal;
