'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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

    const getStatusChip = (status) => {
        switch (status) {
            case 'Processing': return { text: 'Processing', className: 'bg-yellow-500/20 text-yellow-400' };
            case 'Shipped': return { text: 'Shipped', className: 'bg-blue-500/20 text-blue-400' };
            case 'Delivered': return { text: 'Delivered', className: 'bg-green-500/20 text-green-400' };
            case 'Cancelled': return { text: 'Cancelled', className: 'bg-red-500/20 text-red-400' };
            // Exchange Statuses
            case 'Pending': return { text: 'Pending', className: 'bg-gray-500/20 text-gray-400' };
            case 'Approved': return { text: 'Approved', className: 'bg-green-500/20 text-green-400' };
            case 'Rejected': return { text: 'Rejected', className: 'bg-red-500/20 text-red-400' };
            case 'Completed': return { text: 'Completed', className: 'bg-blue-500/20 text-blue-400' };
            default: return { text: 'Unknown', className: 'bg-gray-700 text-gray-300' };
        }
    };

    const handleStatusUpdate = async (action, exchangeId = null) => {
        const token = localStorage.getItem('authToken');
        let endpoint = '';
        let body = {};

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
                fetchOrderDetails();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Loading order details...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
    if (!order) return <div className="p-10 text-center">Order not found.</div>;

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
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                        {statusInfo.text}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-2">📅</span>
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                        })}
                    </div>
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && <button onClick={() => handleStatusUpdate('deliver')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold">Mark as Delivered</button>}
                    {!order.isPaid && <button onClick={() => handleStatusUpdate('pay')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold">Mark as Paid</button>}
                </div>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

                <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3A3A]">
                    <h3 className="flex items-center text-gray-400 mb-2"><span className="mr-2">💳</span> Payment Info</h3>
                    <p className="text-gray-200 font-semibold">Method: {order.paymentMethod}</p>
                    <p className="text-gray-400 text-sm">Card: **** **** **** {order.paymentResult?.last4 || 'N/A'}</p>
                    <p className="text-gray-400 text-sm">Name: {order?.shippingAddress?.fullName}</p>
                </div>

                {order.exchangeRequest && (
                    <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3A3A] col-span-1 md:col-span-2 lg:col-span-1">
                        <h3 className="flex items-center text-gray-400 mb-2"><span className="mr-2">🔄</span> Exchange Request</h3>
                        <div className='flex justify-between gap-4'>
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-400">
                                    Requested on: <span className="text-gray-200">{new Date(order.exchangeRequest.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </p>
                                <p className="text-gray-400">
                                    Status: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exchangeStatusInfo.className}`}>{exchangeStatusInfo.text}</span>
                                </p>
                                <p className="text-gray-400">
                                    Reason: <span className="text-gray-200">{order.exchangeRequest.reason}</span>
                                </p>

                            </div>

                            {order.exchangeRequest.imageUrl && (
                                <div className=" flex flex-col items-start">
                                    <p className="text-gray-400 text-sm mb-2 font-semibold">Attached Image:</p>
                                    <a href={order.exchangeRequest.imageUrl} target="_blank" rel="noopener noreferrer">
                                        <Image src={order.exchangeRequest.imageUrl} alt="Exchange request attachment" width={100} height={100} className="rounded-md object-cover hover:opacity-80 transition-opacity" />
                                    </a>
                                </div>
                            )}
                        </div>


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
                <h3 className="text-xl font-bold mb-4">Products</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#3A3A3A]">
                                <th className="p-3 text-sm font-semibold text-gray-400">Product Name</th>
                                <th className="p-3 text-sm font-semibold text-gray-400">Product ID</th>
                                <th className="p-3 text-sm font-semibold text-gray-400 text-center">Quantity</th>
                                <th className="p-3 text-sm font-semibold text-gray-400 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item) => (
                                <tr key={item._id} className="border-b border-[#3A3A3A] last:border-none">
                                    <td className="p-3 flex items-center gap-4">
                                        <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md object-cover" />
                                        <span>{item.name}</span>
                                    </td>
                                    <td className="p-3 text-gray-400">{item.product}</td>
                                    <td className="p-3 text-center">{item.qty}</td>
                                    <td className="p-3 text-right font-semibold">₹{((item.price || 0) * (item.qty || 0)).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                    <div className="w-full max-w-sm space-y-2 text-gray-300">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Subtotal</span>
                            <span>₹{(order.itemsPrice || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Tax ({order.taxRate || 20}%)</span>
                            <span>₹{(order.taxPrice || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Shipping</span>
                            <span>₹{(order.shippingPrice || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 mt-2 border-t border-[#3A3A3A] text-lg font-bold text-white">
                            <span>Total</span>
                            <span>₹{(order.totalPrice || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OrderDetailsPage;