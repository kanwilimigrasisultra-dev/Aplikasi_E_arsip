import React, { useState, useEffect } from 'react';
import { Pengumuman } from '../types';
import { MegaphoneIcon, XIcon } from './icons';

interface AnnouncementBannerProps {
    pengumumanList: Pengumuman[];
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ pengumumanList }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Reset visibility when announcements change
        setIsVisible(true);
        setCurrentIndex(0);

        if (pengumumanList.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % pengumumanList.length);
            }, 7000); // Change announcement every 7 seconds

            return () => clearInterval(timer);
        }
    }, [pengumumanList]);

    if (!pengumumanList.length || !isVisible) {
        return null;
    }

    const currentPengumuman = pengumumanList[currentIndex];

    return (
        <div className="bg-sky-600 text-white flex items-center justify-between p-2 text-sm flex-shrink-0 relative">
            <div className="flex items-center flex-1 min-w-0">
                <MegaphoneIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                <p className="truncate">{currentPengumuman.teks}</p>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="ml-4 p-1 rounded-full hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Tutup Pengumuman"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default AnnouncementBanner;