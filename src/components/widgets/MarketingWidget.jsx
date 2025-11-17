import { Megaphone, Eye, MousePointerClick, Settings, DollarSign, TrendingUp, TrendingDown, ShoppingCart, Receipt, X, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';
import Portal from '../Portal';

// Mock data for revenue sources (customer purchases)
const mockRevenueSources = [
  { id: 1, customer: 'Acme Corporation', product: 'Enterprise Plan', amount: 12499.99, date: '2024-11-14' },
  { id: 2, customer: 'TechStart Inc.', product: 'Pro Plan', amount: 4999.00, date: '2024-11-13' },
  { id: 3, customer: 'Global Solutions Ltd', product: 'Premium Support', amount: 2499.50, date: '2024-11-12' },
  { id: 4, customer: 'Digital Ventures', product: 'Custom Integration', amount: 8750.00, date: '2024-11-11' },
  { id: 5, customer: 'Innovation Hub', product: 'Enterprise Plan', amount: 12499.99, date: '2024-11-10' },
  { id: 6, customer: 'Smart Systems', product: 'Pro Plan', amount: 4999.00, date: '2024-11-09' },
  { id: 7, customer: 'Future Tech', product: 'Starter Plan', amount: 1999.00, date: '2024-11-08' },
  { id: 8, customer: 'Cloud Nine Co.', product: 'Premium Support', amount: 2499.50, date: '2024-11-07' },
  { id: 9, customer: 'DataFlow Inc.', product: 'Custom Integration', amount: 7500.00, date: '2024-11-06' },
  { id: 10, customer: 'Quantum Labs', product: 'Enterprise Plan', amount: 12499.99, date: '2024-11-05' },
];

// Mock data for expense sources
const mockExpenseSources = [
  { id: 1, category: 'Rent', description: 'Office Space - November', amount: 8500.00, date: '2024-11-01' },
  { id: 2, category: 'Utilities', description: 'Electricity Bill', amount: 1245.50, date: '2024-11-03' },
  { id: 3, category: 'Utilities', description: 'Internet & Phone', amount: 890.00, date: '2024-11-03' },
  { id: 4, category: 'Taxes', description: 'Business Tax Q4', amount: 5600.00, date: '2024-11-05' },
  { id: 5, category: 'Salaries', description: 'Employee Payroll', amount: 45000.00, date: '2024-11-01' },
  { id: 6, category: 'Marketing', description: 'Google Ads Campaign', amount: 3200.00, date: '2024-11-07' },
  { id: 7, category: 'Software', description: 'Cloud Services (AWS)', amount: 2890.00, date: '2024-11-08' },
  { id: 8, category: 'Software', description: 'SaaS Subscriptions', amount: 1560.00, date: '2024-11-08' },
  { id: 9, category: 'Office Supplies', description: 'Equipment & Supplies', amount: 780.00, date: '2024-11-09' },
  { id: 10, category: 'Insurance', description: 'Business Insurance', amount: 2100.00, date: '2024-11-10' },
];

export default function MarketingWidget({ config = {}, isFullscreen = false }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [detailsModal, setDetailsModal] = useState(null); // 'revenue' or 'expenses'
  
  // Calculate totals
  const totalRevenue = mockRevenueSources.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = mockExpenseSources.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Mock previous month data for comparison (80% of current)
  const prevMonthRevenue = totalRevenue * 0.8;
  const prevMonthExpenses = totalExpenses * 1.1; // Expenses decreased
  
  const revenueChangePercent = ((totalRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1);
  const expensesChangePercent = ((totalExpenses - prevMonthExpenses) / prevMonthExpenses * 100).toFixed(1);

  const allPlatforms = [
    { name: 'Yandex Metrika', key: 'ymetrica', stats: [
      { label: 'Посещения', value: '42.1K', icon: Eye, change: '+15%' },
      { label: 'Просмотры', value: '198.5K', icon: Eye, change: '+22%' },
      { label: 'Показатель отказов', value: '24.5%', icon: MousePointerClick, change: '-5%' }
    ]},
    { name: 'Google Analytics', key: 'google-analytics', stats: [
      { label: 'Пользователи', value: '18.3K', icon: Eye, change: '+8%' },
      { label: 'Сеансы', value: '24.6K', icon: MousePointerClick, change: '+12%' },
      { label: 'Ср. сеанс', value: '4:32', icon: Megaphone, change: '+0:15' }
    ]},
    { name: 'Facebook Ads', key: 'facebook-ads', stats: [
      { label: 'Показы', value: '89.2K', icon: Eye, change: '+28%' },
      { label: 'Клики', value: '3.4K', icon: MousePointerClick, change: '+18%' },
      { label: 'CTR', value: '3.8%', icon: Megaphone, change: '+1.2%' }
    ]},
    { name: 'VK Ads', key: 'vk-ads', stats: [
      { label: 'Охват', value: '76.8K', icon: Eye, change: '+20%' },
      { label: 'Клики', value: '4.1K', icon: MousePointerClick, change: '+25%' },
      { label: 'Конверсия', value: '2.1%', icon: Megaphone, change: '+0.8%' }
    ]},
    { name: 'Google Ads', key: 'google-ads', stats: [
      { label: 'Показы', value: '156.7K', icon: Eye, change: '+34%' },
      { label: 'Клики', value: '5.8K', icon: MousePointerClick, change: '+22%' },
      { label: 'CPC', value: '$0.45', icon: Megaphone, change: '-$0.05' }
    ]}
  ];

  const platform = config.platform ? allPlatforms.find(p => p.key === config.platform) : allPlatforms[0];
  const stats = platform?.stats || allPlatforms[0].stats;

  useEffect(() => {
    // Show loading animation on first render
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderDetailsModal = () => {
    if (!detailsModal) return null;

    const isRevenue = detailsModal === 'revenue';
    const data = isRevenue ? mockRevenueSources : mockExpenseSources;
    const title = isRevenue ? 'Источники доходов' : 'Распределение расходов';

    return (
      <Portal>
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001]"
          onClick={() => setDetailsModal(null)}
        >
          <div
            className={`${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-2xl shadow-2xl border max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                {isRevenue ? (
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Receipt className="w-5 h-5 text-red-600" />
                  </div>
                )}
                <h3 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
              </div>
              <button
                onClick={() => setDetailsModal(null)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {data.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 border-gray-700 hover:bg-gray-900'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isRevenue ? (
                            <>
                              <span className={`font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {item.customer}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {item.product}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className={`font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {item.category}
                              </span>
                            </>
                          )}
                        </div>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {isRevenue ? 'Purchase' : item.description}
                        </p>
                        <p className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {formatDate(item.date)}
                        </p>
                      </div>
                      <div className={`text-right font-bold ${
                        isRevenue ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isRevenue ? '+' : '-'}{formatCurrency(item.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with total */}
            <div className={`p-6 border-t ${
              theme === 'dark' ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {isRevenue ? 'Общий доход' : 'Общие расходы'}
                </span>
                <span className={`text-xl font-bold ${
                  isRevenue ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(isRevenue ? totalRevenue : totalExpenses)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    );
  };

  return (
    <>
      <div className="p-4 h-full flex flex-col overflow-hidden">
        {isLoading ? (
          <SkeletonLoader className="p-4" lines={8} />
        ) : (
          <div className="space-y-3 h-full overflow-y-auto overflow-x-hidden">
            {/* Revenue Card - Clickable */}
            <button
              onClick={() => setDetailsModal('revenue')}
              className={`w-full p-4 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15 hover:border-green-500/50' 
                  : 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-green-500/20">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    Общий доход
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <div className="flex items-end justify-between mt-2">
                <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(totalRevenue)}
                </span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">
                    +{revenueChangePercent}%
                  </span>
                </div>
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                vs. last month
              </p>
            </button>

            {/* Expenses Card - Clickable */}
            <button
              onClick={() => setDetailsModal('expenses')}
              className={`w-full p-4 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15 hover:border-red-500/50' 
                  : 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-red-500/20">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  </div>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    Общие расходы
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <div className="flex items-end justify-between mt-2">
                <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(totalExpenses)}
                </span>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">
                    {expensesChangePercent}%
                  </span>
                </div>
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                vs. last month (decreased)
              </p>
            </button>

            {/* Net Profit Card */}
            <div className={`p-4 rounded-lg border ${
              netProfit >= 0
                ? theme === 'dark' 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-blue-50 border-blue-200'
                : theme === 'dark'
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${
                  netProfit >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'
                }`}>
                  <DollarSign className={`w-4 h-4 ${
                    netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`} />
                </div>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Чистая прибыль
                </span>
              </div>
              <div className="flex items-end justify-between mt-2">
                <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(netProfit)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  netProfit >= 0
                    ? theme === 'dark'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-green-100 text-green-700'
                    : theme === 'dark'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-red-100 text-red-700'
                }`}>
                  {netProfit >= 0 ? 'Profitable' : 'Loss'}
                </span>
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Revenue - Expenses
              </p>
            </div>

            {/* Info hint */}
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
            }`}>
              <p className={`text-xs text-center ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
              }`}>
                💡 Кликните на Доходы или Расходы для подробной разбивки
              </p>
            </div>
          </div>
        )}
      </div>

      {renderDetailsModal()}
    </>
  );
}
