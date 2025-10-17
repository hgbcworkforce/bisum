import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/admin/DashboardLayout';
import { registrationAPI, handleApiError } from '../../services/supabaseService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Search } from 'lucide-react';

const AdminAttendees = () => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('registration_date-desc');
  const [isExporting, setIsExporting] = useState(false);

  const fetchAttendees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortBy,
      };

      const result = await registrationAPI.getAllAttendees(options);

      if (result.success) {
        setAttendees(result.data || []);
        setPagination(prev => ({ ...prev, total: result.pagination.total }));
      } else {
        throw new Error(result.message || 'Failed to fetch attendees');
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, sortBy]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleCsvExport = async () => {
    setIsExporting(true);
    try {
      const result = await registrationAPI.exportAttendees();
      if (result.success) {
        const data = result.data;
        const headers = [
          "S/N",
          "Registration Date",
          "Fullname",
          "Email",
          "Participant Type",
          "Breakout Session",
          "Registration Number"
        ];
        const csvContent = [
          headers.join(','),
          ...data.map((attendee, index) => [
            index + 1,
            new Date(attendee.registration_date).toLocaleDateString(),
            `"${attendee.first_name} ${attendee.last_name}"`,
            attendee.email,
            attendee.registration_type,
            attendee.breakout_session_choice,
            attendee.registration_number
          ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
          URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'attendees.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(result.message || 'Failed to export data');
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      alert(`Export failed: ${errorInfo.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
      const result = await registrationAPI.exportAttendees();
      if (result.success) {
        const doc = new jsPDF();
        doc.autoTable({
          head: [['S/N', 'Registration Date', 'Fullname', 'Email', 'Participant Type', 'Breakout Session', 'Reg. Number']],
          body: result.data.map((attendee, index) => [
            index + 1,
            new Date(attendee.registration_date).toLocaleDateString(),
            `${attendee.first_name} ${attendee.last_name}`,
            attendee.email,
            attendee.registration_type,
            attendee.breakout_session_choice,
            attendee.registration_number,
          ]),
        });
        doc.save('attendees.pdf');
      } else {
        throw new Error(result.message || 'Failed to export data');
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      alert(`Export failed: ${errorInfo.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendees</h1>
            <p className="text-gray-600 mt-2">
              Manage and view all registered conference attendees
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={handleCsvExport}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400"
            >
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={handlePdfExport}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400"
            >
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, reg number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
              >
                <option value="registration_date-desc">Registration Date (Newest)</option>
                <option value="registration_date-asc">Registration Date (Oldest)</option>
                <option value="registration_number-asc">Registration Number (Asc)</option>
                <option value="registration_number-desc">Registration Number (Desc)</option>
                <option value="first_name-asc">Name (A-Z)</option>
                <option value="first_name-desc">Name (Z-A)</option>
                <option value="breakout_session_choice-asc">Breakout Session (A-Z)</option>
                <option value="breakout_session_choice-desc">Breakout Session (Z-A)</option>
                <option value="registration_type-asc">Participant Type (A-Z)</option>
                <option value="registration_type-desc">Participant Type (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendees Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S/N
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fullname
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breakout Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reg. Number
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="text-gray-500">Loading attendees...</div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="text-red-500">{error}</div>
                    </td>
                  </tr>
                ) : attendees.length > 0 ? (
                  attendees.map((attendee, index) => (
                    <tr key={attendee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(attendee.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attendee.firstName} {attendee.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {attendee.registrationType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {attendee.breakoutSessionChoice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendee.registrationNumber}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <p className="text-gray-500 text-lg">No attendees found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAttendees;
