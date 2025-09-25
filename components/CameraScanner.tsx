import React, { useRef, useEffect, useState } from 'react';
import Modal from './Modal';
import { CameraIcon, XIcon } from './icons';

interface CameraScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageDataUrl: string) => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        let mediaStream: MediaStream;

        const startCamera = async () => {
            if (!isOpen) return;
            try {
                // Stop any previous stream
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
                mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setError(null);
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin dan tidak ada aplikasi lain yang sedang menggunakannya.");
            }
        };

        startCamera();

        return () => {
            // Cleanup function to stop the stream when the component unmounts or modal closes
            const stopStream = (s: MediaStream | null) => {
                if (s) {
                    s.getTracks().forEach(track => track.stop());
                }
            };
            stopStream(mediaStream);
            stopStream(stream);
            setStream(null);
        };
    }, [isOpen]);
    
    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageDataUrl = canvas.toDataURL('image/jpeg');
                onCapture(imageDataUrl);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pindai Dokumen" size="2xl">
            <div className="relative">
                {error ? (
                    <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg bg-black"></video>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-11/12 h-5/6 border-4 border-white border-dashed opacity-50 rounded-lg"></div>
                        </div>
                    </>
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
             <div className="flex justify-center mt-4">
                <button 
                    onClick={handleCapture} 
                    disabled={!!error || !stream}
                    className="flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-slate-300 hover:border-sky-500 disabled:opacity-50"
                    aria-label="Ambil Gambar"
                >
                    <div className="w-12 h-12 bg-sky-600 rounded-full"></div>
                </button>
            </div>
        </Modal>
    );
};

export default CameraScanner;
