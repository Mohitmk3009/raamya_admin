'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Header = () => {
    const { logout } = useAuth();
    const [adminName, setAdminName] = useState('Admin');

    useEffect(() => {
        const fetchAdminName = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const res = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setAdminName(data.name.toUpperCase());
                }
            } catch (error) {
                console.error("Could not fetch admin name");
            }
        };
        fetchAdminName();
    }, []);

    return (
        <header className="bg-black flex items-center justify-end p-4 border-b border-gray-800">
            <div className="flex items-center space-x-4">
                {/* <button className="text-yellow-400 hover:text-yellow-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                </button> */}
                <div className="relative">
                    <button className="flex items-center space-x-2 border border-yellow-400 text-yellow-400 px-3 py-1 rounded-md">
                        <span className="font-semibold text-sm">{adminName}</span>
                        {/* <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg> */}
                    </button>
                    {/* A dropdown menu can be added here for profile/logout */}
                </div>
                 <button onClick={logout} className="bg-red-600 text-white px-3 py-2 text-sm font-semibold rounded-lg hover:bg-red-700">
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;