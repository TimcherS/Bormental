import { MessageSquare, ThumbsUp, Share2, Settings, Bot, Clock, Instagram, Hash, MessageCircle, Phone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import SkeletonLoader from '../SkeletonLoader';

const PLATFORMS = [
  {
    id: 'vk',
    name: 'VK',
    icon: MessageSquare,
    color: 'bg-blue-500',
    emoji: '🇷🇺'
  },
  {
    id: 'max',
    name: 'Max',
    icon: Hash,
    color: 'bg-green-500',
    emoji: '📱'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    emoji: '📸'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: MessageCircle,
    color: 'bg-cyan-500',
    emoji: '✈️'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: Phone,
    color: 'bg-green-500',
    emoji: '💬'
  }
];

const INTERVALS = [
  { key: '24h', label: 'Last 24h' },
  { key: 'week', label: 'Last Week' },
  { key: 'month', label: 'Last Month' },
  { key: '3months', label: 'Last 3 Months' }
];

export default function SocialMediaWidget({ config, isFullscreen = false }) {
  const [isLoading, setIsLoading] = useState(!config.configured || !config.data);
  const [analysis, setAnalysis] = useState(config.data || []);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(config.chatHistory || []);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const chatRef = useRef(null);
  const selectedPlatform = PLATFORMS.find(p => p.id === config.platform);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Mock API call - replace with actual API integration
      const mockGroups = [
        { id: '1', name: 'Tech Discussions', logo: '', memberCount: 15000, commentsCount: 45 },
        { id: '2', name: 'Business News', logo: '', memberCount: 8900, commentsCount: 23 },
        { id: '3', name: 'Local Events', logo: '', memberCount: 5600, commentsCount: 67 }
      ];

      setAnalysis(mockGroups);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch social media data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (config.configured && !config.data) {
      fetchData();
    }
  }, [config.configured, config.apiKey, config.platform]);

  const handleAnalyze = async (group) => {
    if (!config.apiKey) return;

    setIsAnalysing(true);
    try {
      // Update the group with analysis - generate random data inside setAnalysis
      setAnalysis(prevData => prevData.map(g =>
        g.id === group.id ? {
          ...g,
          sentimentAnalysis: {
            sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
            engagement: Math.floor(Math.random() * 20) + 5,
            keyTopics: ['Business growth', 'Customer feedback', 'Product features'],
            summary: `Analysis for ${g.name} shows ${Math.floor(Math.random() * 50) + 20}% positive sentiment with active community engagement.`
          },
          lastAnalysis: Date.now()
        } : g
      ));

      setIsAnalysing(false);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalysing(false);
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim() || !config.apiKey) return;

    const userMessage = { role: 'user', content: chatMessage, timestamp: Date.now() };
    setChatHistory([...chatHistory, userMessage]);
    setChatMessage('');

    try {
      // Mock AI response - replace with OpenAI service
      const aiResponse = {
        role: 'assistant',
        content: `Based on the social media analysis, I can provide insights about your community engagement. For example, focusing on the topics that resonate most with your audience: ${userMessage.content}`,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, aiResponse]);

      // Save to config
      // onUpdate({ chatHistory: [...chatHistory, userMessage, aiResponse] });

      // Scroll to bottom
      setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100);
    } catch (error) {
      console.error('Chat failed:', error);
      const errorResponse = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API configuration.',
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorResponse]);
    }
  };

  const formatEngagement = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      {!config.configured ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-8 text-gray-600 dark:text-gray-400">
          <Settings className="w-12 h-12 mb-2 opacity-30" />
          <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">Configure Social Media Platform</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Select platform and enter API credentials</p>
        </div>
      ) : isLoading ? (
        <SkeletonLoader className="p-4" lines={6} />
      ) : (
        <>
          {/* Header with Platform Info */}
          <div className="flex items-center justify-between">
            {selectedPlatform && (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${selectedPlatform.color} flex items-center justify-center text-white font-semibold`}>
                  {selectedPlatform.emoji}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedPlatform.name} Groups</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{analysis.length} connected</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Live</span>
            </div>
          </div>

          {/* Groups List with Analysis */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {analysis.map((group) => (
              <div key={group.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* Group Logo Placeholder */}
                    <div className={`w-8 h-8 rounded-full ${selectedPlatform?.color || 'bg-blue-500'} flex items-center justify-center text-white text-xs font-semibold`}>
                      {group.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{group.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{formatEngagement(group.memberCount)} members</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {INTERVALS.map(interval => (
                      <button
                        key={interval.key}
                        onClick={() => handleAnalyze(group, interval.key)}
                        disabled={isAnalysing || !config.apiKey}
                        className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                        title={`Analyze ${interval.label}`}
                      >
                        {interval.key}
                      </button>
                    ))}
                  </div>
                </div>

                {group.sentimentAnalysis && (
                  <div className="text-xs space-y-1">
                    <p className={`font-medium ${
                      group.sentimentAnalysis.sentiment === 'positive' ? 'text-green-600' :
                      group.sentimentAnalysis.sentiment === 'negative' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {group.sentimentAnalysis.engagement}% engagement • {group.sentimentAnalysis.sentiment}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">{group.sentimentAnalysis.summary}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* LLM Chat Interface */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex-1 min-h-[200px] flex flex-col">
            <div ref={chatRef} className="flex-1 overflow-y-auto space-y-2 mb-3">
              {chatHistory.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-2 rounded-lg text-xs ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about analysis, trends..."
                className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={!config.apiKey}
              />
              <button
                onClick={sendMessage}
                disabled={!chatMessage.trim() || !config.apiKey}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bot className="w-4 h-4" />
              </button>
            </div>
            {!config.apiKey && (
              <p className="text-xs text-red-500 mt-1">Configure API key in settings</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
