import { Mail, Archive, Settings, CalendarDays, Clock, Eye, Bot } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const EMAIL_PROVIDERS = [
  {
    id: 'gmail',
    name: 'Gmail',
    color: '#EA4335',
    logo: Mail,
    domain: 'gmail.com'
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    color: '#00BCF2',
    logo: Mail,
    domain: 'outlook.com'
  },
  {
    id: 'yandex',
    name: 'Yandex Mail',
    color: '#FF0000',
    logo: Mail,
    domain: 'yandex.ru'
  }
];

const TIME_FILTERS = [
  { key: 'unread', label: 'Все непрочитанные' },
  { key: '24h', label: 'Последние 24ч' },
  { key: 'week', label: 'Последняя неделя' },
  { key: 'month', label: 'Последний месяц' }
];

export default function EmailWidget({ config, isFullscreen = false }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [timeFilter, setTimeFilter] = useState('unread');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const summaryRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Use configured provider or default to Gmail for mock display
  const provider = EMAIL_PROVIDERS.find(p => p.id === (config.service || 'gmail'));

  const getMockEmails = () => {
    const now = Date.now();
    return [
      {
        id: '1',
        from: 'john.smith@company.com',
        subject: 'Обзор отчёта Q4 - Требуется срочное действие',
        preview: 'Пожалуйста, ознакомьтесь с прикреплённым финансовым отчётом Q4 и предоставьте обратную связь до конца дня.',
        fullContent: 'Уважаемая команда,\n\nПожалуйста, ознакомьтесь с прикреплённым финансовым отчётом Q4 и предоставьте обратную связь до конца дня.\nКлючевые метрики показывают рост выручки на 25.2% по сравнению с предыдущим кварталом.\n\nОсновные показатели:\n• Рост выручки на 25.2%\n• Снижение стоимости привлечения клиентов на 15%\n• Улучшение маржинальности прибыли на 8 пунктов\n\nПожалуйста, предоставьте своё одобрение до конца сегодняшнего дня.\n\nС наилучшими пожеланиями,\nДжон Смит\nГенеральный директор',
        time: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
        important: true,
        category: 'work',
        unread: true
      },
      {
        id: '2',
        subject: 'Добро пожаловать в Amazon Prime - Специальное предложение внутри',
        from: 'no-reply@amazon.com',
        preview: 'Поздравляем! Ваше членство Amazon Prime активировано. Наслаждайтесь эксклюзивными преимуществами.',
        time: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
        important: false,
        category: 'promo',
        unread: false
      },
      {
        id: '3',
        from: 'sarah.johnson@client.com',
        subject: 'Встреча завтра в 10:00 - Запуск проекта',
        preview: 'Обсудим предстоящие требования к проекту и сроки реализации новой системы.',
        fullContent: 'Привет,\n\nС нетерпением жду нашей встречи завтра в 10:00 для обсуждения предстоящих требований к проекту и сроков.\n\nПовестка дня:\n- Объём и цели проекта\n- Технические спецификации и архитектура\n- Обзор бюджета и распределение ресурсов\n- Сроки и этапы\n- Оценка рисков\n\nПожалуйста, подготовьтесь со своими вопросами и замечаниями.\n\nС наилучшими пожеланиями,\nСара Джонсон\nМенеджер по работе с клиентами',
        time: new Date(now - 5 * 60 * 60 * 1000), // 5 hours ago
        important: true,
        category: 'work',
        unread: true
      },
      {
        id: '4',
        from: 'noreply@twitter.com',
        subject: 'New tweet from someone you follow',
        preview: 'Mike Davis just tweeted about the latest tech trends',
        time: new Date(now - 48 * 60 * 60 * 1000), // 2 days ago
        important: false,
        category: 'social',
        unread: false
      },
      {
        id: '5',
        from: '2FA@microsoft.com',
        subject: 'Your Microsoft Account verification code',
        preview: 'Your verification code is: 123456. Do not share this code.',
        time: new Date(now - 30 * 60 * 1000), // 30 minutes ago
        important: false,
        category: 'auth',
        unread: false
      },
      {
        id: '6',
        from: 'mike.davis@partner.org',
        subject: 'Contract Approval Request - Legal Review Required',
        preview: 'The partnership contract has been drafted and ready for your approval.',
        fullContent: 'Dear Partner,\n\nThe partnership contract for our new collaboration has been drafted by our legal team. Please review the attached document and provide your approval before proceeding.\n\nKey terms:\n- 12-month initial agreement\n- Performance-based bonuses\n- Standardized deliverables\n- Quarterly reviews\n\nPlease review and sign by end of week.\n\nSincerely,\nMike Davis\nBusiness Development\npartner.org',
        time: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
        important: true,
        category: 'work',
        unread: true
      },
      {
        id: '7',
        from: 'newsletter@techcrunch.com',
        subject: '🚀 Daily Tech News Digest',
        preview: 'Today\'s top stories: AI breakthroughs, startup funding, and more...',
        time: new Date(now - 6 * 60 * 60 * 1000), // 6 hours ago
        important: false,
        category: 'promo',
        unread: false
      },
      {
        id: '8',
        from: 'emma.wilson@vendor.com',
        subject: 'Invoice Payment Reminder - Due This Week',
        preview: 'This is a friendly reminder that invoice #INV-2024-1234 is due on November 18th.',
        fullContent: 'Hello,\n\nThis is a friendly reminder that invoice #INV-2024-1234 for our services rendered in October is due on November 18th.\n\nInvoice Details:\n- Invoice #: INV-2024-1234\n- Amount: $5,420.00\n- Due Date: November 18, 2024\n- Services: Q3 Consulting Services\n\nPlease process payment at your earliest convenience.\n\nThank you,\nEmma Wilson\nAccounts Receivable\nvendor.com',
        time: new Date(now - 4 * 60 * 60 * 1000), // 4 hours ago
        important: true,
        category: 'work',
        unread: true
      },
      {
        id: '9',
        from: 'security@github.com',
        subject: 'New sign-in from Windows device',
        preview: 'We detected a new sign-in to your GitHub account from a Windows device.',
        time: new Date(now - 18 * 60 * 60 * 1000), // 18 hours ago
        important: false,
        category: 'auth',
        unread: false
      },
      {
        id: '10',
        from: 'david.chen@marketing.com',
        subject: 'Marketing Campaign Results - Q4 Performance',
        preview: 'Great news! Our Q4 marketing campaign exceeded expectations with a 35% increase in conversions.',
        fullContent: 'Team,\n\nGreat news! Our Q4 marketing campaign exceeded expectations with impressive results:\n\n📊 Campaign Performance:\n• Conversion rate: +35%\n• Click-through rate: +28%\n• Cost per acquisition: -22%\n• ROI: 340%\n\n🎯 Top performing channels:\n1. Email marketing (42% of conversions)\n2. Social media ads (31%)\n3. Content marketing (27%)\n\nLet\'s schedule a meeting to discuss scaling these strategies for Q1.\n\nBest regards,\nDavid Chen\nMarketing Director',
        time: new Date(now - 7 * 60 * 60 * 1000), // 7 hours ago
        important: true,
        category: 'work',
        unread: true
      },
      {
        id: '11',
        from: 'notifications@linkedin.com',
        subject: 'You have 5 new connection requests',
        preview: 'People are trying to connect with you on LinkedIn. View and respond to requests.',
        time: new Date(now - 36 * 60 * 60 * 1000), // 1.5 days ago
        important: false,
        category: 'social',
        unread: false
      },
      {
        id: '12',
        from: 'hr@company.com',
        subject: 'Annual Leave Request - Approval Needed',
        preview: 'Please review and approve the annual leave request submitted by your team member.',
        fullContent: 'Hi,\n\nYou have a new annual leave request requiring your approval:\n\nEmployee: Jessica Martinez\nDepartment: Engineering\nLeave Period: Dec 20-30, 2024 (10 days)\nReason: Family vacation\n\nPlease review and respond within 48 hours.\n\nHR Team',
        time: new Date(now - 12 * 60 * 60 * 1000), // 12 hours ago
        important: true,
        category: 'work',
        unread: true
      }
    ];
  };

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual email API integration
      const mockAllEmails = getMockEmails();

      // Filter emails based on config filters (remove spam, promo, etc.)
      // In demo mode, filtering is enabled by default to showcase the feature
      const shouldFilter = config.filterSpam !== false; // Default to true if not set
      const filteredEmails = mockAllEmails.filter(email => {
        if (shouldFilter && ['promo', 'social', 'auth'].includes(email.category)) {
          return false; // Filter out spam/non-essential
        }
        return true;
      });

      setEmails(filteredEmails);
      setFilteredEmails(filteredEmails.filter(e => e.unread));
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Always show mock data to demonstrate functionality
    fetchEmails();
  }, [config.configured]);

  // Apply time filter
  useEffect(() => {
    const now = Date.now();
    let filtered = [];

    switch (timeFilter) {
      case 'unread':
        filtered = emails.filter(e => e.unread);
        break;
      case '24h':
        filtered = emails.filter(e => (now - e.time.getTime()) < 24 * 60 * 60 * 1000);
        break;
      case 'week':
        filtered = emails.filter(e => (now - e.time.getTime()) < 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filtered = emails.filter(e => (now - e.time.getTime()) < 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        filtered = emails;
    }

    setFilteredEmails(filtered);
  }, [emails, timeFilter]);

  const handleSummarize = async () => {
    if (!filteredEmails.length) return;

    setIsSummarizing(true);
    try {
      // Mock AI summary - replace with OpenAI service when API key is configured
      const importantCount = filteredEmails.filter(e => e.important).length;
      const generatedSummary = `📊 Email Summary - ${filteredEmails.length} emails analyzed:

🔴 High Priority (${importantCount}):
${filteredEmails.filter(e => e.important).slice(0, 3).map(e => 
  `• ${e.subject} from ${e.from.split('@')[0]} - ${e.preview.substring(0, 60)}...`
).join('\n')}

📈 Key Statistics:
• Total important emails: ${importantCount}
• Unread emails: ${filteredEmails.filter(e => e.unread).length}
• Work-related: ${filteredEmails.filter(e => e.category === 'work').length}

✅ Suggested Actions:
1. Review Q4 financial report (urgent - due today)
2. Prepare for tomorrow's 10 AM client meeting
3. Complete legal review for partnership contract
4. Follow up on pending approvals

${!config.configured ? '\n💡 Demo Summary - Configure API key for AI-powered email summaries' : ''}`;

      setSummary(generatedSummary);
      setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      setIsSummarizing(false);
    } catch (error) {
      console.error('Summary failed:', error);
      setSummary('Failed to generate email summary. Please check your API configuration.');
      setIsSummarizing(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getAvatarColor = (email) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    return colors[Math.abs(hash) % colors.length];
  };

  const handleWidgetWheel = (e) => {
    const scrollContainer = scrollContainerRef.current;
    const isModifierZoom = e.ctrlKey || e.metaKey;

    if (isModifierZoom) {
      return; // allow intentional canvas zoom gestures
    }

    if (!scrollContainer) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
    const isInteractingWithScrollableArea = scrollContainer.contains(e.target);

    e.stopPropagation();

    if (!isScrollable) {
      e.preventDefault();
      return;
    }

    if (!isInteractingWithScrollableArea) {
      e.preventDefault();
      const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const nextScrollTop = clamp(scrollContainer.scrollTop + e.deltaY, 0, maxScrollTop);
      scrollContainer.scrollTop = nextScrollTop;
      return;
    }

    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;
    const isAtTop = scrollTop <= 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
      e.preventDefault();
    }
  };

  return (
    <div
      className="p-4 h-full flex flex-col overflow-hidden"
      data-canvas-wheel-lock="true"
      onWheel={handleWidgetWheel}
    >
      {/* Demo Banner */}
      {!config.configured && (
        <div 
          className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          style={theme === 'light' ? { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' } : {}}
        >
          <p 
            className="text-xs text-blue-700 dark:text-blue-300 font-medium"
            style={theme === 'light' ? { color: '#000000' } : {}}
          >
            📧 Демо-режим - Настройте виджет для подключения реальной почты
          </p>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <SkeletonLoader className="h-full" lines={6} />
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto space-y-4 pr-1 h-full"
            style={{ maxHeight: isFullscreen ? 'calc(100vh - 250px)' : '100%' }}
          >
            {selectedEmail ? (
              /* Email Reading Interface */
              <div className="space-y-4 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
                  >
                    ← Back to Inbox
                  </button>
                  {provider && (
                    <div 
                      className="flex items-center gap-2 text-xs dark:text-gray-100"
                      style={theme === 'light' ? { color: '#111827' } : {}}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: provider.color }}
                      >
                        {provider.name.charAt(0)}
                      </div>
                      <span>{provider.name} • {config.email || 'demo@example.com'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 
                    className="font-semibold text-sm mb-2 dark:text-gray-100"
                    style={theme === 'light' ? { color: '#111827' } : {}}
                  >
                    {selectedEmail.subject}
                  </h3>
                  <div 
                    className="flex items-center gap-2 mb-4 text-xs dark:text-gray-400"
                    style={theme === 'light' ? { color: '#4b5563' } : {}}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(selectedEmail.from)}`}>
                      {selectedEmail.from.charAt(0).toUpperCase()}
                    </div>
                    <span>{selectedEmail.from}</span>
                    <span>•</span>
                    <span>{formatTime(selectedEmail.time)}</span>
                  </div>

                  <div 
                    className="text-sm whitespace-pre-line dark:text-gray-100"
                    style={theme === 'light' ? { color: '#111827' } : {}}
                  >
                    {selectedEmail.fullContent}
                  </div>
                </div>
              </div>
            ) : (
              /* Inbox View */
              <div className="space-y-4 flex flex-col">
                {/* Header with service info */}
                {provider && (
                  <div 
                    className="flex items-center justify-between pb-2 border-b dark:border-gray-700"
                    style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: provider.color }}
                      >
                        {provider.name.charAt(0)}
                      </div>
                      <div>
                        <p 
                          className="font-semibold text-sm dark:text-gray-100"
                          style={theme === 'light' ? { color: '#111827' } : {}}
                        >
                          {provider.name}
                        </p>
                        <p 
                          className="text-xs dark:text-gray-400"
                          style={theme === 'light' ? { color: '#4b5563' } : {}}
                        >
                          {config.email || 'demo@example.com'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className={`w-4 h-4 ${config.configured ? 'text-green-500' : 'text-gray-400'}`} />
                      <span 
                        className="text-xs dark:text-gray-400"
                        style={theme === 'light' ? { color: '#4b5563' } : {}}
                      >
                        {config.configured ? 'Connected' : 'Demo'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Time Filter Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {TIME_FILTERS.map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setTimeFilter(filter.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        timeFilter === filter.key
                          ? 'bg-blue-500 text-white'
                          : 'dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600'
                      }`}
                      style={timeFilter !== filter.key && theme === 'light' ? { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' } : {}}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Email Count Summary */}
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm font-medium dark:text-gray-100"
                    style={theme === 'light' ? { color: '#111827' } : {}}
                  >
                    {filteredEmails.filter(e => e.important).length} важных писем
                  </span>
                  <span 
                    className="text-xs dark:text-gray-400"
                    style={theme === 'light' ? { color: '#4b5563' } : {}}
                  >
                    {filteredEmails.length} всего
                  </span>
                </div>

                {/* Actions */}
                <div 
                  className="space-y-2 pt-2 border-t dark:border-gray-700"
                  style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
                >
                  <button
                    onClick={handleSummarize}
                    disabled={!filteredEmails.length || isSummarizing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    <Bot className="w-4 h-4" />
                    {isSummarizing ? 'Анализирую...' : `Проанализировать ${filteredEmails.length} писем`}
                  </button>

                  {!config.configured && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                      💡 Демо-режим - Настройте виджет для реальных ИИ-сводок
                    </p>
                  )}
                </div>

                {/* AI Summary Results */}
                {summary && (
                  <div 
                    ref={summaryRef} 
                    className="p-3 dark:bg-gray-800 rounded-lg border dark:border-gray-700"
                    style={theme === 'light' ? { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' } : {}}
                  >
                    <h4 
                      className="font-semibold text-sm mb-2 flex items-center gap-2 dark:text-gray-100"
                      style={theme === 'light' ? { color: '#111827' } : {}}
                    >
                      <Bot className="w-4 h-4" />
                      ИИ-сводка
                    </h4>
                    <pre 
                      className="text-xs whitespace-pre-wrap dark:text-gray-300 font-mono leading-relaxed"
                      style={theme === 'light' ? { color: '#374151' } : {}}
                    >
                      {summary}
                    </pre>
                  </div>
                )}

                {/* Email List - Scrollable */}
                <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                  {filteredEmails.map((email) => {
                    const getBgStyle = () => {
                      if (theme === 'dark') return {};
                      if (email.category === 'promo') return { backgroundColor: '#fef2f2' }; // red-50
                      if (email.important) return { backgroundColor: '#eff6ff' }; // blue-50
                      if (email.category === 'work') return { backgroundColor: '#f0fdf4' }; // green-50
                      return { backgroundColor: '#f9fafb' }; // gray-50
                    };
                    
                    const getBorderStyle = () => {
                      if (theme === 'dark') return {};
                      if (email.category === 'promo') return { borderColor: '#fecaca' }; // red-200
                      if (email.important) return { borderColor: '#bfdbfe' }; // blue-200
                      if (email.category === 'work') return { borderColor: '#bbf7d0' }; // green-200
                      return { borderColor: '#e5e7eb' }; // gray-200
                    };
                    
                    return (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className="p-3 rounded-lg cursor-pointer transition-colors border dark:bg-gray-800 dark:border-gray-700 hover:opacity-90"
                        style={{ ...getBgStyle(), ...getBorderStyle() }}
                      >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(email.from)}`}>
                              {email.from.charAt(0).toUpperCase()}
                            </div>
                            <p 
                              className="font-medium text-sm truncate dark:text-gray-100"
                              style={theme === 'light' ? { color: '#111827' } : {}}
                            >
                              {email.from}
                            </p>
                            {email.important && (
                              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p 
                            className="font-medium text-sm truncate mb-1 dark:text-gray-100"
                            style={theme === 'light' ? { color: '#111827' } : {}}
                          >
                            {email.subject}
                          </p>
                          <p 
                            className="text-xs truncate dark:text-gray-400"
                            style={theme === 'light' ? { color: '#4b5563' } : {}}
                          >
                            {email.preview}
                          </p>
                        </div>
                        <span 
                          className="text-xs ml-2 flex-shrink-0 dark:text-gray-400"
                          style={theme === 'light' ? { color: '#4b5563' } : {}}
                        >
                          {formatTime(email.time)}
                        </span>
                      </div>
                      {email.category && (
                        <div className="flex items-center gap-1 mt-2">
                          {email.category === 'work' && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full capitalize dark:bg-gray-600 dark:text-gray-300"
                              style={theme === 'light' ? { backgroundColor: '#dcfce7', color: '#15803d' } : {}}
                            >
                              {email.category}
                            </span>
                          )}
                          {email.category === 'promo' && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full capitalize dark:bg-gray-600 dark:text-gray-300"
                              style={theme === 'light' ? { backgroundColor: '#fee2e2', color: '#b91c1c' } : {}}
                            >
                              {email.category}
                            </span>
                          )}
                          {email.category === 'social' && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full capitalize dark:bg-gray-600 dark:text-gray-300"
                              style={theme === 'light' ? { backgroundColor: '#f3e8ff', color: '#7c3aed' } : {}}
                            >
                              {email.category}
                            </span>
                          )}
                          {email.category === 'auth' && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full capitalize dark:bg-gray-600 dark:text-gray-300"
                              style={theme === 'light' ? { backgroundColor: '#fef3c7', color: '#a16207' } : {}}
                            >
                              {email.category}
                            </span>
                          )}
                          {!['work', 'promo', 'social', 'auth'].includes(email.category) && (
                            <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                              {email.category}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
