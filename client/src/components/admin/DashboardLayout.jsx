import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CreditCard, Users, X, User, LogOut, Menu, ChevronDown } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      name: "Attendees",
      href: "/admin/attendees",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const isActive = (href) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setProfileDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  const handleOutsideClick = (e) => {
    if (!e.target.closest(".profile-dropdown")) {
      closeProfileDropdown();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50" onClick={handleOutsideClick}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-600">BISUM</h1>
                <p className="text-xs text-gray-500 -mt-1">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="flex flex-col  space-y-5 border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@bisum.org</p>
              </div>
            </div>

            {/* Logout*/}
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-400 cursor-pointer transition-colors duration-200"
              onClick={() => {
                closeProfileDropdown();
                // TODO: Implement logout functionality
                console.log("Logout clicked");
              }}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header - Fixed z-index issue */}
        <header className="sticky top-0 z-60 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side - Mobile menu button and logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="lg:hidden">
                <h1 className="text-xl font-bold text-blue-600">BISUM</h1>
                <p className="text-xs text-gray-500 -mt-1">Admin Panel</p>
              </div>
            </div>

            {/* Right side - Notifications and profile */}
            <div className="flex items-center space-x-4">

              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg p-2"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="hidden md:block text-gray-700">Admin</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/admin/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={closeProfileDropdown}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <hr className="my-2 border-gray-200" />
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      onClick={() => {
                        closeProfileDropdown();
                        // TODO: Implement logout functionality
                        console.log("Logout clicked");
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2025 BISUM Conference. All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
