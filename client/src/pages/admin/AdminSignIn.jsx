import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Check } from 'lucide-react';

const AdminSignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (type === 'checkbox') {
      setRememberMe(checked);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signInWithPassword(
        {
          email: formData.email,
          password: formData.password,
        },
        {
          remember: rememberMe,
        }
      );

      if (error) throw error;

      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error(
          'You don\'t have admin access. Please contact the administrator.'
        );
      }

      if (!adminData.is_active) {
        await supabase.auth.signOut();
        throw new Error(
          'Your admin account has been deactivated. Please contact the administrator.'
        );
      }

      if (!adminData.is_approved) {
        await supabase.auth.signOut();
        throw new Error(
          'Your admin account is pending approval. Please contact the administrator.'
        );
      }

      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminData.id);

      await supabase.rpc('log_admin_activity', {
        p_admin_id: adminData.id,
        p_action: 'login',
      });

      setMessage('Login successful! Redirecting to dashboard...');

      setTimeout(() => {
        window.location.href = '/admin/';
      }, 2000);
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Login
          </h2>
          <p className="text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('successful') || message.includes('Welcome')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="you@example.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Enter your password"
              required
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded text-sm font-medium text-white transition-colors ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => onRegisterClick()}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Need admin access? Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;
