import { MessageSquare, Mail, Calendar, TrendingUp, BarChart3, Megaphone, Bot, FileText, Newspaper } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const widgetTypes = [
  { id: 'social-media', icon: MessageSquare, label: 'Соцсети', color: 'bg-blue-500' },
  { id: 'email', icon: Mail, label: 'Анализ почты', color: 'bg-green-500' },
  { id: 'calendar', icon: Calendar, label: 'Календарь', color: 'bg-purple-500' },
  { id: 'revenue', icon: TrendingUp, label: 'Отслеживание доходов', color: 'bg-yellow-500' },
  { id: 'chart', icon: BarChart3, label: 'График', color: 'bg-pink-500' },
  { id: 'marketing', icon: Megaphone, label: 'Маркетинговая аналитика', color: 'bg-orange-500' },
  { id: 'chatgpt', icon: Bot, label: 'ИИ-помощник', color: 'bg-violet-500' },
  { id: 'note', icon: FileText, label: 'Заметка', color: 'bg-gray-500' },
  { id: 'news', icon: Newspaper, label: 'Анализ новостей', color: 'bg-indigo-500' }
];

export default function WidgetSelector({ onSelect, onClose }) {
  const { theme } = useTheme();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Selector Menu - Positioned higher to avoid collision */}
      <div className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-50 ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      } border ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      } rounded-2xl shadow-2xl p-4 animate-[slide-up_0.2s_ease-out] w-[90vw] max-w-lg`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {widgetTypes.map((widget) => (
            <button
              key={widget.id}
              onClick={() => onSelect(widget.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border touch-manipulation transition-all btn-hover-scale ${
                theme === 'dark'
                  ? 'border-gray-800 hover:border-gray-600 active:border-gray-500 bg-gray-900/20 hover:bg-gray-800/50'
                  : 'border-gray-200 hover:border-gray-400 active:border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 ${widget.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                <widget.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-medium text-center leading-snug ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {widget.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
