

import React, { useState, useRef, useEffect } from 'react';
import { Notifikasi } from '../types';
import { BellIcon } from './icons';

interface NotificationBellProps {
    notifications: Notifikasi[];
    onNotificationClick: (suratId: string, notifId: string) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onNotificationClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleToggle = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative text-slate-500 hover:text-sky-600 transition-colors">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-30">
                    <div className="p-3 border-b">
                        <h4 className="font-semibold text-sm text-slate-800">Notifikasi</h4>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(notif => (
                            <button 
                                key={notif.id} 
                                onClick={() => {
                                    onNotificationClick(notif.suratId, notif.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full p-3 flex items-start space-x-3 text-left hover:bg-slate-50 ${!notif.isRead ? 'bg-sky-50' : ''}`}
                            >
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-sky-500' : 'bg-transparent'}`}></div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-700">{notif.pesan}</p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(notif.tanggal).toLocaleDateString()}</p>
                                </div>
                            </button>
                        )) : (
                            <p className="text-center text-sm text-slate-500 p-4">Tidak ada notifikasi</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;