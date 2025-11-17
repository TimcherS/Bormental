import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock registration - accepts any input for demo
    const name = formData.name || 'Demo User';
    const email = formData.email || 'demo@example.com';
    localStorage.setItem('user', JSON.stringify({ name, email }));
    navigate('/canvas-select');
  };

  const handleDemoRegister = () => {
    // Quick demo registration without form
    localStorage.setItem('user', JSON.stringify({ 
      name: 'Demo User',
      email: 'demo@example.com' 
    }));
    navigate('/canvas-select');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      <div className="w-full max-w-7xl mx-auto px-6">
        <Link
          to="/"
          className={`fixed top-4 left-4 p-2 rounded-lg transition-colors flex items-center gap-2 z-10 ${
            theme === 'dark'
              ? 'hover:bg-gray-900 text-white'
              : 'hover:bg-gray-100 text-gray-900'
          }`}
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Назад</span>
        </Link>

        <button
          onClick={toggleTheme}
          className={`fixed top-4 right-4 z-10 p-2 rounded-lg border backdrop-blur-md transition-smooth btn-hover-lift ${
            theme === 'dark'
              ? 'bg-black/50 border-gray-700/50 hover:bg-gray-900/50'
              : 'bg-white/50 border-gray-300/50 hover:bg-gray-50/80'
          }`}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex hover:opacity-80 transition-opacity mb-4">
            <Logo showText={true} textClassName="text-2xl font-semibold" />
          </Link>
          <h1 className="text-3xl font-bold mt-6 mb-2">Создайте аккаунт</h1>
          <p className={`mt-3 leading-relaxed ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
          }`}>
            Начните управлять бизнесом за минуты
          </p>
          <div className="mt-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors duration-300">
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-blue-200' : 'text-blue-900'
            }`}>
              🎭 Демо-режим: Введите любые данные или используйте быструю регистрацию
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
                htmlFor="name"
                className={`mb-2 block text-sm font-semibold ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                Полное имя
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Иван Иванов"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className={`mb-2 block text-sm font-semibold ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                Email адрес
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input input-bordered w-full"
                placeholder="вы@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={`mb-2 block text-sm font-semibold ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                Пароль
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

            <div>
              <label
                htmlFor="confirmPassword"
                className={`mb-2 block text-sm font-semibold ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                Подтвердите пароль
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input input-bordered w-full"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
            >
              Создать аккаунт
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${
                theme === 'dark' ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-700'
              }`}>
                или
              </span>
            </div>
          </div>

          <button
            onClick={handleDemoRegister}
            className={`w-full rounded-2xl border px-5 py-3 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-200 hover:bg-gray-800 focus-visible:ring-gray-600 focus-visible:ring-offset-gray-900'
                : 'border-gray-300 text-gray-800 hover:bg-gray-50 focus-visible:ring-gray-300 focus-visible:ring-offset-white'
            }`}
          >
            Быстрая демо-регистрация
          </button>

          <div className="mt-8 text-center text-sm">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>Уже есть аккаунт? </span>
            <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Войти
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );

}
