import React, { useState, useEffect } from 'react';
import { useDashboardRealtime } from '../../hooks/useSupabaseRealtime';
import {
  registrationAPI,
  paymentAPI,
  formatCurrency,
  handleApiError
} from '../../services/supabaseService';
import { XCircle, Info, X, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';

const RealtimeDashboard = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Use real-time dashboard hook
  const { stats, isConnected } = useDashboardRealtime((newStats) => {
    // Handle real-time updates
    console.log('Dashboard stats updated:', newStats);
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      setError(null);

      // Fetch initial registration and payment stats
      const [registrationResult, paymentResult] = await Promise.all([
        registrationAPI.getStats(),
        paymentAPI.getStats()
      ]);

      if (!registrationResult.success || !paymentResult.success) {
        throw new Error('Failed to load dashboard data');
      }

      // Initial stats are loaded, real-time updates will take over
      setInitialLoading(false);
    } catch (err) {
      console.error('Error loading initial data:', err);
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      setInitialLoading(false);
    }
  };

  // Add notification when new registration comes in
  useEffect(() => {
    if (stats.recentRegistrations.length > 0 && !initialLoading) {
      const latestRegistration = stats.recentRegistrations[0];
      const notification = {
        id: Date.now(),
        type: 'registration',
        message: `New registration: ${latestRegistration.fullName}`,
        timestamp: new Date(),
        data: latestRegistration
      };

      setNotifications(prev => [notification, ...prev.slice(0, 4)]);

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
  }, [stats.recentRegistrations, initialLoading]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (initialLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={loadInitialData}
                className="mt-2 text-sm text-red-800 hover:text-red-600 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Real-time Connection Status */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Live Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between animate-slide-in"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">{notification.message}</p>
                  <p className="text-xs text-blue-600">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="flex-shrink-0 text-blue-400 hover:text-blue-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Attendees</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalAttendees}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingPayments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Payments</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.completedPayments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Registrations</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Live updates from new registrations</p>
          </div>
          <div className="animate-pulse">
            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
          </div>
        </div>

        {stats.recentRegistrations.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {stats.recentRegistrations.map((registration, index) => (
              <li
                key={registration.id}
                className={`px-4 py-4 ${index === 0 ? 'bg-blue-50' : ''} transition-colors duration-500`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {registration.fullName ? registration.fullName.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {registration.fullName || 'Unknown'}
                        </p>
                        {index === 0 && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{registration.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {registration.registrationType || 'professional'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {registration.registrationDate ?
                        new Date(registration.registrationDate).toLocaleDateString() :
                        'Just now'
                      }
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500">No recent registrations</p>
          </div>
        )}
      </div>

      {/* Registration Types Breakdown */}
      {stats.byType && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Registration Types
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-semibold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500 capitalize">{type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeDashboard;
