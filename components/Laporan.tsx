import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { AnySurat, KategoriSurat, KopSuratSettings, UnitKerja, User, TipeSurat } from '../types';
import LaporanPDFTemplate from './LaporanPDFTemplate';
import { ClipboardListIcon } from './icons';

declare const html2pdf: any;

interface LaporanProps {
    allSurat: AnySurat[];
    allKategori: KategoriSurat[];
    allUsers: User[];
    kopSuratSettings: KopSuratSettings;
    unitKerjaList: UnitKerja[];
    currentUser: User;
}

type ReportType = 'surat_masuk' | 'surat_keluar' | 'nota_dinas' | 'rekapitulasi';

const Laporan: React.FC<LaporanProps> = (props) => {
    const [reportType, setReportType] = useState<ReportType>('surat_masuk');
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedReportData, setGeneratedReportData] = useState<AnySurat[] | null>(null);

    const pdfTemplateContainerRef = useRef<HTMLDivElement>(null);

    const handleGenerateReport = async () => {
        setIsLoading(true);

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the whole end day

        const filteredSurat = props.allSurat.filter(s => {
            const suratDate = new Date(s.tanggal);
            const isWithinDateRange = suratDate >= start && suratDate <= end;
            if (!isWithinDateRange) return false;

            if (reportType === 'surat_masuk') return s.tipe === TipeSurat.MASUK;
            if (reportType === 'surat_keluar') return s.tipe === TipeSurat.KELUAR;
            if (reportType === 'nota_dinas') return s.tipe === TipeSurat.NOTA_DINAS;
            return true; // For rekapitulasi, include all within date range
        });
        
        setGeneratedReportData(filteredSurat);

        // Allow React to render the template with new data
        setTimeout(() => {
            if (pdfTemplateContainerRef.current) {
                const element = pdfTemplateContainerRef.current;
                const opt = {
                    margin:       0.5,
                    filename:     `laporan_${reportType}_${startDate}_${endDate}.pdf`,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true },
                    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
                };
                html2pdf().from(element).set(opt).save().then(() => {
                    setIsLoading(false);
                    setGeneratedReportData(null); // Clean up after generation
                });
            }
        }, 100);
    };


    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-center mb-2">
                    <ClipboardListIcon className="w-6 h-6 mr-3 text-slate-700" />
                    <h3 className="text-xl font-bold text-slate-800">Pusat Laporan</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Buat laporan PDF untuk surat masuk, surat keluar, atau rekapitulasi data surat berdasarkan periode waktu tertentu.</p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-slate-50 rounded-lg border">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Laporan</label>
                        <select value={reportType} onChange={e => setReportType(e.target.value as ReportType)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white">
                            <option value="surat_masuk">Laporan Surat Masuk</option>
                            <option value="surat_keluar">Laporan Surat Keluar</option>
                            <option value="nota_dinas">Laporan Nota Dinas</option>
                            <option value="rekapitulasi">Rekapitulasi Surat</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Akhir</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" />
                    </div>
                    <div>
                        <button onClick={handleGenerateReport} disabled={isLoading} className="w-full flex items-center justify-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow disabled:bg-slate-400">
                            {isLoading ? 'Membuat Laporan...' : 'Buat Laporan PDF'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden container for PDF template */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                {generatedReportData && (
                    <div ref={pdfTemplateContainerRef}>
                        <LaporanPDFTemplate
                            data={generatedReportData}
                            reportType={reportType}
                            startDate={startDate}
                            endDate={endDate}
                            {...props}
                        />
                    </div>
                )}
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 min-h-[40vh] flex items-center justify-center">
                <div className="text-center text-slate-400">
                     <ClipboardListIcon className="w-12 h-12 mx-auto" />
                    <p className="mt-2 font-semibold">Siap Membuat Laporan</p>
                    <p className="text-sm">Pilih jenis laporan dan rentang tanggal, lalu klik tombol "Buat Laporan PDF".</p>
                </div>
             </div>
        </div>
    );
};

export default Laporan;
