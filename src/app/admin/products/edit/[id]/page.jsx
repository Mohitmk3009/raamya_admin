'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm from '../../../components/ProductForm'; // Adjust path for nested folder
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const EditProductPage = () => {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const [product, setProduct] = useState(null);

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                const res = await fetch(`${API_BASE_URL}/products/${id}`);
                const data = await res.json();
                // Map backend data to frontend form state
                setProduct({
                    productName: data.name,
                    regularPrice: data.price,
                    description: data.description,
                    images: data.images,
                    category: data.category,
                    variants: data.variants || [{ size: 'S', stock: '' }],
                });
            };
            fetchProduct();
        }
    }, [id]);

    const handleUpdate = async (formData) => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Failed to update product.');
            router.push('/admin/products');
        } catch (error) {
            alert(error.message);
        }
    };
    
    // Render the form only when the product data has been loaded
    return product ? <ProductForm onSubmit={handleUpdate} initialProduct={product} isUpdate={true} /> : <div className="p-10 text-center">Loading product details...</div>;
};

export default EditProductPage;