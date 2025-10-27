import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/admin/DashboardLayout';
import { paymentAPI, handleApiError, formatCurrency } from '../../services/supabaseService';
import { DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const AdminPaymentSummary = () => {
  const [paymentStats, setPaymentStats] = useState({
    successfulAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate("/admin/auth");
          return;
        }

        setLoading(true);
        setError(null);

        const result = await paymentAPI.getStats();

        if (result.success) {
          setPaymentStats(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch payment stats');
        }
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStats();
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Summary</h1>
          <p className="text-gray-600 mt-2">
            Overview of payment statistics for the conference
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  {formatCurrency(paymentStats.successfulAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Payments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(paymentStats.pendingAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Failed Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Failed Payments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(paymentStats.failedAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-xl font-bold text-gray-900">{paymentStats.totalTransactions}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Successful Transactions</p>
              <p className="text-xl font-bold text-green-600">{paymentStats.successfulTransactions}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Transactions</p>
              <p className="text-xl font-bold text-yellow-600">{paymentStats.pendingTransactions}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Transactions</p>
              <p className="text-xl font-bold text-red-600">{paymentStats.failedTransactions}</p>
            </div>
          </div>
        </div>

        {loading && <p>Loading payment statistics...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>
    </DashboardLayout>
  );
};

export default AdminPaymentSummary;
