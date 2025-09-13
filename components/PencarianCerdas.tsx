import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AnySurat, KategoriSurat, TipeSurat, SifatSurat } from '../types';
import { SearchIcon, SparklesIcon } from './icons';

interface PencarianCerdasProps {
    allSurat: AnySurat[];
    kategoriList: KategoriSurat[];
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

const PencarianCerdas: React.FC<PencarianCerdasProps> = ({ allSurat, kategoriList }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<AnySurat[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setResults([]);
        setError(null);
        setHasSearched(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Prepare a simplified dataset for the AI model
            const suratDataset = allSurat.map(s => ({
                id: s.id,
                type: s.tipe,
                subject: s.perihal,
                // Add more relevant fields for better matching
                summary: s.tipe === TipeSurat.KELUAR ? s.ringkasan : (s.isiRingkasAI || ''),
                from: s.tipe === TipeSurat.MASUK ? s.pengirim : s.pembuat.nama,
                to: s.tipe === TipeSurat.KELUAR ? s.tujuan : 'Internal',
            }));

            const schema = {
                type: Type.OBJECT,
                properties: {
                    relevant_ids: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'An array of string IDs for the documents that are most relevant to the user query.'
                    }
                },
                required: ['relevant_ids']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `User query: "${query}". Search the following JSON dataset of letters and return the IDs of the most relevant ones. Match based on semantic meaning, not just keywords. Dataset: ${JSON.stringify(suratDataset)}`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                }
            });
            
            const result = JSON.parse(response.text.trim());
            const relevantIds: string[] = result.relevant_ids || [];

            const foundSurat = allSurat.filter(s => relevantIds.includes(s.id));
            setResults(foundSurat);

        } catch (err) {
            console.error("AI search error:", err);
            setError("Gagal melakukan pencarian dengan AI. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-center mb-2">
                    <SparklesIcon className="w-6 h-6 mr-3 text-slate-700" />
                    <h3 className="text-xl font-bold text-slate-800">Pencarian Cerdas</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Gunakan bahasa natural untuk menemukan surat yang Anda cari. AI akan memahami konteksnya.</p>
                <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Contoh: surat undangan rapat dari kementerian bulan lalu..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                    <button onClick={handleSearch} disabled={isLoading} className="bg-slate-700 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow disabled:opacity-50 disabled:cursor-wait">
                        {isLoading ? 'Mencari...' : 'Cari'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 min-h-[400px]">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <svg className="animate-spin h-8 w-8 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-3">AI sedang menganalisis...</p>
                    </div>
                )}
                {error && <p className="text-center text-red-600">{error}</p>}
                {!isLoading && hasSearched && results.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                         <SearchIcon className="w-12 h-12 text-slate-300" />
                         <p className="mt-3 font-semibold">Tidak ada hasil ditemukan</p>
                         <p className="text-sm">Coba gunakan kata kunci atau deskripsi yang berbeda.</p>
                    </div>
                )}
                {!isLoading && results.length > 0 && (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Tipe</th>
                                    <th scope="col" className="px-6 py-3">Nomor Surat</th>
                                    <th scope="col" className="px-6 py-3">Perihal</th>
                                    <th scope="col" className="px-6 py-3">Sifat</th>
                                    <th scope="col" className="px-6 py-3">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map(surat => (
                                    <tr key={surat.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                surat.tipe === TipeSurat.MASUK 
                                                ? 'bg-sky-100 text-sky-800' 
                                                : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {surat.tipe === TipeSurat.MASUK ? 'Masuk' : 'Keluar'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{surat.nomorSurat}</td>
                                        <td className="px-6 py-4">{surat.perihal}</td>
                                        <td className="px-6 py-4">{getSifatBadge(surat.sifat)}</td>
                                        <td className="px-6 py-4">{new Date(surat.tanggal).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {!isLoading && !hasSearched && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                         <p>Hasil pencarian Anda akan muncul di sini.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default PencarianCerdas;