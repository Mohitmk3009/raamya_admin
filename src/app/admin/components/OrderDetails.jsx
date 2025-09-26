'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

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

    const handleDownloadBill = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}/generate-bill`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) {
                // If the response is an error, it might be JSON, so we handle it separately.
                // It's a good practice to first check the Content-Type.
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to download bill.');
                } else {
                    throw new Error('Failed to download bill. Server returned an unexpected response.');
                }
            }

            // CORRECT WAY: Get the PDF as a blob, not JSON
            const blob = await res.blob();

            // Create a temporary link to download the blob
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Raamya-E-Bill-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Bill downloaded successfully!");

        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error(err);
        }
    };

    // Calculate subtotal from order items
    const subtotal = order?.orderItems?.reduce((acc, item) => acc + (item.price * item.qty), 0) || 0;


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
                    <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3A3A] col-span-1 md:col-span-2">
                        <div className='flex justify-between items-center mb-2'>
                            <div>
                            <h3 className="flex items-center text-gray-400 mb-2">
                                <span className="mr-2">🔄</span> Exchange Request
                            </h3>
                            <div className="space-y-1 text-sm mb-4">
                                {/* ... other details like status and reason ... */}
                                <p className="text-gray-400">
                                    Status: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exchangeStatusInfo.className}`}>{exchangeStatusInfo.text}</span>
                                </p>
                                <p className="text-gray-400">
                                    Reason: <span className="text-gray-200">{order.exchangeRequest.reason}</span>
                                </p>
                            </div>
                        </div>


                        {/* ✅ CORRECTED LOGIC: 
            This block now ONLY runs if order.exchangeRequest exists, preventing the error.
        */}
                        {order.exchangeRequest.imageUrls && order.exchangeRequest.imageUrls.length > 0 && (
                            <div className="">
                                <p className="text-gray-400 text-sm mb-2 text-end font-semibold">Attached Images</p>
                                <div className="flex flex-wrap gap-3">
                                    {order.exchangeRequest.imageUrls.map((url, index) => (
                                        <a key={index} href={url} target="_blank" rel="noopener noreferrer" title="View full image">
                                            <Image
                                                src={url}
                                                alt={`Exchange attachment ${index + 1}`}
                                                width={100}
                                                height={100}
                                                className="rounded-md object-cover hover:opacity-80 transition-opacity"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>
                        

                        {/* ... Approve/Reject buttons ... */}
                        {order.exchangeRequest.status === 'Pending' && (
                            <div className="mt-4 pt-4 border-t border-[#3A3A3A] flex gap-2">
                                <button onClick={() => handleStatusUpdate('Approved', order.exchangeRequest._id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-md text-xs font-semibold w-full">Approve</button>
                                <button onClick={() => handleStatusUpdate('Rejected', order.exchangeRequest._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-md text-xs font-semibold w-full">Reject</button>
                            </div>
                        )}

                        {/* This is the new button that appears only when the request is 'Approved' */}
                        {order.exchangeRequest.status === 'Approved' && (
                            <div className="mt-4 pt-4 border-t border-[#3A3A3A] flex gap-2">
                                <button
                                    onClick={() => handleStatusUpdate('Completed', order.exchangeRequest._id)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-md text-xs font-semibold w-full"
                                >
                                    Mark as Exchange Delivered (Complete)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <section className="bg-[#1C1C1C] rounded-lg p-4 md:p-6 border border-[#3A3A3A]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Products</h3>
                    <button onClick={handleDownloadBill} className="bg-[#FF9900] text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-yellow-600 transition-colors">
                        Download Bill
                    </button>
                </div>
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
                            <span>&#8377;{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400 text-xs">Including Gst</span>

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