import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/': 'Dashboard',
  '/vendors': 'Vendor Management',
  '/users': 'User Management',
  '/services': 'Services & Food',
  '/orders': 'Orders',
  '/transactions': 'Transactions',
  '/restaurants': 'Restaurants',
};

export default function Layout({ children }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Admin Panel';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
