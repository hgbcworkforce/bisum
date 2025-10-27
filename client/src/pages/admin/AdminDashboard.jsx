import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../../lib/supabase';
import DashboardLayout from "../../components/admin/DashboardLayout";
import {
  registrationAPI,
  handleApiError,
  formatCurrency,
} from "../../services/supabaseService";
import { useDashboardRealtime } from "../../hooks/useSupabaseRealtime";
import { Users, DollarSign, UserCheck, Lightbulb, User } from "lucide-react";

const AdminDashboard = () => {
  const [initialStats, setInitialStats] = useState({
    totalAttendees: 0,
    totalRevenue: 0,
    byType: {},
    popularSession: { name: 'N/A', count: 0 },
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Real-time updates
  const { stats: realTimeStats, isConnected } = useDashboardRealtime();

  // Fetch initial dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          navigate("/admin/auth");
          return;
        }
        setLoading(true);
        setError(null);

        // Fetch registration stats
        const registrationStatsResult = await registrationAPI.getStats();

        // Fetch payment stats
        const paymentStatsResult = await paymentAPI.getStats();

        // Fetch recent attendees
        const recentAttendeesResult = await registrationAPI.getAllAttendees({
          page: 1,
          limit: 5,
          sortBy: "created_at",
          sortOrder: "desc",
        });

        if (registrationStatsResult.success && paymentStatsResult.success) {
          const regStats = registrationStatsResult.data;
          const payStats = paymentStatsResult.data;

          setInitialStats({
            totalAttendees: regStats.totalRegistrations || 0,
            totalRevenue: payStats.successfulAmount || 0,
            byType: regStats.byType || {},
            popularSession: regStats.popularSession || { name: 'N/A', count: 0 },
          });
        }

        if (recentAttendeesResult.success) {
          setRecentRegistrations(recentAttendeesResult.data || []);
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        const errorInfo = handleApiError(error);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Combine initial stats with real-time updates
  const stats = realTimeStats.totalAttendees > 0 ? realTimeStats : initialStats;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getAttendanceTypeBadge = (type) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full capitalize";
    switch (type) {
      case "student":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "professional":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with BISUM Conference 2025.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Attendees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Attendees
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAttendees}
                </p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Registration Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  By Type
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.byType.professional || 0} Prof. / {stats.byType.student || 0} Student
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Recent Registrations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Registrations
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentRegistrations.map((registration) => (
                <div key={registration.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {registration.firstName} {registration.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {registration.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDate(registration.createdAt)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={getPaymentStatusBadge(
                            registration.paymentStatus,
                          )}
                        >
                          {registration.paymentStatus}
                        </span>
                        <span
                          className={getAttendanceTypeBadge(
                            registration.registrationType,
                          )}
                        >
                          {registration.registrationType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
