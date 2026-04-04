'use client';

import { useLoading } from '@/context/LoadingContext';
import { Loader2 } from 'lucide-react';

export default function LoadingOverlay() {
    const { isLoading, message } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-60 animate-pulse" />

                {/* Spinner Card */}
                <div className="relative bg-white px-8 py-6 rounded-3xl shadow-2xl border border-green-100 flex flex-col items-center gap-4">
                    <div className="relative">
                        {/* Outer ring */}
                        <div className="w-14 h-14 rounded-full border-4 border-green-100" />
                        {/* Spinning arc */}
                        <Loader2 className="w-14 h-14 text-green-600 animate-spin absolute inset-0" />
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <span className="text-gray-900 font-bold text-base tracking-tight">Loading</span>
                        <span className="text-gray-400 text-xs font-medium animate-pulse max-w-[180px]">
                            {message}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress shimmer bar */}
            <div className="mt-8 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
            </div>

            <style>{`
                @keyframes shimmer {
                    0%   { transform: translateX(-200%); width: 40%; }
                    50%  { width: 70%; }
                    100% { transform: translateX(400%); width: 40%; }
                }
            `}</style>
        </div>
    );
}
