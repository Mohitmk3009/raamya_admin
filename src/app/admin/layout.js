'use client';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
export default function AdminLayout({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // This useEffect is the security guard. It runs when auth state changes.
    useEffect(() => {
        // If loading is finished AND the user is NOT authenticated...
        if (!loading && !isAuthenticated) {
            // ...and they are NOT on the login page...
            if (pathname !== '/admin/login') {
                // ...then redirect them to the login page.
                router.push('/admin/login');
            }
        }
    }, [isAuthenticated, loading, router, pathname]);

    // --- THIS IS THE CRITICAL FIX ---
    // If the current page is the login page, render it directly without the layout.
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // While checking authentication, show a loading screen.
    if (loading || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#121212] text-white">
                Authenticating...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#1a1a1a] text-gray-300 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header /> {/* Add the Header component here */}
                <main className=" flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}