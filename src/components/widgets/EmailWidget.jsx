import { Mail, Archive, Settings, CalendarDays, Clock, Eye, Bot } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import SkeletonLoader from '../SkeletonLoader';

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
  { key: 'unread', label: 'All Unread' },
  { key: '24h', label: 'Last 24h' },
  { key: 'week', label: 'Last Week' },
  { key: 'month', label: 'Last Month' }
];

export default function EmailWidget({ config, isFullscreen = false }) {
  const [isLoading, setIsLoading] = useState(!config.configured);
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [timeFilter, setTimeFilter] = useState('unread');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const summaryRef = useRef(null);

  const provider = EMAIL_PROVIDERS.find(p => p.id === config.service);

  const getMockEmails = () => {
    const now = Date.now();
    return [
      {
        id: '1',
        from: 'john.smith@company.com',
        subject: 'Q4 Report Review - Urgent Action Required',
        preview: 'Please review the attached Q4 financial report and provide your feedback before end of day.',
        fullContent: 'Dear Team,\n\nPlease review the attached Q4 financial report and provide your feedback before end of day.\nThe key metrics show a 25.2% increase in revenue compared to last quarter.\n\nBest regards,\nJohn Smith\nCEO',
        time: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
        important: true,
        category: 'work',
        unread: true
      },
      {
        id: '2',
        subject: 'Welcome to Amazon Prime',
        from: 'no-reply@amazon.com',
        preview: 'Congratulations! Your Amazon Prime membership has been activated.',
        time: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
        important: false,
        category: 'promo',
        unread: false
      },
      {
        id: '3',
        from: 'sarah.johnson@client.com',
        subject: 'Meeting Tomorrow at 10 AM',
        preview: 'Let\'s discuss the upcoming project requirements and timeline.',
        fullContent: 'Hi,\n\nLooking forward to our meeting tomorrow at 10 AM to discuss the upcoming project requirements and timeline.\n\nAgenda:\n- Project scope\n- Technical specifications\n- Budget review\n\nBest,\nSarah Johnson\nClient Manager',
        time: new Date(now - 5 * 60 * 60 * 1000), // 5 hours ago
        important: true,
        category: 'work',
        unread: true
      },
      {
        id: '4',
        from: 'noreply@twitter.com',
        subject: 'New tweet from someone you follow',
        preview: 'Mike Davis just tweeted',
        time: new Date(now - 48 * 60 * 60 * 1000), // 2 days ago
        important: false,
        category: 'social',
        unread: false
      },
      {
        id: '5',
        from: '2FA@microsoft.com',
        subject: 'Your Microsoft Account verification code',
        preview: 'Your verification code is: 123456',
        time: new Date(now - 30 * 60 * 1000), // 30 minutes ago
        important: false,
        category: 'auth',
        unread: false
      },
      {
        id: '6',
        from: 'mike.davis@partner.org',
        subject: 'Contract Approval Request - Legal Review',
        preview: 'The partnership contract has been drafted and ready for your approval.',
        fullContent: 'Dear Partner,\n\nThe partnership contract for our new collaboration has been drafted by our legal team. Please review the attached document and provide your approval before proceeding.\n\nKey terms:\n- 12-month initial agreement\n- Performance-based bonuses\n- Standardized deliverables\n\nSincerely,\nMike Davis\nBusiness Development\npartner.org',
        time: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
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
      const filteredEmails = mockAllEmails.filter(email => {
        if (config.filterSpam && ['promo', 'social', 'auth'].includes(email.category)) {
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
    if (config.configured) {
      fetchEmails();
    }
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
    if (!config.apiKey || !filteredEmails.length) return;

    setIsSummarizing(true);
    try {
      // Mock AI summary - replace with OpenAI service
      const generatedSummary = `Email Summary - ${filteredEmails.length} emails:

📧 High Priority (2):
• Q4 Report Review from John Smith - Requires immediate feedback on financial metrics
• Meeting Tomorrow from Sarah Johnson - 10 AM discussion on project requirements

📧 Business (1):
• Contract Approval from Mike Davis - Legal review needed for partnership agreement

Total important emails: ${filteredEmails.filter(e => e.important).length}

Suggested actions:
1. Review Q4 financial report today
2. Prepare for tomorrow's meeting agenda
3. Review partnership contract terms`;

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

  return (
    <div className="p-4 h-full flex flex-col">
      {!config.configured ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-8 text-gray-600 dark:text-gray-400">
          <Settings className="w-12 h-12 mb-2 opacity-30" />
          <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">Configure Email Service</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Select provider and enter credentials</p>
        </div>
      ) : isLoading ? (
        <SkeletonLoader className="flex-1" lines={6} />
      ) : selectedEmail ? (
        /* Email Reading Interface */
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedEmail(null)}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              ← Back to Inbox
            </button>
            {provider && (
              <div className="flex items-center gap-2 text-xs">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: provider.color }}
                >
                  {provider.name.charAt(0)}
                </div>
                <span>{provider.name} • {config.email}</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <h3 className="font-semibold text-sm mb-2">{selectedEmail.subject}</h3>
            <div className="flex items-center gap-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(selectedEmail.from)}`}>
                {selectedEmail.from.charAt(0).toUpperCase()}
              </div>
              <span>{selectedEmail.from}</span>
              <span>•</span>
              <span>{formatTime(selectedEmail.time)}</span>
            </div>

            <div className="text-sm whitespace-pre-line">
              {selectedEmail.fullContent}
            </div>
          </div>
        </div>
      ) : (
        /* Inbox View */
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Header with service info */}
          {provider && (
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: provider.color }}
                >
                  {provider.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{provider.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{config.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Connected</span>
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
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Email Count Summary */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {filteredEmails.filter(e => e.important).length} important emails
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {filteredEmails.length} total
            </span>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(email.from)}`}>
                        {email.from.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-medium text-sm truncate">{email.from}</p>
                      {email.important && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="font-medium text-sm truncate mb-1">{email.subject}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{email.preview}</p>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 ml-2 flex-shrink-0">{formatTime(email.time)}</span>
                </div>
                {email.category && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 capitalize">
                      {email.category}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSummarize}
              disabled={!filteredEmails.length || isSummarizing || !config.apiKey}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Bot className="w-4 h-4" />
              {isSummarizing ? 'Summarizing...' : `Summarize ${filteredEmails.length} Emails`}
            </button>

            {!config.apiKey && (
              <p className="text-xs text-red-500 text-center">Configure API key for AI summaries</p>
            )}
          </div>

          {/* AI Summary Results */}
          {summary && (
            <div ref={summaryRef} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI Summary
              </h4>
              <pre className="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                {summary}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
