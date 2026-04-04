'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface LoadingContextType {
    isLoading: boolean;
    message: string;
    setLoading: (loading: boolean, message?: string) => void;
    withLoading: <T>(fn: () => Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('Please wait a moment');
    const countRef = useRef(0); // Tracks nested loading calls

    const setLoading = useCallback((loading: boolean, msg?: string) => {
        if (loading) {
            countRef.current += 1;
            setMessage(msg || 'Please wait a moment');
            setIsLoading(true);
        } else {
            countRef.current = Math.max(0, countRef.current - 1);
            if (countRef.current === 0) {
                setIsLoading(false);
                setMessage('Please wait a moment');
            }
        }
    }, []);

    // Convenience wrapper: auto start/stop loading around any async function
    const withLoading = useCallback(async <T,>(fn: () => Promise<T>, msg?: string): Promise<T> => {
        setLoading(true, msg);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    return (
        <LoadingContext.Provider value={{ isLoading, message, setLoading, withLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}
