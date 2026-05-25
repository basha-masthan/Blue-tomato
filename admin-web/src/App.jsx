import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Services from './pages/Services';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Transactions from './pages/Transactions';
import Restaurants from './pages/Restaurants';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/vendors" element={<Vendors />} />
                    <Route path="/vendors/:id" element={<VendorDetail />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/users/:id" element={<UserDetail />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/restaurants" element={<Restaurants />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
