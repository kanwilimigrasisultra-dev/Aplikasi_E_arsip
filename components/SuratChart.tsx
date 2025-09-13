import React, { useEffect, useRef } from 'react';
import { AnySurat, TipeSurat } from '../types';

declare const Chart: any;

interface SuratChartProps {
    allSurat: AnySurat[];
}

const SuratChart: React.FC<SuratChartProps> = ({ allSurat }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Data processing
        const now = new Date();
        const labels: string[] = [];
        const suratMasukData: number[] = new Array(12).fill(0);
        const suratKeluarData: number[] = new Array(12).fill(0);
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleString('id-ID', { month: 'short', year: '2-digit'}));
        }

        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

        allSurat.forEach(surat => {
            const suratDate = new Date(surat.tanggal);
            if (suratDate >= twelveMonthsAgo) {
                const monthDiff = (now.getFullYear() - suratDate.getFullYear()) * 12 + (now.getMonth() - suratDate.getMonth());
                if (monthDiff >= 0 && monthDiff < 12) {
                    const index = 11 - monthDiff;
                    if (surat.tipe === TipeSurat.MASUK) {
                        suratMasukData[index]++;
                    } else if (surat.tipe === TipeSurat.KELUAR) {
                        suratKeluarData[index]++;
                    }
                }
            }
        });

        // Chart rendering
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Surat Masuk',
                            data: suratMasukData,
                            backgroundColor: 'rgba(59, 130, 246, 0.7)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 1,
                            borderRadius: 4,
                        },
                        {
                            label: 'Surat Keluar',
                            data: suratKeluarData,
                            backgroundColor: 'rgba(245, 158, 11, 0.7)',
                            borderColor: 'rgba(245, 158, 11, 1)',
                            borderWidth: 1,
                            borderRadius: 4,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            align: 'end',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(203, 213, 225, 0.5)'
                            },
                             ticks: {
                                stepSize: 1
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        // Cleanup on component unmount
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };

    }, [allSurat]);

    return <canvas ref={canvasRef}></canvas>;
};

export default SuratChart;