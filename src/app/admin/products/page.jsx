'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AllProducts = () => {
    // --- CHANGE 1: Renamed state for clarity ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // --- CHANGE 2: Added state for total pages from the API ---
    const [totalPages, setTotalPages] = useState(0);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    // --- CHANGE 3: Updated productsPerPage to 12 ---
    const productsPerPage = 12;

    // --- CHANGE 4: Modified fetchProducts to handle pagination ---
    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Pass currentPage and productsPerPage as query params to the API
            const res = await fetch(`${API_BASE_URL}/products?pageNumber=${currentPage}&pageSize=${productsPerPage}`);
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            
            // Set products and total pages from the API response
            setProducts(data.products || []);
            setTotalPages(data.pages || 0);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- CHANGE 5: Added currentPage to dependency array ---
    // This will re-run the fetchProducts function whenever currentPage changes.
    useEffect(() => {
        fetchProducts();
    }, [currentPage]);

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const token = localStorage.getItem('authToken');
            try {
                const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) throw new Error((await res.json()).message || 'Delete failed');
                // Refresh the list after deleting
                if (products.length === 1 && currentPage > 1) {
                    // If it was the last item on a page, go to the previous page
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchProducts();
                }
            } catch (error) {
                alert(error.message);
            }
        }
        setOpenDropdownId(null);
    };

    // --- CHANGE 6: Removed client-side slicing logic ---
    // The backend now handles this, so we just display the `products` we receive.
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div className="p-10 text-center">Loading products...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="bg-[#121212] min-h-screen text-white p-6 md:p-10 font-sans">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold">All Products</h1>
                    <p className="text-gray-400 text-sm">Home &gt; All Products</p>
                </div>
                <Link href="/admin/products/add" className="bg-[#FF9900] text-black px-4 py-2 rounded-md text-sm font-semibold mt-4 md:mt-0">
                    + ADD NEW PRODUCT
                </Link>
            </header>

            <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* --- CHANGE 7: Map directly over `products` state --- */}
                {products.map((product) => (
                    <div key={product._id} className="bg-[#1C1C1C] rounded-lg p-4 border border-[#3A3A3A] relative">
                        <div className="flex justify-between items-start mb-4">
                            <Image width={100} height={100} src={product.images[0]} alt={product.name} className="flex-shrink-0 w-24 h-24 bg-gray-600 rounded-md object-cover" />
                            <button onClick={() => setOpenDropdownId(openDropdownId === product._id ? null : product._id)} className="text-gray-400 text-xl focus:outline-none"> ⋮ </button>
                            {openDropdownId === product._id && (
                                <div className="absolute right-0 top-12 mt-2 w-32 bg-[#2C2C2C] rounded-md shadow-lg z-10">
                                    <ul className="py-1 text-sm text-gray-400">
                                        <li>
                                            <Link href={`/admin/products/edit/${product._id}`} className="flex items-center w-full px-4 py-2 hover:bg-[#3A3A3A]">
                                                Update
                                            </Link>
                                        </li>
                                        <li>
                                            <button onClick={() => handleDelete(product._id)} className="flex items-center w-full px-4 py-2 hover:bg-[#3A3A3A]">
                                                Delete
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-200">{product.name}</h3>
                        <p className="text-[#FF9900] font-bold text-lg mb-4">₹{product.price}</p>
                        <p className="text-gray-400 text-sm">Total Stock: {product.variants.reduce((total, v) => total + v.stock, 0)}</p>
                    </div>
                ))}
            </main>

            {/* --- Pagination: Now uses `totalPages` from state --- */}
            <div className="flex justify-start md:justify-end items-center mt-6">
                <div className="flex items-center space-x-2">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md border border-[#3A3A3A] bg-[#2C2C2C] text-gray-400 hover:bg-[#3A3A3A] disabled:opacity-50">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i + 1} onClick={() => paginate(i + 1)} className={`px-4 py-2 rounded-md text-sm font-semibold ${currentPage === i + 1 ? 'bg-[#FF9900] text-black' : 'bg-[#2C2C2C] text-gray-400 border border-[#3A3A3A] hover:bg-[#3A3A3A]'}`}>
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md border border-[#3A3A3A] bg-[#2C2C2C] text-gray-400 hover:bg-[#3A3A3A] disabled:opacity-50">
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllProducts;