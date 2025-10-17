import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Navigation } from "../../components";
import { Check, AlertTriangle, Info } from "lucide-react";

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    department: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Get admin profile
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setAdminProfile(adminData);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: adminData } = await supabase
            .from("admin_users")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          setAdminProfile(adminData);
        } else {
          setAdminProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
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

    if (!isLogin) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }

      if (!formData.department.trim()) {
        newErrors.department = "Department is required";
      }
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
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        // Check if user has admin profile
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (adminError || !adminData) {
          await supabase.auth.signOut();
          throw new Error("You don't have admin access. Please contact the administrator.");
        }

        if (!adminData.is_active) {
          await supabase.auth.signOut();
          throw new Error("Your admin account has been deactivated. Please contact the administrator.");
        }

        if (!adminData.is_approved) {
          await supabase.auth.signOut();
          throw new Error("Your admin account is pending approval. Please contact the administrator.");
        }

        // Update last login
        await supabase
          .from("admin_users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", adminData.id);

        // Log activity
        await supabase.rpc('log_admin_activity', {
          p_admin_id: adminData.id,
          p_action: 'login'
        });

        setMessage("Login successful! Redirecting to dashboard...");

        // Redirect to dashboard after short delay
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 2000);

      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        if (data.user) {
          // Create admin profile (pending approval)
          const { error: profileError } = await supabase
            .from("admin_users")
            .insert({
              user_id: data.user.id,
              email: formData.email,
              full_name: formData.fullName,
              department: formData.department,
              phone: formData.phone || null,
              role: "organizer",
              is_active: true,
              is_approved: false // Requires approval
            });

          if (profileError) throw profileError;

          setMessage("Registration successful! Your account is pending approval. You'll receive an email when approved.");

          // Switch to login form after successful signup
          setTimeout(() => {
            setIsLogin(true);
            setFormData({
              email: "",
              password: "",
              fullName: "",
              department: "",
              phone: ""
            });
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (adminProfile) {
        // Log activity before logout
        await supabase.rpc('log_admin_activity', {
          p_admin_id: adminProfile.id,
          p_action: 'logout'
        });
      }

      await supabase.auth.signOut();
      setMessage("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // If user is logged in and approved, show dashboard access
  if (user && adminProfile && adminProfile.is_approved && adminProfile.is_active) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-12">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome, {adminProfile.full_name}!</h2>
              <p className="text-gray-600 mb-6">You're logged in as {adminProfile.role}</p>

              <div className="space-y-3">
                <a
                  href="/admin/dashboard"
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Access Dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in but not approved
  if (user && adminProfile && !adminProfile.is_approved) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-12">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Pending Approval</h2>
              <p className="text-gray-600 mb-6">
                Your admin account is waiting for approval from an administrator.
                You'll receive an email notification when your account is approved.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600">
                  <p><strong>Name:</strong> {adminProfile.full_name}</p>
                  <p><strong>Email:</strong> {adminProfile.email}</p>
                  <p><strong>Department:</strong> {adminProfile.department}</p>
                  <p><strong>Requested Role:</strong> {adminProfile.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login/signup form
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLogin ? "Admin Login" : "Admin Registration"}
              </h2>
              <p className="text-gray-600 mt-2">
                {isLogin
                  ? "Sign in to access the admin dashboard"
                  : "Request admin access to manage the conference"
                }
              </p>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes("successful") || message.includes("Welcome")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}>
                <p className="text-sm">{message}</p>
              </div>
            )}

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="your.email@domain.com"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fullName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Your full name"
                      required
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      id="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.department ? "border-red-300" : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Administration">Administration</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Technology">Technology</option>
                      <option value="Content">Content & Programming</option>
                      <option value="Registration">Registration</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+234 800 123 4567"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> New admin accounts require approval from existing administrators.
                          You'll receive an email notification when your account is approved.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? "Signing In..." : "Registering..."}
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Register for Admin Access"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({
                    email: "",
                    password: "",
                    fullName: "",
                    department: "",
                    phone: ""
                  });
                  setErrors({});
                  setMessage("");
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {isLogin
                  ? "Need admin access? Register here"
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
