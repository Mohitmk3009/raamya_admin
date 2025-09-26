'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TooltipProps } from 'recharts'; // Import types from recharts
import { useRouter } from 'next/navigation';

// --- Type Definitions for API Data and Component Props ---
interface SalesDataPoint {
    name: string;
    sales: number;
}

interface BestSeller {
    img: string;
    name: string;
    sales: number;
    price: string;
}

interface RecentOrder {
    _id: string;
    createdAt: string;
    user: {
        name: string;
    };
    totalPrice: number;
    status: 'Delivered' | 'Cancelled' | 'Processing' | 'Shipped';
    exchangeRequest?: { // Optional property
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    };
}

interface DashboardStats {
    totalOrders: { value: number; count: number };
    activeOrders: { count: number };
    completedOrders: { count: number };
    exchangedOrders: { count: number };
}

// --- Reusable Icon Components (Unchanged) ---
const TotalOrdersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
        <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2" /><path d="M21 16.5V14a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 14v2.5" /><path d="M3.27 6.96 12 12.01l8.73-5.05" /><line x1="12" x2="12" y1="22.08" y2="12" />
    </svg>
);
const ActiveOrdersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
        <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" /><path d="M14 9h4l4 4v4h-8v-4l-4-4Z" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
);
const CompletedOrdersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const ExchangedOrderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
        <path d="m3 2 8 8-8 8" /><path d="m21 2-8 8 8 8" />
    </svg>
);
const CalendarIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-gray-400">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);

// --- Sales Chart Component ---
interface SalesChartProps {
    data: SalesDataPoint[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    // Correctly type the props for the custom tooltip component
    const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
                    <p className="label text-white font-bold">{`${label}`}</p>
                    <p className="intro text-[#EFAF00]">{`Sales : ₹${payload[0].value?.toLocaleString()}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 256 }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="name" stroke="#A0AEC0" tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                    <YAxis stroke="#A0AEC0" tick={{ fill: '#A0AEC0', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EFAF00', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Line type="monotone" dataKey="sales" stroke="#EFAF00" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Sales" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Main Dashboard Component ---
const DashboardPage = () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    // Add explicit types to your state hooks
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
    const [salesPeriod, setSalesPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                setLoading(false);
                return;
            }
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const [statsRes, sellersRes, ordersRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/dashboard/stats`, { headers }),
                    fetch(`${API_BASE_URL}/dashboard/best-sellers`, { headers }),
                    fetch(`${API_BASE_URL}/dashboard/recent-orders`, { headers }),
                ]);

                if (!statsRes.ok || !sellersRes.ok || !ordersRes.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                // TypeScript now knows the shape of this data
                const statsData: DashboardStats = await statsRes.json();
                const sellersData: BestSeller[] = await sellersRes.json();
                const ordersData: RecentOrder[] = await ordersRes.json();

                setStats(statsData);
                setBestSellers(sellersData);
                setRecentOrders(ordersData);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API_BASE_URL]);

    useEffect(() => {
        const fetchSalesData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/dashboard/sales-graph?period=${salesPeriod}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                 if (!res.ok) {
                    throw new Error('Failed to fetch sales data');
                }
                const data: SalesDataPoint[] = await res.json();
                setSalesData(data);
            } catch (error) {
                console.error(`Failed to fetch ${salesPeriod} sales data:`, error);
            }
        };

        fetchSalesData();
    }, [salesPeriod, API_BASE_URL]);
    
    // Type the 'order' parameter
    const getStatusInfo = (order: RecentOrder) => {
        if (order.exchangeRequest && order.exchangeRequest.status) {
            const exchangeStatus = order.exchangeRequest.status.toUpperCase();
            switch (exchangeStatus) {
                case 'PENDING': return { text: 'Exchange Pending', className: 'text-gray-400 bg-gray-500/10' };
                case 'APPROVED': return { text: 'Exchange Approved', className: 'text-green-400 bg-green-500/10' };
                case 'REJECTED': return { text: 'Exchange Rejected', className: 'text-red-400 bg-red-500/10' };
                case 'COMPLETED': return { text: 'Exchange Completed', className: 'text-blue-400 bg-blue-500/10' };
                default: return { text: `Exchange: ${order.exchangeRequest.status}`, className: 'text-purple-400 bg-purple-500/10' };
            }
        }
        switch (order.status) {
            case 'Delivered': return { text: 'Delivered', className: 'text-green-400 bg-green-500/10' };
            case 'Cancelled': return { text: 'Cancelled', className: 'text-red-400 bg-red-500/10' };
            case 'Processing': return { text: 'Processing', className: 'text-yellow-400 bg-yellow-500/10' };
            case 'Shipped': return { text: 'Shipped', className: 'text-blue-400 bg-blue-500/10' };
            default: return { text: 'Unknown', className: 'text-gray-400 bg-gray-500/10' };
        }
    };
    
    const statsCards = [
        { title: 'Total Orders', value: stats?.totalOrders.value, change: `(${stats?.totalOrders.count || 0} Orders)`, icon: <TotalOrdersIcon />, bgColor: 'bg-sky-500' },
        { title: 'Active Orders', value: stats?.activeOrders.count, icon: <ActiveOrdersIcon />, bgColor: 'bg-blue-500' },
        { title: 'Completed Orders', value: stats?.completedOrders.count, icon: <CompletedOrdersIcon />, bgColor: 'bg-emerald-500' },
        { title: 'Exchanged order', value: stats?.exchangedOrders.count, icon: <ExchangedOrderIcon />, bgColor: 'bg-amber-500' }
    ];
    
    const handleOrderClick = (orderId: string) => {
        router.push(`/admin/orders/${orderId}`);
    };

    if (loading) return <div className="bg-[#1a1a1a] text-white min-h-screen flex items-center justify-center font-sans text-lg">Loading Dashboard Data...</div>

    return (
        <div className="bg-[#1a1a1a] text-white min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <p className="text-sm text-gray-400"><a href="#" className="hover:text-[#EFAF00]">Home</a> &gt; Dashboard</p>
                    <h1 className="text-3xl font-bold text-gray-200 mt-1">Dashboard</h1>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center bg-[#2d2d2d] border border-gray-700 rounded-lg px-4 py-2 text-sm">
                    <CalendarIcon />
                    <span>{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                    <div key={index} className="bg-[#2d2d2d] border border-gray-700 rounded-xl p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                             <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                {stat.icon}
                            </div>
                            <button className="text-gray-500 hover:text-white">...</button>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mt-4">{stat.title}</p>
                            <div className="flex items-end gap-4 mt-1">
                                <p className="text-2xl font-bold text-gray-200">{typeof stat.value === 'number' ? `₹${stat.value.toLocaleString()}` : (stat.value || 0)}</p>
                                {stat.change && <p className="text-gray-400 text-sm font-semibold">{stat.change}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Sale Graph */}
                <div className="lg:col-span-2 bg-[#2d2d2d] border border-gray-700 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg text-gray-200">Sale Graph</h2>
                        <div className="flex gap-2 text-sm">
                             {['weekly', 'monthly', 'yearly'].map(period => (
                                <button 
                                    key={period}
                                    onClick={() => setSalesPeriod(period)}
                                    className={`px-3 py-1 rounded-md transition-colors ${salesPeriod === period ? 'bg-[#EFAF00] text-black font-semibold' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {period.charAt(0).toUpperCase() + period.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SalesChart data={salesData} />
                </div>

                {/* Best Sellers */}
                <div className="bg-[#2d2d2d] border border-gray-700 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg text-gray-200">Best Sellers</h2>
                        <button className="text-gray-500 hover:text-white">...</button>
                    </div>
                    <div className="space-y-4">
                        {bestSellers.map((item) => (
                            <div key={item.name} className="flex items-center gap-4">
                                <img src={item.img} alt={item.name} className="w-10 h-10 rounded-md object-cover" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-300">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.sales} sales</p>
                                </div>
                                <p className="font-semibold text-gray-300">{item.price}</p>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 bg-[#EFAF00] text-black font-bold py-2 rounded-lg hover:bg-amber-500 transition-colors">
                        REPORT
                    </button>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-[#2d2d2d] border border-gray-700 rounded-xl p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg text-gray-200">Recent Orders</h2>
                    <button className="text-gray-500 hover:text-white">...</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-400 border-b border-gray-700">
                            <tr>
                                <th className="p-4">#</th>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Customer Name</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {recentOrders.map((order, index) => {
                                const status = getStatusInfo(order);
                                return (
                                    <tr 
                                        key={order._id} 
                                        className="hover:bg-gray-800/50 cursor-pointer"
                                        onClick={() => handleOrderClick(order._id)}
                                    >
                                        <td className="p-4 text-gray-400">{index + 1}</td>
                                        <td className="p-4 text-gray-300 font-mono">{order._id}</td>
                                        <td className="p-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-300">{order.user?.name || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                                                <span className="mr-1.5 text-lg leading-none">&bull;</span> {status.text}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-300 font-semibold text-right">₹{(order.totalPrice || 0).toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
             {/* Footer */}
            <footer className="text-center text-xs text-gray-500 mt-12 pb-4">
                <p>&copy; 2025 - Raamya Dashboard</p>
                <div className="mt-2 space-x-4">
                    <a href="#" className="hover:text-[#EFAF00]">About</a>
                    <a href="#" className="hover:text-[#EFAF00]">Careers</a>
                    <a href="#" className="hover:text-[#EFAF00]">Policy</a>
                </div>
            </footer>
        </div>
    );
};

export default DashboardPage;