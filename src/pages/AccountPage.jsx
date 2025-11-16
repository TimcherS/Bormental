import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, LogOut, Trash2, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

export default function AccountPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { name: 'User', email: 'user@example.com' };
  });

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/canvas-select" className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              <span className="text-xl font-semibold">Business Copilot</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Section */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <button className="w-full sm:w-auto px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            Edit Profile
          </button>
        </div>

        {/* Subscription Section */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Free Plan</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upgrade to Pro for unlimited canvases and widgets
              </p>
            </div>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
          <button className="w-full sm:w-auto px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity">
            Upgrade to Pro
          </button>
        </div>

        {/* Preferences Section */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Currently using {theme} mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                Toggle Theme
              </button>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-left"
            >
              <LogOut className="w-5 h-5" />
              <div>
                <p className="font-medium">Logout</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sign out of your account
                </p>
              </div>
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors text-left"
            >
              <Trash2 className="w-5 h-5" />
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm">
                  Permanently delete your account and all data
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link
            to="/canvas-select"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            ← Back to Canvases
          </Link>
        </div>
      </div>
    </div>
  );
}
