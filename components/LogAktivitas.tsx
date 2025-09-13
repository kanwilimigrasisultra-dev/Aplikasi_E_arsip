import React from 'react';
import { ActivityLog } from '../types';
import { ClipboardListIcon, ClockIcon } from './icons';

interface LogAktivitasProps {
    activityLogs: ActivityLog[];
}

const LogAktivitas: React.FC<LogAktivitasProps> = ({ activityLogs }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center mb-4">
                <ClipboardListIcon className="w-6 h-6 mr-3 text-sky-700" />
                <h3 className="text-lg font-semibold text-slate-800">Log Aktivitas Sistem</h3>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                {activityLogs.length > 0 ? activityLogs.map(log => (
                    <div key={log.id} className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-b-0">
                         <div className="mt-1 p-1.5 bg-slate-100 rounded-full">
                            <ClockIcon className="w-4 h-4 text-slate-500"/>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-800">{log.action}</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date(log.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} oleh {log.user}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-sm text-slate-500 py-4">Belum ada aktivitas yang tercatat.</p>
                )}
            </div>
        </div>
    );
};

export default LogAktivitas;
