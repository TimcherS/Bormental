import { Megaphone, Eye, MousePointerClick, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';

export default function MarketingWidget({ config, isFullscreen = false }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(!config.configured);
  const allPlatforms = [
    { name: 'Yandex Metrika', key: 'ymetrica', stats: [
      { label: 'Visits', value: '42.1K', icon: Eye, change: '+15%' },
      { label: 'Views', value: '198.5K', icon: Eye, change: '+22%' },
      { label: 'Bounce Rate', value: '24.5%', icon: MousePointerClick, change: '-5%' }
    ]},
    { name: 'Google Analytics', key: 'google-analytics', stats: [
      { label: 'Users', value: '18.3K', icon: Eye, change: '+8%' },
      { label: 'Sessions', value: '24.6K', icon: MousePointerClick, change: '+12%' },
      { label: 'Avg. Session', value: '4:32', icon: Megaphone, change: '+0:15' }
    ]},
    { name: 'Facebook Ads', key: 'facebook-ads', stats: [
      { label: 'Impressions', value: '89.2K', icon: Eye, change: '+28%' },
      { label: 'Clicks', value: '3.4K', icon: MousePointerClick, change: '+18%' },
      { label: 'CTR', value: '3.8%', icon: Megaphone, change: '+1.2%' }
    ]},
    { name: 'VK Ads', key: 'vk-ads', stats: [
      { label: 'Reach', value: '76.8K', icon: Eye, change: '+20%' },
      { label: 'Clicks', value: '4.1K', icon: MousePointerClick, change: '+25%' },
      { label: 'Conversion', value: '2.1%', icon: Megaphone, change: '+0.8%' }
    ]},
    { name: 'Google Ads', key: 'google-ads', stats: [
      { label: 'Impressions', value: '156.7K', icon: Eye, change: '+34%' },
      { label: 'Clicks', value: '5.8K', icon: MousePointerClick, change: '+22%' },
      { label: 'CPC', value: '$0.45', icon: Megaphone, change: '-$0.05' }
    ]}
  ];

  const platform = config.platform ? allPlatforms.find(p => p.key === config.platform) : allPlatforms[0];
  const stats = platform?.stats || allPlatforms[0].stats;

  useEffect(() => {
    if (config.configured) {
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [config.configured, config.platform]);

  return (
    <div className={`p-4 h-full flex flex-col ${!config.configured ? 'justify-center' : ''}`}>
      {!config.configured ? (
        <div className="flex flex-col items-center justify-center text-center text-gray-600 dark:text-gray-400">
          <Settings className="w-12 h-12 mb-2 opacity-30" />
          <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">Configure marketing platform</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Select platform and enter API details</p>
        </div>
      ) : isLoading ? (
        <SkeletonLoader className="p-4" lines={8} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              {platform ? `${platform.name} Stats` : 'Marketing Overview'}
            </h3>
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-500" />
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Connected</span>
            </div>
          </div>
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{stat.value}</span>
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-blue-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
