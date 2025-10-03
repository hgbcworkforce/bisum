import { useState } from "react";
import DashboardLayout from "../../components/admin/DashboardLayout";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    conferenceName: "BISUM Conference 2025",
    conferenceDate: "2025-11-15",
    conferenceTime: "09:00",
    venue: "Lagos, Nigeria",
    maxAttendees: 500,
    registrationFee: 15000,
    earlyBirdDiscount: 20,
    emailNotifications: true,
    smsNotifications: false,
    autoConfirmation: true,
    requireApproval: false,
  });

  const [activeTab, setActiveTab] = useState("general");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Settings saved:", settings);
    alert("Settings saved successfully!");
  };

  const tabs = [
    { id: "general", name: "General", icon: "⚙️" },
    { id: "registration", name: "Registration", icon: "📝" },
    { id: "notifications", name: "Notifications", icon: "🔔" },
    { id: "integrations", name: "Integrations", icon: "🔗" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your conference settings and preferences
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  General Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="conferenceName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Conference Name
                    </label>
                    <input
                      type="text"
                      id="conferenceName"
                      name="conferenceName"
                      value={settings.conferenceName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="venue"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Venue
                    </label>
                    <input
                      type="text"
                      id="venue"
                      name="venue"
                      value={settings.venue}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="conferenceDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Conference Date
                    </label>
                    <input
                      type="date"
                      id="conferenceDate"
                      name="conferenceDate"
                      value={settings.conferenceDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="conferenceTime"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="conferenceTime"
                      name="conferenceTime"
                      value={settings.conferenceTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Registration Settings */}
            {activeTab === "registration" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Registration Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="maxAttendees"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Maximum Attendees
                    </label>
                    <input
                      type="number"
                      id="maxAttendees"
                      name="maxAttendees"
                      value={settings.maxAttendees}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="registrationFee"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Registration Fee (₦)
                    </label>
                    <input
                      type="number"
                      id="registrationFee"
                      name="registrationFee"
                      value={settings.registrationFee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="earlyBirdDiscount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Early Bird Discount (%)
                    </label>
                    <input
                      type="number"
                      id="earlyBirdDiscount"
                      name="earlyBirdDiscount"
                      value={settings.earlyBirdDiscount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="autoConfirmation"
                      name="autoConfirmation"
                      type="checkbox"
                      checked={settings.autoConfirmation}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="autoConfirmation"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Auto-confirm registrations upon payment
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="requireApproval"
                      name="requireApproval"
                      type="checkbox"
                      checked={settings.requireApproval}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="requireApproval"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Require manual approval for registrations
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notification Preferences
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="emailNotifications"
                      name="emailNotifications"
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="emailNotifications"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Send email notifications to attendees
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="smsNotifications"
                      name="smsNotifications"
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="smsNotifications"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Send SMS notifications to attendees
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        SMS notifications require additional setup and may incur
                        charges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === "integrations" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Third-party Integrations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-green-600 font-bold">FW</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Flutterwave
                          </h4>
                          <p className="text-sm text-gray-500">
                            Payment processing
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Connected
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Handle secure payments and transaction processing.
                    </p>
                    <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Configure Settings
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold">📧</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Email Service
                          </h4>
                          <p className="text-sm text-gray-500">
                            Automated emails
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Send confirmation emails and notifications to attendees.
                    </p>
                    <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Setup Integration
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Need help with integrations? Contact our support team
                        for assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
