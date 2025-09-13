import React, { useState, useEffect, useRef } from 'react';
import { RefreshIcon, OfficeBuildingIcon } from './icons';
import { BrandingSettings } from '../types';

interface LoginPageProps {
    onLogin: (email: string) => void;
    brandingSettings: BrandingSettings;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, brandingSettings }) => {
    const [email, setEmail] = useState('eka.w@example.com');
    const [password, setPassword] = useState('password');
    const [captcha, setCaptcha] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateCaptcha = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let newCaptcha = '';
        for (let i = 0; i < 6; i++) {
            newCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(newCaptcha);
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (captchaInput.toLowerCase() !== captcha.toLowerCase()) {
            setError('Kode verifikasi tidak cocok.');
            generateCaptcha();
            setCaptchaInput('');
            return;
        }
        
        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            if (email && password) {
                onLogin(email);
            } else {
                setError('Email dan password harus diisi.');
            }
            setIsLoading(false);
        }, 1000);
    };
    
    const CaptchaImage = ({ code }: { code: string }) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const width = 150;
            const height = 40;
            canvas.width = width;
            canvas.height = height;

            // Background
            ctx.fillStyle = '#f1f5f9'; // bg-slate-100
            ctx.fillRect(0, 0, width, height);
            
            // Draw lines
            for (let i = 0; i < 5; i++) {
                ctx.strokeStyle = `rgba(46, 70, 158, 0.2)`;
                ctx.beginPath();
                ctx.moveTo(Math.random() * width, Math.random() * height);
                ctx.lineTo(Math.random() * width, Math.random() * height);
                ctx.stroke();
            }

            // Draw text
            for (let i = 0; i < code.length; i++) {
                const char = code[i];
                ctx.font = `bold ${Math.random() * 10 + 20}px Arial`;
                ctx.fillStyle = `rgba(30, 41, 59, ${Math.random() * 0.5 + 0.5})`; // slate-800
                const x = 15 + i * 20;
                const y = 25 + Math.random() * 10 - 5;
                const rotation = Math.random() * 0.4 - 0.2; // -0.2 to 0.2 rad
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                ctx.fillText(char, 0, 0);
                ctx.restore();
            }

        }, [code]);

        return <canvas ref={canvasRef} className="rounded-md" />;
    };


    const loginLogos = [brandingSettings.loginLogo1Url, brandingSettings.loginLogo2Url, brandingSettings.loginLogo3Url];

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden">
                {/* Left Panel */}
                <div className="w-1/2 bg-slate-800 p-12 text-white flex-col justify-center items-center hidden md:flex">
                    <div className="flex justify-center items-center space-x-6 mb-8">
                        {loginLogos.map((logoUrl, index) => (
                            logoUrl ? (
                                <img key={index} src={logoUrl} alt={`Logo Login ${index + 1}`} className="h-16 object-contain" />
                            ) : (
                                <OfficeBuildingIcon key={index} className="h-16 w-16 text-slate-400" />
                            )
                        ))}
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl font-bold">STAR E-ARSIM SULTRA</h1>
                        <p className="mt-4 text-slate-300">Smart Technology, Adaptive, and Resposive Application</p>
                        <p className="text-slate-300">Elektronik Arsip Imigrasi Sulawesi Tenggara</p>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Login ke Akun Anda</h2>
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="verifikasi" className="block text-sm font-medium text-gray-700">Verifikasi</label>
                            <div className="mt-1 flex items-center space-x-2">
                                <div className="p-1 border border-gray-300 rounded-md bg-slate-100">
                                     <CaptchaImage code={captcha} />
                                </div>
                                <button type="button" onClick={() => { generateCaptcha(); setCaptchaInput(''); }} className="p-2 text-gray-500 hover:text-slate-700">
                                    <RefreshIcon className="w-5 h-5" />
                                </button>
                                <input
                                    id="verifikasi"
                                    type="text"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500"
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400"
                            >
                                {isLoading ? 'Memproses...' : 'LOG IN'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;