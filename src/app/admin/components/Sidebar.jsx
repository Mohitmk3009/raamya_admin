// 'use client';
// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAuth } from '../../context/AuthContext';

// const Sidebar = () => {
//     const pathname = usePathname();
//     const { logout } = useAuth();

//     const sidebarLinks = [
//         { name: 'Dashboard', href: '/admin/dashboard' },
//         { name: 'All Products', href: '/admin/products' },
//         { name: 'Order List', href: '/admin/orders' },
//         // { name: 'Add Product', href: '/admin/products/add' },
//     ];

//     return (
//         <aside className="bg-gray-900 w-64 p-6 flex-col space-y-8 hidden md:flex rounded-lg m-2">
//             <h1 className="text-xl font-bold tracking-wide">RAAMYA</h1>
//             <nav className="flex-1 flex flex-col justify-between">
//                 <ul className="space-y-2">
//                     {sidebarLinks.map((link) => (
//                         <li key={link.name}>
//                             <Link href={link.href}
//                                 className={`flex items-center w-full text-left p-3 rounded-xl transition-colors duration-200 ${
//                                     pathname.startsWith(link.href) ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'
//                                 }`}
//                             >
//                                 <span>{link.name}</span>
//                             </Link>
//                         </li>
//                     ))}
//                 </ul>
//                 <button
//                     onClick={logout}
//                     className="flex items-center w-full text-left p-3 rounded-xl text-red-400 hover:bg-gray-800"
//                 >
//                     Logout
//                 </button>
//             </nav>
//         </aside>
//     );
// };

// export default Sidebar;
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Sidebar = () => {
    const pathname = usePathname();
    const [categoryCounts, setCategoryCounts] = useState([]);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

    useEffect(() => {
        const fetchCategoryCounts = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const res = await fetch(`${API_BASE_URL}/products/categories/counts`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setCategoryCounts(data);
            } catch (error) {
                console.error("Could not fetch category counts");
            }
        };
        fetchCategoryCounts();
    }, []);
    
    const navItems = [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/products', label: 'All Products' },
        { href: '/admin/orders', label: 'Order List' },
    ];

    return (
        <aside className="w-64 bg-black p-6 hidden md:flex flex-col border-r border-gray-800">
            <h1 className="text-3xl font-bold text-yellow-400 mb-12">RAAMYA</h1>
            <nav>
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <li key={item.href}>
                            <Link href={item.href} className={`flex items-center py-3 px-4 rounded-lg text-sm font-semibold transition-colors ${pathname === item.href ? 'bg-white text-black' : 'text-gray-400 hover:bg-gray-800'}`}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            
            {/* Categories Section */}
            <div className="mt-8">
                <button onClick={() => setIsCategoriesOpen(!isCategoriesOpen)} className="flex justify-between items-center w-full text-yellow-400 font-bold mb-4">
                    <span>Categories</span>
                    <svg className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isCategoriesOpen && (
                    <ul className="space-y-2 text-sm">
                        {categoryCounts.map(cat => (
                            <li key={cat._id} className="flex justify-between items-center text-gray-400">
                                <span>{cat._id.toUpperCase()}</span>
                                <span className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-md">{String(cat.count).padStart(2, '0')}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;