import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';

// Mock data for demonstration
const mockData = [
  { name: 'Jan', value: 400, revenue: 2400, costs: 1400 },
  { name: 'Feb', value: 300, revenue: 1398, costs: 1200 },
  { name: 'Mar', value: 200, revenue: 9800, costs: 2200 },
  { name: 'Apr', value: 278, revenue: 3908, costs: 1800 },
  { name: 'May', value: 189, revenue: 4800, costs: 1600 },
  { name: 'Jun', value: 239, revenue: 3800, costs: 1900 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ChartWidget({ config, isFullscreen = false }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const chartType = config?.chartType || 'area';
  const dataSource = config?.dataSource || 'mock-revenue';
  const title = config?.title || 'Revenue Trend';
  const yLabel = config?.yLabel || 'Value';
  const color = config?.color || '#8884d8';

  // Select data key based on data source
  const dataKey = dataSource === 'mock-costs' ? 'costs' :
                  dataSource === 'mock-custom' ? 'value' : 'revenue';

  const data = mockData;

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
    };
    loadData();
  }, [dataSource]); // Reload when data source changes

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.6}
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius="80%"
              fill={color}
              dataKey={dataKey}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
          </PieChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'p-6' : 'p-2'}`}>
      <div className="mb-2 flex-shrink-0">
        <h3 className={`${isFullscreen ? 'text-xl' : 'text-sm'} font-medium text-gray-900 dark:text-gray-100`}>
          {title}
        </h3>
        <p className={`${isFullscreen ? 'text-base' : 'text-xs'} text-gray-600 dark:text-gray-400`}>
          Monthly performance
        </p>
      </div>
      <div className="flex-1 min-h-0 [&_*]:outline-none [&_*:focus]:outline-none">
        {isLoading ? (
          <div className="h-full flex flex-col justify-center">
            <SkeletonLoader className="mb-3" />
            <SkeletonLoader lines={2} className="w-3/4" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
