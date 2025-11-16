import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock authentication - accepts any credentials for demo
    const email = formData.email || 'demo@example.com';
    localStorage.setItem('user', JSON.stringify({ email }));
    navigate('/canvas-select');
  };

  const handleDemoLogin = () => {
    // Quick demo login without form
    localStorage.setItem('user', JSON.stringify({ email: 'demo@example.com' }));
    navigate('/canvas-select');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      <Link
        to="/"
        className="fixed top-4 left-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center gap-2 z-10"
        aria-label="Back to home"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Back</span>
      </Link>

      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-10 m-1 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition-colors hover:bg-white dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
          theme === 'dark'
            ? 'border-gray-700 bg-gray-900/80 text-white'
            : 'border-gray-200 bg-white/80 text-gray-900'
        }`}
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-semibold mb-4 hover:opacity-80 transition-opacity">
            <BarChart3 className="w-8 h-8" />
            Business Copilot
          </Link>
          <h1 className="text-3xl font-bold mt-6 mb-2">Welcome back</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
            Sign in to your account to continue
          </p>
          <div className="mt-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors duration-300">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              🎭 Demo Mode: Enter any credentials or use quick demo login
            </p>
          </div>
        </div>

        <div className={`border rounded-2xl p-8 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'border-gray-800 bg-gray-900/50' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input input-bordered w-full"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input input-bordered w-full"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-2 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#"
                className="font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
            >
              Sign In
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'} text-gray-600 dark:text-gray-400`}>
                or
              </span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full rounded-2xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-600 dark:focus-visible:ring-offset-gray-900"
          >
            Quick Demo Login
          </button>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
            <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Sign up
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );

}
