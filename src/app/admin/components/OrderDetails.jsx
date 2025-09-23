'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const OrderDetailsPage = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const params = useParams();
    const { orderId } = params;

    const fetchOrderDetails = async () => {
        const token = localStorage.getItem('authToken');
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Could not fetch order details.');
            const data = await res.json();
            setOrder(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);
    
    // --- NEW: Helper function for status styling ---
    const getStatusChip = (status) => {
        switch (status) {
            case 'Processing': return { text: 'Processing', className: 'bg-yellow-500/20 text-yellow-400' };
            case 'Shipped': return { text: 'Shipped', className: 'bg-blue-500/20 text-blue-400' };
            case 'Delivered': return { text: 'Delivered', className: 'bg-green-500/20 text-green-400' };
            case 'Cancelled': return { text: 'Cancelled', className: 'bg-red-500/20 text-red-400' };
            default: return { text: 'Pending', className: 'bg-gray-500/20 text-gray-400' };
        }
    };

    const handleStatusUpdate = async (action, exchangeId = null) => {
        const token = localStorage.getItem('authToken');
        let endpoint = '';
        let body = {};

        // Determine if it's an order update or an exchange update
        if (['pay', 'deliver'].includes(action)) {
            endpoint = `/orders/${orderId}/${action}`;
        } else if (['Approved', 'Rejected', 'Completed'].includes(action) && exchangeId) {
            endpoint = `/exchanges/${exchangeId}`;
            body.status = action;
        } else {
            return;
        }

        if (window.confirm(`Are you sure you want to perform this action?`)) {
            try {
                const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: Object.keys(body).length > 0 ? JSON.stringify(body) : null,
                });
                if (!res.ok) throw new Error(`Failed to update status.`);
                fetchOrderDetails(); // Refresh data after update
            } catch (err) {
                alert(err.message);
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Loading order details...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
    if (!order) return <div className="p-10 text-center">Order not found.</div>;

    const subtotal = order.orderItems.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 0), 0);
    const statusInfo = getStatusChip(order.status);
    const exchangeStatusInfo = order.exchangeRequest ? getStatusChip(order.exchangeRequest.status) : null;


    return (
        <div className="bg-[#121212] w-full min-h-screen text-white p-6 md:p-10 font-sans">
            <header className="mb-6">
                <Link href="/admin/orders" className="text-sm text-[#FF9900] hover:underline">&larr; Back to Order List</Link>
                <h1 className="text-xl md:text-2xl font-bold mt-2">Orders Details</h1>
                <p className="text-gray-400 text-sm">Home &gt; Order List &gt; Order Details</p>
            </header>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1C1C1C] p-4 rounded-lg mb-6 border border-[#3A3A3A]">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <h2 className="text-lg font-semibold text-gray-200">Order ID: {order._id}</h2>
                    {/* --- UPDATED: Using status field --- */}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                        {statusInfo.text}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-2">📅</span> {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && <button onClick={() => handleStatusUpdate('deliver')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold">Mark as Delivered</button>}
                    {!order.isPaid && <button onClick={() => handleStatusUpdate('pay')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold">Mark as Paid</button>}
                </div>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* --- UPDATED: Grid layout now accommodates 4 cards --- */}
                <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3A3A]">
                    <h3 className="flex items-center text-gray-400 mb-2"><span className="mr-2">👤</span> Customer</h3>
                    <p className="text-gray-200 font-semibold">{order?.shippingAddress?.fullName}</p>
                    <p className="text-gray-400 text-sm">Email: {order?.user?.email}</p>
                    <p className="text-gray-400 text-sm">Phone: {order?.shippingAddress?.phone}</p>
                </div>

                <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3A3A]">
                    <h3 className="flex items-center text-gray-400 mb-2"><span className="mr-2">📦</span> Order Info</h3>
                    <p className="text-gray-400 text-sm">Order Status: <span className={statusInfo.className}>{statusInfo.text}</span></p>
                    <p className="text-gray-400 text-sm">Payment Status: <span className={order.isPaid ? 'text-green-400' : 'text-red-400'}>{order.isPaid ? 'Paid' : 'Awaiting Payment'}</span></p>
                    
                    {/* --- NEW: Conditionally show cancellation details --- */}
                    {order.status === 'Cancelled' && (
                        <div className="mt-4 pt-4 border-t border-[#3A3A3A]">
                            <h4 className="flex items-center text-red-400 mb-2 font-semibold"><span className="mr-2">🚫</span> Cancellation</h4>
                            <p className="text-gray-400 text-xs">Date: {new Date(order.cancelledAt).toLocaleString()}</p>
                            <p className="text-gray-400 text-xs">Reason: {order.cancellationReason?.reason}</p>
                        </div>
                    )}
                </div>

                <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3A3A]">
                    <h3 className="flex items-center text-gray-400 mb-2"><span className="mr-2">🏠</span> Deliver to</h3>
                    <p className="text-gray-200 font-semibold">{`${order.shippingAddress.address}, ${order.shippingAddress.city}`}</p>
                     <p className="text-gray-400 text-sm">{`${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`}</p>
                </div>

                {/* --- NEW: Conditionally show exchange request card --- */}
                {order.exchangeRequest && (
                    <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3A3A]">
                        <h3 className="flex items-center text-gray-400 mb-2"><span className="mr-2">🔄</span> Exchange Request</h3>
                        <p className="text-gray-400 text-sm">Status: <span className={exchangeStatusInfo.className}>{exchangeStatusInfo.text}</span></p>
                        <p className="text-gray-400 text-sm">Reason: {order.exchangeRequest.reason}</p>
                        
                        {order.exchangeRequest.status === 'Pending' && (
                           <div className="mt-4 pt-4 border-t border-[#3A3A3A] flex gap-2">
                               <button onClick={() => handleStatusUpdate('Approved', order.exchangeRequest._id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-semibold w-full">Approve</button>
                               <button onClick={() => handleStatusUpdate('Rejected', order.exchangeRequest._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-semibold w-full">Reject</button>
                           </div>
                        )}
                    </div>
                )}
            </section>
            
            <section className="bg-[#1C1C1C] rounded-lg p-4 md:p-6 border border-[#3A3A3A]">
                {/* Product table remains the same */}
            </section>
        </div>
    );
};

export default OrderDetailsPage;