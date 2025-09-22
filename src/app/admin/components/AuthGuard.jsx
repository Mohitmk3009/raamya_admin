'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const withAuth = (WrappedComponent) => {
    return (props) => {
        const { isAuthenticated, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading && !isAuthenticated) {
                router.push('/admin/login');
            }
        }, [isAuthenticated, loading, router]);

        if (loading || !isAuthenticated) {
            // You can show a loading spinner here
            return <div className="flex h-screen items-center justify-center bg-[#121212]">Loading...</div>;
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
