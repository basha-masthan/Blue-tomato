import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      login(response.data.token, response.data.admin);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message;
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 403) {
        setError(message || 'Access denied. Admin privileges required.');
      } else if (message) {
        setError(message);
      } else {
        setError('Unable to connect to server. Please make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@bluetomato.com');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Blue Tomato</h1>
            <p className="text-gray-500 mt-1">Admin Dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Demo Credentials Banner */}
          <button
            type="button"
            onClick={() => {
              setEmail('admin@bluetomato.com');
              setPassword('Admin@123');
              setError('');
            }}
            className="w-full mb-6 flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🔑</span>
              <div>
                <div className="text-sm font-semibold text-indigo-900">Tap to use Demo Credentials</div>
                <div className="text-xs text-indigo-700">admin@bluetomato.com</div>
              </div>
            </div>
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@bluetomato.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">Demo credentials for testing:</p>
            <p className="text-xs text-gray-600 text-center mt-1 font-mono">admin@bluetomato.com / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
