import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Info } from 'lucide-react';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from("admin_users")
          .insert({
            user_id: data.user.id,
            email: formData.email,
            full_name: formData.name,
            is_active: true,
            is_approved: false
          });

        if (profileError) throw profileError;

        console.log("Admin profile data:", {
          user_id: data.user.id,
          email: formData.email,
          full_name: formData.name,
          is_active: true,
          is_approved: false
        });

        setMessage("Registration successful! Your account is pending approval. You'll receive an email when approved.");

        setFormData({
          email: "",
          password: "",
          name: ""
       });
       navigate("/admin/auth");
     }
   } catch (error) {
     console.error("Auth error:", error);
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
            Admin Registration
          </h2>
          <p className="text-gray-600">
            Request admin access to manage the conference
          </p>
        </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes("successful") ? "bg-green-50 text-green-800 border border-green-200" : "bg-blue-50 text-blue-800 border border-blue-200"}`}>
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            required
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-300" : "border-gray-300"}`}
            placeholder="Enter your full name"
            required
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

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
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-300" : "border-gray-300"}`}
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
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-300" : "border-gray-300"}`}
            placeholder="Minimum 6 characters"
            required
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <div className="flex items-start">
            <Info className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              New admin accounts require approval from existing administrators. You'll receive an email notification when your account is approved.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded text-sm font-medium text-white transition-colors ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          ) : (
            "Register"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <a
          href="admin/signin"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          Already have an account? Sign in
        </a>
      </div>
    </div>
    </div>
  );
};

export default AdminRegister;
