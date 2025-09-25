import React, { useState, useMemo } from 'react';
import { AnySurat, Tugas, PerjalananDinas, User, CalendarEvent, TipeSurat, SuratMasuk, StatusDisposisi, SifatDisposisi } from '../types';
import { CalendarIcon, ClockIcon } from './icons';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface KalenderProps {
    allSurat: AnySurat[];
    allTugas: Tugas[];
    perjalananDinasList: PerjalananDinas[];
    currentUser: User;
}

const Kalender: React.FC<KalenderProps> = ({ allSurat, allTugas, perjalananDinasList, currentUser }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const events = useMemo(() => {
        const calendarEvents: CalendarEvent[] = [];

        // 1. Process Tugas
        allTugas.forEach(tugas => {
            if (tugas.ditugaskanKepada.id === currentUser.id && tugas.status !== 'Selesai') {
                calendarEvents.push({
                    id: `tugas-${tugas.id}`,
                    title: tugas.deskripsi,
                    startDate: tugas.tanggalJatuhTempo,
                    endDate: tugas.tanggalJatuhTempo,
                    type: 'Tugas',
                    linkId: tugas.suratId,
                    description: `Tugas dari surat: ${allSurat.find(s => s.id === tugas.suratId)?.nomorSurat || 'N/A'}`
                });
            }
        });

        // 2. Process Disposisi (that require action)
        const suratMasuk = allSurat.filter(s => s.tipe === TipeSurat.MASUK) as SuratMasuk[];
        suratMasuk.forEach(surat => {
            surat.disposisi.forEach(d => {
                if (d.tujuan.id === currentUser.id && d.status === StatusDisposisi.DIPROSES && d.sifat !== SifatDisposisi.BIASA) {
                     calendarEvents.push({
                        id: `disposisi-${d.id}`,
                        title: `Disposisi: ${surat.perihal}`,
                        startDate: d.tanggal,
                        endDate: d.tanggal, // Dispositions are single-day events for simplicity
                        type: 'Disposisi',
                        linkId: surat.id,
                        description: d.catatan,
                    });
                }
            })
        });

        // 3. Process Perjalanan Dinas
        perjalananDinasList.forEach(pd => {
            if (pd.pegawaiUtamaId === currentUser.id || pd.pengikut.some(p => p.userId === currentUser.id)) {
                calendarEvents.push({
                    id: `pd-${pd.id}`,
                    title: `Perjalanan Dinas: ${pd.kotaTujuan}`,
                    startDate: pd.tanggalBerangkat,
                    endDate: pd.tanggalKembali,
                    type: 'Perjalanan Dinas',
                    linkId: pd.suratTugasId,
                    description: pd.tujuanPerjalanan
                });
            }
        });

        return calendarEvents;
    }, [allSurat, allTugas, perjalananDinasList, currentUser]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const getEventColor = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'Tugas': return 'bg-amber-500 border-amber-600';
            case 'Disposisi': return 'bg-red-500 border-red-600';
            case 'Perjalanan Dinas': return 'bg-sky-500 border-sky-600';
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <CalendarIcon className="w-6 h-6 mr-3 text-slate-700" />
                    <h3 className="text-xl font-bold text-slate-800">Kalender Agenda</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={handlePrevMonth} className="p-1.5 rounded-full hover:bg-slate-100"><ChevronLeftIcon className="w-5 h-5 text-slate-600"/></button>
                    <h4 className="text-lg font-semibold text-slate-700 w-40 text-center">{currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h4>
                    <button onClick={handleNextMonth} className="p-1.5 rounded-full hover:bg-slate-100"><ChevronRightIcon className="w-5 h-5 text-slate-600"/></button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center font-semibold text-sm text-slate-600 border-b border-t py-2">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 flex-grow gap-px bg-slate-200 border-l border-r border-b">
                {days.map(d => {
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                    const isToday = new Date().toDateString() === d.toDateString();
                    const dayEvents = events.filter(e => {
                        const startDate = new Date(e.startDate);
                        const endDate = new Date(e.endDate);
                        startDate.setHours(0,0,0,0);
                        endDate.setHours(23,59,59,999);
                        return d >= startDate && d <= endDate;
                    });
                    
                    return (
                        <div key={d.toISOString()} className={`relative p-2 ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'} flex flex-col`}>
                            <span className={`self-end text-xs font-medium ${isToday ? 'bg-slate-800 text-white rounded-full h-5 w-5 flex items-center justify-center' : (isCurrentMonth ? 'text-slate-700' : 'text-slate-400')}`}>{d.getDate()}</span>
                            <div className="flex-grow space-y-1 mt-1 overflow-y-auto">
                                {dayEvents.map(event => (
                                     <div key={event.id} className={`p-1 text-white text-xs rounded-md truncate cursor-pointer ${getEventColor(event.type)}`} title={event.title}>
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Kalender;