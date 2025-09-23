'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleChange = (e:any) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            router.push('/admin/dashboard'); // Redirect on success
        } catch (err:any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#121212] font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-[#1C1C1C] rounded-lg border border-[#3A3A3A] shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[#FF9900]">RAAMYA</h1>
                    <p className="mt-2 text-gray-400">Admin Panel Login</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-3 border-2 border-[#3A3A3A] bg-[#2C2C2C] text-white rounded-md" placeholder="Email address" />
                    <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full px-3 py-3 border-2 border-[#3A3A3A] bg-[#2C2C2C] text-white rounded-md" placeholder="Password" />
                    {error && <div className="text-center p-3 bg-red-500/10 rounded-md"><p className="text-sm text-red-400">{error}</p></div>}
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-black bg-[#FF9900] hover:bg-opacity-90 disabled:bg-gray-500">{loading ? 'Signing In...' : 'Sign In'}</button>
                </form>
            </div>
        </div>
    );
}