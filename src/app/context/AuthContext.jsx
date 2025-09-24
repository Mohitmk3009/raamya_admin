'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        // 1. Check for a successful response FIRST.
        if (!response.ok) {
            // If the server sent an error, try to parse its error message.
            // It might send JSON with a 'message' property, or it might not.
            let errorMessage = `Login failed with status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // The error response wasn't JSON. We can ignore this error
                // and stick with the default status message.
            }
            throw new Error(errorMessage);
        }

        // 2. If the response was successful, THEN parse the JSON body.
        const data = await response.json();

        // 3. Perform your additional checks.
        if (data.role !== 'admin') {
            throw new Error('Access Denied: Not an administrator account.');
        }

        // 4. If everything is fine, save the token and update the state.
        localStorage.setItem('authToken', data.token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        // Use window.location to force a full refresh, clearing all old data
        window.location.href = '/admin/login';
    };

    const value = { isAuthenticated, loading, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

