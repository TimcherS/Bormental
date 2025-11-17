import React, { useState, useEffect } from 'react';
import { Type, MessageCircle, BarChart3, Users, Mail, Calendar, DollarSign, Target, Palette, Zap, Lock, Globe, Plus, Trash2, Newspaper } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Modal from './Modal';

// Select component
function SelectComponent({ value, onValueChange, options, placeholder, theme }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onValueChange(e.target.value)}
      className={`w-full py-2.5 px-4 rounded-lg border ${
        theme === 'dark' 
          ? 'bg-gray-700 border-gray-600 text-white' 
          : 'bg-white border-gray-300 text-gray-900'
      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      style={{ appearance: 'auto' }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function WidgetConfigModal({ widget, open, onOpenChange, onSave }) {
  const { theme } = useTheme();
  const [config, setConfig] = useState(widget.config || {});
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    switch (widget.type) {
      case 'social-media':
        if (!config.platform) newErrors.platform = 'Выберите платформу';
        if (config.apiKey && !config.apiSecret) newErrors.apiSecret = 'Требуется секретный ключ API';
        break;
      case 'email':
        if (!config.service) newErrors.service = 'Выберите почтовый сервис';
        if (!config.email) newErrors.email = 'Требуется адрес электронной почты';
        if (!config.password && !config.apiKey) newErrors.password = 'Требуется пароль или API-ключ';
        break;
      case 'calendar':
        if (!config.calendarName) newErrors.calendarName = 'Требуется название календаря';
        // Allow saving without sources configured (will show mock data)
        break;
      case 'revenue':
        if (!config.accountingSystem) newErrors.accountingSystem = 'Выберите систему учета';
        break;
      case 'marketing':
        if (!config.platform) newErrors.platform = 'Выберите маркетинговую платформу';
        break;
      case 'chatgpt':
        if (!config.apiKey) newErrors.apiKey = 'Требуется API-ключ OpenAI';
        // Validate API key format
        if (config.apiKey && !config.apiKey.startsWith('sk-')) {
          newErrors.apiKey = 'API-ключ должен начинаться с "sk-"';
        }
        break;
      case 'news':
        // News widget validation - optional configuration
        if (config.themes && config.themes.length === 0 && config.customTheme && !config.customTheme.trim()) {
          newErrors.themes = 'Выберите хотя бы одну тему или введите свою';
        }
        if (!config.agencies || config.agencies.length === 0) {
          newErrors.agencies = 'Выберите хотя бы одно новостное агентство';
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave({ ...config, configured: true });
    onOpenChange(false);
  };

  // Handle form submission from Modal's Save button
  useEffect(() => {
    const form = document.getElementById('widget-config-form');
    if (form) {
      const handleFormSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
          onSave({ ...config, configured: true });
          onOpenChange(false);
        }
      };
      form.addEventListener('submit', handleFormSubmit);
      return () => form.removeEventListener('submit', handleFormSubmit);
    }
  }, [config, onSave, onOpenChange]);

  const renderConfigForm = () => {
    switch (widget.type) {
      case 'note':
        return (
          <form id="widget-config-form" onSubmit={handleSubmit} className="space-y-0">
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Type className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Настройки заметки</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Название виджета
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Введите название (например, 'Заметки встречи')"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Type className="w-3 h-3" />
                      Размер шрифта
                    </span>
                  </label>
                  <SelectComponent
                    value={config.fontSize || 'medium'}
                    onValueChange={(value) => setConfig({ ...config, fontSize: value })}
                    options={[
                      { value: 'small', label: 'Маленький' },
                      { value: 'medium', label: 'Средний' },
                      { value: 'large', label: 'Большой' }
                    ]}
                    placeholder="Select font size"
                    theme={theme}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Palette className="w-3 h-3" />
                      Цвет фона
                    </span>
                  </label>
                  <SelectComponent
                    value={config.backgroundColor || 'default'}
                    onValueChange={(value) => setConfig({ ...config, backgroundColor: value })}
                    options={[
                      { value: 'default', label: 'Стандартный' },
                      { value: 'yellow', label: 'Жёлтый' },
                      { value: 'blue', label: 'Синий' },
                      { value: 'green', label: 'Зелёный' },
                      { value: 'pink', label: 'Розовый' }
                    ]}
                    placeholder="Select background"
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          </form>
        );

      case 'chatgpt':
        return (
          <form id="widget-config-form" onSubmit={handleSubmit} className="space-y-5">
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Настройка API</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Название виджета
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Введите название (например, 'ИИ-помощник')"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Lock className="w-3 h-3" />
                      API-ключ OpenAI
                    </span>
                  </label>
                  <input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Введите ваш API-ключ OpenAI (sk-...)"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      errors.apiKey ? 'input-error' : ''
                    } ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.apiKey && <p className="text-error text-xs mt-2">{errors.apiKey}</p>}
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Настройки модели</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Zap className="w-3 h-3" />
                      Model
                    </span>
                  </label>
                  <SelectComponent
                    value={config.model || 'gpt-3.5-turbo'}
                    onValueChange={(value) => setConfig({ ...config, model: value })}
                    options={[
                      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                      { value: 'gpt-4', label: 'GPT-4' }
                    ]}
                    placeholder="Select model"
                    theme={theme}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Palette className="w-3 h-3" />
                      Temperature (Creativity)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature || '0.7'}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    placeholder="0.7"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Target className="w-3 h-3" />
                      Максимум токенов
                    </span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    value={config.maxTokens || '1000'}
                    onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                    placeholder="1000"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <MessageCircle className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Настройки промпта</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <MessageCircle className="w-3 h-3" />
                      Системный промпт
                    </span>
                  </label>
                  <textarea
                    value={config.systemPrompt || 'You are a helpful business assistant. Provide clear, actionable insights for business decisions.'}
                    onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                    placeholder="Enter custom system prompt..."
                    className={`textarea textarea-bordered w-full resize-none py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </form>
        );

      case 'chart':
        return (
          <form id="widget-config-form" onSubmit={handleSubmit} className="space-y-5">
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Основные настройки</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Widget Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Enter widget name (e.g., 'Revenue Chart')"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <BarChart3 className="w-3 h-3" />
                      Chart Type
                    </span>
                  </label>
                  <SelectComponent
                    value={config.chartType || 'area'}
                    onValueChange={(value) => setConfig({ ...config, chartType: value })}
                    options={[
                      { value: 'area', label: 'Area Chart' },
                      { value: 'bar', label: 'Bar Chart' },
                      { value: 'line', label: 'Line Chart' },
                      { value: 'pie', label: 'Pie Chart' }
                    ]}
                    placeholder="Select chart type"
                    theme={theme}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Globe className="w-3 h-3" />
                      Data Source
                    </span>
                  </label>
                  <SelectComponent
                    value={config.dataSource || 'mock-revenue'}
                    onValueChange={(value) => setConfig({ ...config, dataSource: value })}
                    options={[
                      { value: 'mock-revenue', label: 'Revenue Data' },
                      { value: 'mock-costs', label: 'Costs Data' },
                      { value: 'mock-custom', label: 'Custom Metric' }
                    ]}
                    placeholder="Select data source"
                    theme={theme}
                  />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Palette className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Appearance</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Type className="w-3 h-3" />
                      Chart Title
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.title || ''}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    placeholder="Enter chart title"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Type className="w-3 h-3" />
                      Y-Axis Label
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.yLabel || ''}
                    onChange={(e) => setConfig({ ...config, yLabel: e.target.value })}
                    placeholder="Enter Y-axis label"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Palette className="w-3 h-3" />
                      Color
                    </span>
                  </label>
                  <SelectComponent
                    value={config.color || '#8884d8'}
                    onValueChange={(value) => setConfig({ ...config, color: value })}
                    options={[
                      { value: '#8884d8', label: 'Purple' },
                      { value: '#82ca9d', label: 'Green' },
                      { value: '#ffc658', label: 'Yellow' },
                      { value: '#ff7300', label: 'Orange' },
                      { value: '#0088fe', label: 'Blue' },
                      { value: '#00c49f', label: 'Cyan' },
                      { value: '#ffbb28', label: 'Gold' }
                    ]}
                    placeholder="Select color"
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          </form>
        );

      case 'social-media':
        return (
          <form id="widget-config-form" onSubmit={handleSubmit} className="space-y-5">
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Users className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Platform Configuration</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Widget Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Enter widget name (e.g., 'VK Analytics')"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Users className="w-3 h-3" />
                      Social Media Platform
                    </span>
                  </label>
                  <SelectComponent
                    value={config.platform || ''}
                    onValueChange={(value) => setConfig({ ...config, platform: value })}
                    options={[
                      { value: 'vk', label: 'VK' },
                      { value: 'instagram', label: 'Instagram' },
                      { value: 'telegram', label: 'Telegram' },
                      { value: 'whatsapp', label: 'WhatsApp' }
                    ]}
                    placeholder="Select platform"
                    theme={theme}
                  />
                  {errors.platform && <p className="text-error text-xs mt-2">{errors.platform}</p>}
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>API Credentials</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Lock className="w-3 h-3" />
                      API Key
                    </span>
                  </label>
                  <input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Enter API key"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Lock className="w-3 h-3" />
                      API Secret (Optional)
                    </span>
                  </label>
                  <input
                    type="password"
                    value={config.apiSecret || ''}
                    onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                    placeholder="Enter API secret"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>
          </form>
        );

      case 'email':
        return (
          <form id="widget-config-form" onSubmit={handleSubmit} className="space-y-5">
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Mail className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Email Configuration</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Widget Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Enter widget name (e.g., 'Gmail Inbox')"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Globe className="w-3 h-3" />
                      Email Service
                    </span>
                  </label>
                  <SelectComponent
                    value={config.service || ''}
                    onValueChange={(value) => setConfig({ ...config, service: value })}
                    options={[
                      { value: 'gmail', label: 'Gmail' },
                      { value: 'microsoft', label: 'Microsoft Mail' },
                      { value: 'yandex', label: 'Yandex Mail' }
                    ]}
                    placeholder="Select email service"
                    theme={theme}
                  />
                  {errors.service && <p className="text-error text-xs mt-2">{errors.service}</p>}
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Mail className="w-3 h-3" />
                      Email Address
                    </span>
                  </label>
                  <input
                    type="email"
                    value={config.email || ''}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    placeholder="Enter email address"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.email && <p className="text-error text-xs mt-2">{errors.email}</p>}
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Authentication</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Lock className="w-3 h-3" />
                      Password or API Key
                    </span>
                  </label>
                  <input
                    type="password"
                    value={config.password || config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, [config.service === 'gmail' ? 'apiKey' : 'password']: e.target.value })}
                    placeholder="Enter password or API key"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.password && <p className="text-error text-xs mt-2">{errors.password}</p>}
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Настройки фильтров</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Zap className="w-3 h-3" />
                      Настройки фильтров
                    </span>
                  </label>
                  <textarea
                    value={config.filters || ''}
                    onChange={(e) => setConfig({ ...config, filters: e.target.value })}
                    placeholder="Enter filter preferences (e.g., sender domains, keywords)"
                    className={`textarea textarea-bordered w-full resize-none py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </form>
        );

      case 'calendar':
        const sources = config.sources || [];
        const [newSource, setNewSource] = useState({ type: '', apiKey: '', name: '' });
        
        const addSource = () => {
          if (newSource.type && newSource.apiKey && newSource.name) {
            setConfig({ 
              ...config, 
              sources: [...sources, { ...newSource, id: Date.now().toString() }]
            });
            setNewSource({ type: '', apiKey: '', name: '' });
          }
        };
        
        const removeSource = (id) => {
          setConfig({ 
            ...config, 
            sources: sources.filter(s => s.id !== id)
          });
        };

        return (
          <form id="widget-config-form" onSubmit={handleSubmit} className="space-y-5">
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Calendar className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Calendar Configuration</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Widget Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Enter widget name (e.g., 'Work Calendar')"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Type className="w-3 h-3" />
                      Calendar Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.calendarName || ''}
                    onChange={(e) => setConfig({ ...config, calendarName: e.target.value })}
                    placeholder="e.g., 'Business Events', 'Work Schedule'"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.calendarName && <p className="text-error text-xs mt-2">{errors.calendarName}</p>}
                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Name your calendar to separate work from personal life, or divide meetings by department.
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Globe className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                    <h4 className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>Connected Sources</h4>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {sources.length} source{sources.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {sources.length > 0 && (
                  <div className="space-y-2">
                    {sources.map((source) => (
                      <div key={source.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-600' 
                          : 'bg-white border-gray-300'
                      }`}>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{source.name}</div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {source.type === 'bitrix24' && 'Битрикс24'}
                            {source.type === 'amocrm' && 'AmoCRM'}
                            {source.type === 'yandex' && 'Яндекс Трекер'}
                            {source.type === 'google' && 'Google Calendar'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSource(source.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm font-medium">Add New Source</div>
                  <div className="space-y-2">
                    <SelectComponent
                      value={newSource.type}
                      onValueChange={(value) => setNewSource({ ...newSource, type: value })}
                      options={[
                        { value: 'bitrix24', label: 'Битрикс24' },
                        { value: 'amocrm', label: 'AmoCRM' },
                        { value: 'yandex', label: 'Яндекс Трекер' },
                        { value: 'google', label: 'Google Calendar' }
                      ]}
                      placeholder="Select source type"
                      theme={theme}
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                      placeholder="Source name (e.g., 'Work Google Calendar')"
                      className={`w-full py-2.5 px-4 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={newSource.apiKey}
                      onChange={(e) => setNewSource({ ...newSource, apiKey: e.target.value })}
                      placeholder="API Key"
                      className={`w-full py-2.5 px-4 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addSource}
                    disabled={!newSource.type || !newSource.apiKey || !newSource.name}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Source
                  </button>
                </div>
                
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Note:</strong> Events from all connected sources will be aggregated and displayed chronologically. You can add events manually even without connecting any API sources.
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Palette className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Appearance</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Palette className="w-3 h-3" />
                      Calendar Color
                    </span>
                  </label>
                  <SelectComponent
                    value={config.calendarColor || 'blue'}
                    onValueChange={(value) => setConfig({ ...config, calendarColor: value })}
                    options={[
                      { value: 'blue', label: 'Blue' },
                      { value: 'green', label: 'Green' },
                      { value: 'red', label: 'Red' },
                      { value: 'purple', label: 'Purple' },
                      { value: 'orange', label: 'Orange' },
                      { value: 'pink', label: 'Pink' }
                    ]}
                    placeholder="Select color"
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          </form>
        );

      case 'revenue':
        return (
          <form id="widget-config-form" onSubmit={handleSubmit} className="space-y-5">
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <DollarSign className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Revenue Configuration</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Widget Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Enter widget name (e.g., 'Q4 Revenue')"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Globe className="w-3 h-3" />
                      Accounting System
                    </span>
                  </label>
                  <SelectComponent
                    value={config.accountingSystem || ''}
                    onValueChange={(value) => setConfig({ ...config, accountingSystem: value })}
                    options={[
                      { value: '1c', label: '1C' },
                      { value: 'quickbooks', label: 'QuickBooks' },
                      { value: 'xero', label: 'Xero' },
                      { value: 'freshbooks', label: 'FreshBooks' },
                      { value: 'manual', label: 'Manual Entry' }
                    ]}
                    placeholder="Select accounting system"
                    theme={theme}
                  />
                  {errors.accountingSystem && <p className="text-error text-xs mt-2">{errors.accountingSystem}</p>}
                </div>
                {config.accountingSystem !== 'manual' && (
                  <div className="space-y-2">
                    <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      <span className="flex items-center gap-2 font-medium text-sm">
                        <Lock className="w-3 h-3" />
                        API Key
                      </span>
                    </label>
                    <input
                      type="password"
                      value={config.apiKey || ''}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      placeholder="Enter API key"
                      className={`input input-bordered w-full py-2.5 px-4 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Target className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Metrics Selection</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Target className="w-3 h-3" />
                      Metrics to Track
                    </span>
                  </label>
                  <div className={`space-y-3 pt-2 p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                  }`}>
                    {['revenue', 'expenses', 'profit', 'growth'].map((metric) => (
                      <label key={metric} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                        <input
                          type="checkbox"
                          checked={config.metrics?.includes(metric) || false}
                          onChange={(e) => {
                            const metrics = config.metrics || [];
                            if (e.target.checked) {
                              setConfig({ ...config, metrics: [...metrics, metric] });
                            } else {
                              setConfig({ ...config, metrics: metrics.filter(m => m !== metric) });
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <span className={`text-sm font-medium capitalize ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }`}>{metric}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        );

      case 'marketing':
        return (
          <form id="widget-config-form" onSubmit={handleSubmit} className="space-y-5">
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Target className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Platform Configuration</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Widget Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Enter widget name (e.g., 'Marketing Stats')"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Target className="w-3 h-3" />
                      Marketing Platform
                    </span>
                  </label>
                  <SelectComponent
                    value={config.platform || ''}
                    onValueChange={(value) => setConfig({ ...config, platform: value })}
                    options={[
                      { value: 'ymetrica', label: 'Яндекс.Метрика' },
                      { value: 'google-analytics', label: 'Google Analytics' },
                      { value: 'facebook-ads', label: 'Facebook Ads' },
                      { value: 'google-ads', label: 'Google Ads' },
                      { value: 'vk-ads', label: 'VK Ads' }
                    ]}
                    placeholder="Select marketing platform"
                    theme={theme}
                  />
                  {errors.platform && <p className="text-error text-xs mt-2">{errors.platform}</p>}
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>API Configuration</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Lock className="w-3 h-3" />
                      API Key
                    </span>
                  </label>
                  <input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Enter API key"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Настройки кампаний</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Zap className="w-3 h-3" />
                      Выбор кампаний
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.campaigns || ''}
                    onChange={(e) => setConfig({ ...config, campaigns: e.target.value })}
                    placeholder="Enter campaign IDs or names (comma separated)"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>
          </form>
        );

      case 'news':
        return (
          <form id="widget-config-form" onSubmit={handleSubmit} className="space-y-5">
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Newspaper className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>News Configuration</h4>
                </div>
                
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Widget Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.name || ''}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Enter widget name (e.g., 'Tech News')"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Target className="w-3 h-3" />
                      News Themes
                    </span>
                  </label>
                  <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select topics you're interested in (select multiple)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Технологии', 'Бизнес', 'Политика', 'Наука', 'Здравоохранение', 'Спорт', 'Развлечения', 'Мировые новости'].map((theme_option) => (
                      <label 
                        key={theme_option}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          (config.themes || []).includes(theme_option)
                            ? theme === 'dark'
                              ? 'bg-blue-500/20 border-blue-500'
                              : 'bg-blue-50 border-blue-500'
                            : theme === 'dark'
                              ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                              : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={(config.themes || []).includes(theme_option)}
                          onChange={(e) => {
                            const newThemes = e.target.checked
                              ? [...(config.themes || []), theme_option]
                              : (config.themes || []).filter(t => t !== theme_option);
                            setConfig({ ...config, themes: newThemes });
                          }}
                          className="w-4 h-4"
                        />
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {theme_option}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.themes && <p className="text-error text-xs mt-2">{errors.themes}</p>}
                </div>

                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Custom Theme (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={config.customTheme || ''}
                    onChange={(e) => setConfig({ ...config, customTheme: e.target.value })}
                    placeholder="e.g., 'Artificial Intelligence', 'Climate Change'"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Add your own custom news theme not listed above
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-700/30 border-gray-600/50' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-5">
                  <Globe className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h4 className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>News Sources</h4>
                </div>
                
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      Select News Agencies
                    </span>
                  </label>
                  <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Choose which news sources to follow
                  </p>
                  <div className="space-y-2">
                    <label 
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        (config.agencies || []).includes('all')
                          ? theme === 'dark'
                            ? 'bg-indigo-500/20 border-indigo-500'
                            : 'bg-indigo-50 border-indigo-500'
                          : theme === 'dark'
                            ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                            : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(config.agencies || []).includes('all')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({ ...config, agencies: ['all'] });
                          } else {
                            setConfig({ ...config, agencies: [] });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className={`text-sm font-semibold ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        All Sources
                      </span>
                    </label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'bbc', name: 'BBC News' },
                        { id: 'cnn', name: 'CNN' },
                        { id: 'reuters', name: 'Reuters' },
                        { id: 'ap', name: 'Associated Press' },
                        { id: 'bloomberg', name: 'Bloomberg' },
                        { id: 'techcrunch', name: 'TechCrunch' },
                        { id: 'theverge', name: 'The Verge' }
                      ].map((agency) => (
                        <label 
                          key={agency.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                            (config.agencies || []).includes(agency.id)
                              ? theme === 'dark'
                                ? 'bg-blue-500/20 border-blue-500'
                                : 'bg-blue-50 border-blue-500'
                              : theme === 'dark'
                                ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                : 'bg-white border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={(config.agencies || []).includes(agency.id)}
                            disabled={(config.agencies || []).includes('all')}
                            onChange={(e) => {
                              const newAgencies = e.target.checked
                                ? [...(config.agencies || []).filter(a => a !== 'all'), agency.id]
                                : (config.agencies || []).filter(a => a !== agency.id);
                              setConfig({ ...config, agencies: newAgencies });
                            }}
                            className="w-4 h-4"
                          />
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {agency.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.agencies && <p className="text-error text-xs mt-2">{errors.agencies}</p>}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-blue-900/20 border-blue-800' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
              }`}>
                💡 Tip: Select "All Sources" to see news from all agencies, or choose specific ones for a curated feed.
              </p>
            </div>
          </form>
        );

      default:
        return <div className="text-sm text-gray-500">No configuration options available for this widget type.</div>;
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`${widget.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Настройки`}
    >
      {renderConfigForm()}
    </Modal>
  );
}
