'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // 1. Add state to manage password visibility
    const [passwordVisible, setPasswordVisible] = useState(false); 
    const router = useRouter();
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            router.push('/admin/dashboard');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 2. Function to toggle the password visibility state
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
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
                    
                    {/* 3. Wrap the password input and button in a relative container */}
                    <div className="relative">
                        <input 
                            name="password" 
                            // 4. Set the input type based on the state
                            type={passwordVisible ? "text" : "password"} 
                            required 
                            value={formData.password} 
                            onChange={handleChange} 
                            className="w-full px-3 py-3 border-2 border-[#3A3A3A] bg-[#2C2C2C] text-white rounded-md" 
                            placeholder="Password" 
                        />
                        {/* 5. The toggle button with the eye icon */}
                        <button 
                            type="button" 
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                        >
                            {passwordVisible ? (
                                // Eye-slashed icon (password is visible)
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.75 9.75" />
                                </svg>
                            ) : (
                                // Eye icon (password is hidden)
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5s-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {error && <div className="text-center p-3 bg-red-500/10 rounded-md"><p className="text-sm text-red-400">{error}</p></div>}
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-black bg-[#FF9900] hover:bg-opacity-90 disabled:bg-gray-500">{loading ? 'Signing In...' : 'Sign In'}</button>
                </form>
            </div>
        </div>
    );
}