import { TrendingUp, TrendingDown, DollarSign, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';

export default function RevenueWidget({ config, isFullscreen = false }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const allMetrics = [
    { label: 'Доходы', value: '$124,500', change: '+25.2%', trend: 'up', key: 'revenue' },
    { label: 'Расходы', value: '$45,200', change: '-8.1%', trend: 'down', key: 'expenses' },
    { label: 'Прибыль', value: '$79,300', change: '+32.5%', trend: 'up', key: 'profit' },
    { label: 'Рост', value: '+15.4%', change: '+3.2%', trend: 'up', key: 'growth' }
  ];

  const metrics = config.metrics ? allMetrics.filter(metric => config.metrics.includes(metric.key)) : allMetrics;

  useEffect(() => {
    if (config.configured) {
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [config.configured]);

  return (
    <div className="h-full flex flex-col p-2">
      {!config.configured ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-8 dark:text-gray-400">
          <Settings className="w-12 h-12 mb-2 opacity-30" />
          <p 
            className="text-sm dark:text-gray-300"
            style={theme === 'light' ? { color: '#374151' } : {}}
          >
            Настроить отслеживание доходов
          </p>
          <p 
            className="text-xs mt-1 dark:text-gray-400"
            style={theme === 'light' ? { color: '#4b5563' } : {}}
          >
            Выберите систему учёта и метрики
          </p>
        </div>
      ) : (
        <>
          {isLoading ? (
            <SkeletonLoader className="p-4" lines={6} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="font-medium text-sm dark:text-gray-100"
                  style={theme === 'light' ? { color: '#111827' } : {}}
                >
                  {config.accountingSystem ? `Метрики ${config.accountingSystem.charAt(0).toUpperCase() + config.accountingSystem.slice(1)}` : 'Обзор доходов'}
                </h3>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span 
                    className="text-xs dark:text-gray-400"
                    style={theme === 'light' ? { color: '#4b5563' } : {}}
                  >
                    Подключено
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {metrics.map((metric, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span 
                        className="text-sm dark:text-gray-400"
                        style={theme === 'light' ? { color: '#4b5563' } : {}}
                      >
                        {metric.label}
                      </span>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {metric.change}
                      </div>
                    </div>
                    <div 
                      className="text-2xl font-bold dark:text-white"
                      style={theme === 'light' ? { color: '#111827' } : {}}
                    >
                      {metric.value}
                    </div>
                    <p 
                      className="text-xs dark:text-gray-400 mt-1"
                      style={theme === 'light' ? { color: '#4b5563' } : {}}
                    >
                      по сравнению с прошлым месяцем
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
