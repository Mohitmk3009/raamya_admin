'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '../../components/ProductForm';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AddProductPage = () => {
    const router = useRouter();

    const handleCreate = async (formData) => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Failed to create product.');
            router.push('/admin/products');
        } catch (error) {
            alert(error.message);
        }
    };

    return <ProductForm onSubmit={handleCreate} isUpdate={false} />;
};

export default AddProductPage;