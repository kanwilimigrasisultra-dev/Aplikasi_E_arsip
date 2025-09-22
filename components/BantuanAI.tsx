
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
// FIX: Changed to import AIChatMessage to resolve type conflict.
import { AIChatMessage } from '../types';
import Modal from './Modal';
import { SparklesIcon, PaperAirplaneIcon } from './icons';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const BantuanAI: React.FC = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    // FIX: Updated state to use the correct AIChatMessage type.
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const systemInstruction = `
        Anda adalah Asisten AI yang sangat membantu untuk aplikasi persuratan digital bernama "STAR E-ARSIM SULTRA".
        Tugas Anda adalah menjawab pertanyaan pengguna tentang cara menggunakan aplikasi ini.
        Gunakan Bahasa Indonesia yang ramah, jelas, dan singkat.

        Berikut adalah ringkasan fitur aplikasi yang harus Anda ketahui:
        1.  **Surat Masuk:** Pengguna dapat menambahkan surat masuk, melampirkan file, dan yang terpenting, membuat "disposisi". Disposisi adalah perintah atau instruksi yang ditujukan kepada pengguna lain untuk menindaklanjuti surat tersebut.
        2.  **Surat Keluar:** Pengguna (Staf) dapat membuat draf surat keluar. Surat ini harus melalui alur persetujuan bertingkat: pertama oleh Manajerial, kemudian oleh Pimpinan. Pimpinan atau Manajerial dapat menyetujui atau menolak (Revisi). Setelah disetujui, surat dapat ditandatangani secara digital (TTE, QR Code, atau gambar) dan statusnya menjadi "Terkirim".
        3.  **Nota Dinas:** Ini adalah surat internal antar pengguna di dalam sistem.
        4.  **Arsip:** Surat yang sudah selesai diproses (baik masuk maupun keluar) dapat diarsipkan ke dalam folder-folder digital.
        5.  **Manajemen Tugas:** Pengguna dapat membuat tugas spesifik yang terkait dengan surat tertentu dan menugaskannya kepada pengguna lain.
        6.  **Laporan:** Pengguna dapat membuat laporan PDF dari data surat masuk/keluar berdasarkan periode waktu.
        7.  **Pencarian Cerdas:** Sebuah fitur pencarian berbasis AI yang memungkinkan pengguna mencari surat menggunakan bahasa natural.
        8.  **Keamanan:** Aplikasi memiliki fitur watermark dinamis pada pratinjau dokumen dan mendukung Tanda Tangan Elektronik (TTE) tersertifikasi untuk keabsahan hukum.
        9.  **Administrasi (untuk Admin/Pimpinan):** Menu ini digunakan untuk mengelola pengguna, unit kerja, kategori surat, dan melihat analitik kinerja.

        Selalu jawab dalam konteks fitur-fitur ini. Jika pertanyaan di luar konteks aplikasi, katakan bahwa Anda hanya bisa membantu dengan pertanyaan seputar aplikasi E-Arsip.
    `;
    
     useEffect(() => {
        if (isModalOpen && messages.length === 0) {
            setMessages([
                { role: 'model', text: 'Halo! Saya Asisten AI. Apa yang bisa saya bantu terkait penggunaan aplikasi E-Arsip SULTRA?' }
            ]);
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (query?: string) => {
        const messageText = query || userInput;
        if (!messageText.trim() || isLoading) return;

        // FIX: Ensured newMessages array is typed correctly with AIChatMessage.
        const newMessages: AIChatMessage[] = [...messages, { role: 'user', text: messageText }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: messageText,
                config: {
                    systemInstruction: systemInstruction,
                },
            });
            const aiResponseText = response.text;
            setMessages([...newMessages, { role: 'model', text: aiResponseText }]);
        } catch (error) {
            console.error("AI help error:", error);
            setMessages([...newMessages, { role: 'model', text: "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };
    
    const exampleQuestions = [
        "Bagaimana cara membuat disposisi?",
        "Apa saja alur persetujuan surat keluar?",
        "Bagaimana cara mengarsipkan surat?",
        "Apa itu TTE tersertifikasi?",
    ];

    return (
        <>
            <button
                onClick={() => setModalOpen(true)}
                className="fixed bottom-6 right-6 bg-slate-800 text-white rounded-full p-4 shadow-lg hover:bg-slate-900 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 z-40"
                aria-label="Buka Asisten Bantuan AI"
            >
                <QuestionMarkCircleIcon className="w-8 h-8" />
            </button>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Asisten AI Bantuan" size="lg">
                <div className="flex flex-col h-[65vh]">
                    <div ref={chatContainerRef} className="flex-1 space-y-4 p-4 overflow-y-auto bg-slate-50 rounded-t-md">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                        <SparklesIcon className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-white border'}`}>
                                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-end gap-2">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                    <SparklesIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="max-w-xs p-3 rounded-lg bg-white border">
                                    <div className="flex items-center space-x-1">
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                         {messages.length <= 1 && (
                            <div className="pt-4 text-center text-xs text-slate-500">
                                <p className="font-semibold mb-2">Contoh pertanyaan:</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                {exampleQuestions.map(q => (
                                    <button key={q} onClick={() => handleSendMessage(q)} className="px-2 py-1 bg-white border rounded-full hover:bg-slate-100">{q}</button>
                                ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t flex items-center gap-2 bg-white rounded-b-md">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ketik pertanyaan Anda di sini..."
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-sky-500"
                        />
                        <button onClick={() => handleSendMessage()} disabled={isLoading || !userInput.trim()} className="bg-slate-700 text-white rounded-full p-3 hover:bg-slate-800 disabled:bg-slate-400">
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default BantuanAI;
