'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- ICONS ---
const ChevronRightIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const ChevronLeftIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const CustomCalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" 
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 
      00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CustomChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" 
    fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M19 9l-7 7-7-7" />
  </svg>
);

// --- MAIN PAGE COMPONENT ---
export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  const router = useRouter();

  // --- Fetch Orders ---
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({ pageNumber: currentPage });

      if (dateRange.startDate && dateRange.endDate) {
        params.append('startDate', new Date(dateRange.startDate).toISOString());
        params.append('endDate', new Date(dateRange.endDate).toISOString());
      }

      try {
        const res = await fetch(`${API_BASE_URL}/orders/all?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch orders. Ensure you are logged in as an admin.');
        const data = await res.json();
        setOrders(data.orders);
        setCurrentPage(data.page);
        setTotalPages(data.pages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage, dateRange]);

  // --- Close calendar on outside click ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const handleFilterApply = () => {
    setCurrentPage(1);
    setShowCalendar(false);
  };

  const resetFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  const handleOrderClick = (orderId) => {
    router.push(`/admin/orders/${orderId}`);
  };

  if (loading) return <div className="p-10 text-center">Loading orders...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="bg-[#121212] min-h-screen text-white p-6 md:p-10 font-sans">
      {/* --- Header --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Orders List</h1>
          <p className="text-gray-400 text-sm">Home &gt; Order List</p>
        </div>

        {/* --- Date Filter --- */}
        <div className="flex items-center space-x-2 mt-4 md:mt-0 relative">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`flex items-center p-2 rounded-md border text-sm
              ${dateRange.startDate && dateRange.endDate
                ? "bg-[#FF9900] text-black border-[#FF9900]"
                : "bg-[#252525] border-[#3A3A3A] text-white"}`}
          >
            <CustomCalendarIcon />
            <span className="ml-2">
              {dateRange.startDate && dateRange.endDate
                ? `${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`
                : "Filter by Date"}
            </span>
            <CustomChevronDownIcon />
          </button>

          {/* --- Calendar Dropdown --- */}
          {showCalendar && (
            <div ref={calendarRef} className="absolute top-12 right-0 z-10 bg-[#2C2C2C] p-4 rounded-lg shadow-lg">
              <div className="flex flex-col space-y-2">
                <label className="text-sm">Start Date</label>
                <input type="date" className="bg-[#1C1C1C] p-2 rounded"
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))} />
                <label className="text-sm">End Date</label>
                <input type="date" className="bg-[#1C1C1C] p-2 rounded"
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))} />
                <button onClick={handleFilterApply}
                  className="bg-[#FF9900] text-black px-4 py-2 rounded-md text-sm font-semibold mt-2">
                  Apply
                </button>
              </div>
            </div>
          )}

          <button onClick={resetFilters}
            className="bg-[#FF9900] text-black px-4 py-2 rounded-md text-sm font-semibold">
            Default
          </button>
        </div>
      </header>

      {/* --- Orders Table --- */}
      <main className="bg-[#1C1C1C] rounded-lg p-4 md:p-6 border border-[#3A3A3A]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-[#3A3A3A]">
                <th className="py-3 px-2 font-normal">Sr No.</th>
                <th className="py-3 px-2 font-normal">Order ID</th>
                <th className="py-3 px-2 font-normal">Date</th>
                <th className="py-3 px-2 font-normal">Customer Name</th>
                <th className="py-3 px-2 font-normal">Status</th>
                <th className="py-3 px-2 font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id} className="cursor-pointer hover:bg-[#2C2C2C]"
                  onClick={() => handleOrderClick(order._id)}>
                  <td className="py-4 px-2 text-sm">{(currentPage - 1) * 10 + index + 1}</td>
                  <td className="py-4 px-2 text-sm font-mono">{order._id}</td>
                  <td className="py-4 px-2 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-2 text-sm">{order.user?.name || 'User not found'}</td>
                  <td className="py-4 px-2 text-sm">
                    <div className={`flex items-center w-fit px-2 py-1 rounded-full text-xs font-semibold
                      ${order.isDelivered ? 'bg-[#1C3224] text-[#4AD379]' : 'bg-[#3A241C] text-[#FF9900]'}`}>
                      <span className={`w-2 h-2 rounded-full mr-2 
                        ${order.isDelivered ? 'bg-[#4AD379]' : 'bg-[#FF9900]'}`}></span>
                      {order.isDelivered ? 'Delivered' : 'Processing'}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-sm">₹{order.totalPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- Pagination --- */}
      <div className="flex justify-start md:justify-end items-center mt-6">
        <div className="flex items-center space-x-2">
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
            className="p-2 rounded-md border border-[#3A3A3A] bg-[#2C2C2C] disabled:opacity-50">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-[#3A3A3A] bg-[#2C2C2C] disabled:opacity-50">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}