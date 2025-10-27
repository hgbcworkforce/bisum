import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminRegister from './AdminRegister';
import AdminSignIn from './AdminSignIn';
import { Check, AlertTriangle } from 'lucide-react';

const AdminAuth = () => {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const {
          data: adminData
        } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setAdminProfile(adminData);
      }
    };

    checkUser();

    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const {
          data: adminData
        } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        setAdminProfile(adminData);
      } else {
        setAdminProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      if (adminProfile) {
        await supabase.rpc('log_admin_activity', {
          p_admin_id: adminProfile.id,
          p_action: 'logout'
        });
      }

      await supabase.auth.signOut();
      window.location.href = '/admin/auth';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (user && adminProfile && adminProfile.is_approved && adminProfile.is_active) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome, {adminProfile.full_name}!</h2>
            <p className="text-gray-600 mb-6">You're logged in as {adminProfile.role}</p>

            <div className="space-y-3">
              <a href="/admin/" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Access Dashboard
              </a>
              <button onClick={handleLogout} className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user && adminProfile && !adminProfile.is_approved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
                <p><strong>Requested Role:</strong> {adminProfile.role}</p>
              </div>
            </div>

            <button onClick={handleLogout} className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        {user ? null : <AdminSignIn />}
        {!user ? null : <AdminRegister />}
      </div>
    </div>
  );
};

export default AdminAuth;
