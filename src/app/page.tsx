// 'use client';
// import React, { useState } from 'react';
// import Layout from './components/Layout'; // Import the new Layout component
// import Dashboard from './components/Dashboard';
// import AllProducts from './components/AllProducts';
// import OrderList from './components/OrderList';
// import OrderDetails from './components/OrderDetails'; // Make sure this is imported
// import ProductDetails from './components/AddProduct';

// const page = () => {
//   const [currentPage, setCurrentPage] = useState('dashboard');

//   const renderContent = () => {
//     switch (currentPage) {
//       case 'dashboard':
//         return <Dashboard />;
//      case 'all-products':
//         return <AllProducts onNavigate={setCurrentPage}  />;
//       case 'order-list':
//         return <OrderList onOrderClick={() => setCurrentPage('order-details')} />;
//       case 'order-details':
//         return <OrderDetails />;
//         case 'add-new-product':
//         return <ProductDetails />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
//       {renderContent()}
//     </Layout>
//   );
// };

// export default page;
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page's sole purpose is to redirect to the admin login page.
export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the correct admin login page
        router.replace('/admin/login');
    }, [router]);

    // --- THIS IS THE FIX ---
    // Return a simple loading message instead of null.
    // This gives Next.js a valid component to render while the redirect happens.
    return (
        <div className="flex h-screen items-center justify-center bg-[#121212] text-white">
            <p>Redirecting to admin panel...</p>
        </div>
    );
}

