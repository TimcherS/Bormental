import React, { useState, useEffect } from 'react';
import { Type, MessageCircle, BarChart3, Users, Mail, Calendar, DollarSign, Target, Palette, Zap, Lock, Globe } from 'lucide-react';
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
        if (!config.platform) newErrors.platform = 'Please select a platform';
        if (config.apiKey && !config.apiSecret) newErrors.apiSecret = 'API Secret is required';
        break;
      case 'email':
        if (!config.service) newErrors.service = 'Please select an email service';
        if (!config.email) newErrors.email = 'Email address is required';
        if (!config.password && !config.apiKey) newErrors.password = 'Password or API Key is required';
        break;
      case 'calendar':
        if (!config.source) newErrors.source = 'Please select a calendar source';
        if (config.source && !config.apiKey) newErrors.apiKey = 'API Key is required';
        if (!config.calendarName) newErrors.calendarName = 'Calendar name is required';
        break;
      case 'revenue':
        if (!config.accountingSystem) newErrors.accountingSystem = 'Please select an accounting system';
        break;
      case 'marketing':
        if (!config.platform) newErrors.platform = 'Please select a marketing platform';
        break;
      case 'chatgpt':
        if (!config.apiKey) newErrors.apiKey = 'OpenAI API key is required';
        // Validate API key format
        if (config.apiKey && !config.apiKey.startsWith('sk-')) {
          newErrors.apiKey = 'API key must start with "sk-"';
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
                  }`}>Note Settings</h4>
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
                    placeholder="Enter widget name (e.g., 'Meeting Notes')"
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
                      Font Size
                    </span>
                  </label>
                  <SelectComponent
                    value={config.fontSize || 'medium'}
                    onValueChange={(value) => setConfig({ ...config, fontSize: value })}
                    options={[
                      { value: 'small', label: 'Small' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'large', label: 'Large' }
                    ]}
                    placeholder="Select font size"
                    theme={theme}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Palette className="w-3 h-3" />
                      Background Color
                    </span>
                  </label>
                  <SelectComponent
                    value={config.backgroundColor || 'default'}
                    onValueChange={(value) => setConfig({ ...config, backgroundColor: value })}
                    options={[
                      { value: 'default', label: 'Default' },
                      { value: 'yellow', label: 'Yellow' },
                      { value: 'blue', label: 'Blue' },
                      { value: 'green', label: 'Green' },
                      { value: 'pink', label: 'Pink' }
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
                  }`}>API Configuration</h4>
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
                    placeholder="Enter widget name (e.g., 'AI Assistant')"
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
                      OpenAI API Key
                    </span>
                  </label>
                  <input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Enter your OpenAI API key (sk-...)"
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
                  }`}>Model Settings</h4>
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
                      Max Tokens
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
                  }`}>Prompt Settings</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <MessageCircle className="w-3 h-3" />
                      System Prompt
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
                  }`}>Basic Settings</h4>
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
                  }`}>Filter Settings</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Zap className="w-3 h-3" />
                      Filter Preferences
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
                      <Globe className="w-3 h-3" />
                      Calendar Source
                    </span>
                  </label>
                  <SelectComponent
                    value={config.source || ''}
                    onValueChange={(value) => setConfig({ ...config, source: value })}
                    options={[
                      { value: 'bitrix24', label: 'Битрикс24' },
                      { value: 'amocrm', label: 'AmoCRM' },
                      { value: 'yandex', label: 'Яндекс Трекер' },
                      { value: 'google', label: 'Google Calendar' }
                    ]}
                    placeholder="Select calendar source"
                    theme={theme}
                  />
                  {errors.source && <p className="text-error text-xs mt-2">{errors.source}</p>}
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
                    placeholder="Enter calendar name"
                    className={`input input-bordered w-full py-2.5 px-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.calendarName && <p className="text-error text-xs mt-2">{errors.calendarName}</p>}
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
                  }`}>Campaign Settings</h4>
                </div>
                <div className="space-y-2">
                  <label className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    <span className="flex items-center gap-2 font-medium text-sm">
                      <Zap className="w-3 h-3" />
                      Campaign Selection
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

      default:
        return <div className="text-sm text-gray-500">No configuration options available for this widget type.</div>;
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`${widget.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Settings`}
    >
      {renderConfigForm()}
    </Modal>
  );
}
