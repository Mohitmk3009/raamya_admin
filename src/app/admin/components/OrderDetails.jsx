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
            const res = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
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

    const handleStatusUpdate = async (action) => {
        const token = localStorage.getItem('authToken');
        const endpoint = action === 'pay' ? 'pay' : 'deliver';
        const confirmationMessage = `Are you sure you want to mark this order as ${action === 'pay' ? 'paid' : 'delivered'}?`;

        if (window.confirm(confirmationMessage)) {
            try {
                const res = await fetch(`${API_BASE_URL}/orders/${orderId}/${endpoint}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Failed to mark as ${endpoint}.`);
                fetchOrderDetails(); // Refresh data after update
            } catch (err) {
                alert(err.message);
            }
        }
    };

    if (loading) return <div className="p-10 text-center">Loading order details...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
    if (!order) return <div className="p-10 text-center">Order not found.</div>;

    const subtotal = order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);

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
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.isDelivered ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {order.isDelivered ? 'Completed' : 'Pending'}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-2">📅</span> {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    {!order.isDelivered && <button onClick={() => handleStatusUpdate('deliver')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold">Mark as Delivered</button>}
                    {!order.isPaid && <button onClick={() => handleStatusUpdate('pay')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold">Mark as Paid</button>}
                </div>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3A3A]">
                    <h3 className="flex items-center text-gray-400 mb-2"><span className="mr-2">👤</span> Customer</h3>
                    <p className="text-gray-200 font-semibold">{order?.shippingAddress?.fullName}</p>
                    <p className="text-gray-400 text-sm">Email: {order?.user?.email}</p>
                    <p className="text-gray-400 text-sm">Phone: {order?.shippingAddress?.phone}</p>
                </div>
                <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3A3A]">
                    <h3 className="flex items-center text-gray-400 mb-2"><span className="mr-2">📦</span> Order Info</h3>
                    <p className="text-gray-200 font-semibold">Payment Method: {order.paymentMethod}</p>
                    <p className="text-gray-400 text-sm">Status: <span className={order.isPaid ? 'text-green-400' : 'text-red-400'}>{order.isPaid ? 'Paid' : 'Awaiting Payment'}</span></p>
                </div>
                <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3A3A]">
                    <h3 className="flex items-center text-gray-400 mb-2"><span className="mr-2">🏠</span> Deliver to</h3>
                    <p className="text-gray-200 font-semibold">{`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`}</p>
                </div>
            </section>

            <section className="bg-[#1C1C1C] rounded-lg p-4 md:p-6 border border-[#3A3A3A]">
                <h2 className="text-lg font-semibold text-gray-200 mb-4">Products</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 text-sm border-b border-[#3A3A3A]">
                                <th className="py-3 px-2 font-normal">Sr No.</th>
                                <th className="py-3 px-2 font-normal">Product</th>
                                <th className="py-3 px-2 font-normal text-center">Quantity</th>
                                <th className="py-3 px-2 font-normal text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item, index) => (
                                <tr key={item._id || item.product}>
                                    <td className="py-4 px-2 text-sm">{index + 1}.</td>
                                    <td className="py-4 px-2 flex items-center space-x-4">
                                        <img src={item.image} alt={item.name} className="w-12 h-16 bg-gray-600 rounded object-cover" />
                                        <div>
                                            <p className="text-sm font-semibold">{item.name}</p>
                                            <p className="text-xs text-gray-400">Size: {item.size}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2 text-sm text-center">{item.qty}</td>
                                    <td className="py-4 px-2 text-sm text-right font-semibold">₹{(item.price * item.qty).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-6 flex justify-end">
                        <div className="text-right text-sm w-full max-w-xs space-y-2">
                            <p className="flex justify-between text-gray-400"><span>Subtotal:</span><span>₹{subtotal.toLocaleString()}</span></p>
                            <p className="flex justify-between text-gray-400"><span>Shipping:</span><span>₹{order.shippingPrice.toLocaleString()}</span></p>
                            <p className="text-lg font-bold mt-2 flex justify-between pt-2 border-t border-gray-700"><span>Total:</span><span className="text-[#FF9900]">₹{order.totalPrice.toLocaleString()}</span></p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OrderDetailsPage;

