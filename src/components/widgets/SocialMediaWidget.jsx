import { MessageSquare, ThumbsUp, Share2, Settings, Bot, Clock, Instagram, Hash, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
  { key: '24h', label: 'Последние 24ч' },
  { key: 'week', label: 'Последняя неделя' },
  { key: 'month', label: 'Последний месяц' },
  { key: '3months', label: 'Последние 3 месяца' }
];

const LLM_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Самые широкие возможности' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Быстрые ответы' },
  { id: 'claude-3', name: 'Claude 3', description: 'Продвинутое мышление' }
];

// Mock data for unconfigured state
const MOCK_GROUPS = [
  {
    id: 'mock-1',
    name: 'Технические энтузиасты',
    platform: 'instagram',
    logo: '🚀',
    memberCount: 24500,
    commentsCount: 156,
    sentimentAnalysis: {
      sentiment: 'positive',
      engagement: 78,
      keyTopics: ['Тренды ИИ', 'Запуск продуктов', 'Обзоры технологий'],
      summary: 'Сообщество демонстрирует сильное позитивное настроение с высокой вовлечённостью в темы технологических инноваций. Наиболее активные обсуждения вокруг ИИ и новых функций продуктов.'
    }
  },
  {
    id: 'mock-2',
    name: 'Хаб роста бизнеса',
    platform: 'telegram',
    logo: '💼',
    memberCount: 18200,
    commentsCount: 89,
    sentimentAnalysis: {
      sentiment: 'neutral',
      engagement: 62,
      keyTopics: ['Маркетинговые стратегии', 'Советы по продажам', 'Удержание клиентов'],
      summary: 'Сбалансированные обсуждения с акцентом на практические бизнес-стратегии. Участники активно ищут советы по масштабированию операций.'
    }
  },
  {
    id: 'mock-3',
    name: 'Местные события сообщества',
    platform: 'vk',
    logo: '🎉',
    memberCount: 12800,
    commentsCount: 234,
    sentimentAnalysis: {
      sentiment: 'positive',
      engagement: 85,
      keyTopics: ['Предстоящие события', 'Отзывы сообщества', 'Предложения площадок'],
      summary: 'Высоко вовлечённое сообщество с отличным позитивным настроением. Сильное участие в планировании мероприятий и обратной связи.'
    }
  }
];

const MOCK_CHAT_HISTORY = [
  {
    role: 'assistant',
    content: '👋 Привет! Я ваш помощник по анализу социальных сетей. Я могу помочь понять тренды настроений, паттерны вовлечённости и ключевые темы из ваших подключённых групп в соцсетях.',
    timestamp: Date.now() - 3600000
  },
  {
    role: 'user',
    content: 'Какие основные темы обсуждаются в моих группах?',
    timestamp: Date.now() - 3500000
  },
  {
    role: 'assistant',
    content: 'На основе анализа всех ваших групп, самые популярные темы:\n\n1. **ИИ и технологии** (Технические энтузиасты) - Высокая вовлечённость\n2. **Стратегии роста бизнеса** (Хаб роста бизнеса) - Средняя вовлечённость\n3. **События сообщества** (Местные события сообщества) - Очень высокая вовлечённость\n\nХотите углубиться в какую-то конкретную тему или платформу?',
    timestamp: Date.now() - 3400000
  }
];

export default function SocialMediaWidget({ config, isFullscreen = false }) {
  const { theme } = useTheme();
  // Use mock data when not configured to show the UI preview
  const useMockData = !config.configured;
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(useMockData ? MOCK_GROUPS : (config.data || []));
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(useMockData ? MOCK_CHAT_HISTORY : (config.chatHistory || []));
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [selectedModel, setSelectedModel] = useState(config.llmModel || 'gpt-4');
  const [selectedInterval, setSelectedInterval] = useState('24h');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const chatRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const selectedPlatform = PLATFORMS.find(p => p.id === config.platform) || (useMockData ? null : null);

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

  const handleWidgetWheel = (e) => {
    const scrollContainer = scrollContainerRef.current;
    const isModifierZoom = e.ctrlKey || e.metaKey;

    if (isModifierZoom) {
      return;
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
      className="relative p-4 h-full flex flex-col overflow-hidden"
      data-canvas-wheel-lock="true"
      onWheel={handleWidgetWheel}
    >
      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <SkeletonLoader className="h-full" lines={6} />
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto space-y-4 pr-1 h-full"
            style={{ maxHeight: isFullscreen ? 'calc(100vh - 250px)' : '100%' }}
          >

            {/* Header with Platform Info */}
            <div className="flex items-center justify-between">
              {selectedPlatform ? (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${selectedPlatform.color} flex items-center justify-center text-white font-semibold`}>
                    {selectedPlatform.emoji}
                  </div>
                  <div>
                    <p 
                      className="font-semibold text-sm dark:text-gray-100"
                      style={theme === 'light' ? { color: '#111827' } : {}}
                    >
                      {selectedPlatform.name} Groups
                    </p>
                    <p 
                      className="text-xs dark:text-gray-400"
                      style={theme === 'light' ? { color: '#4b5563' } : {}}
                    >
                      {analysis.length} connected
                    </p>
                  </div>
                </div>
              ) : useMockData ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    📱
                  </div>
                  <div>
                    <p 
                      className="font-semibold text-sm dark:text-gray-100"
                      style={theme === 'light' ? { color: '#111827' } : {}}
                    >
                      Анализ социальных сетей
                    </p>
                    <p 
                      className="text-xs dark:text-gray-400"
                      style={theme === 'light' ? { color: '#4b5563' } : {}}
                    >
                      {analysis.length} groups • Multi-platform
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-500" />
                <span 
                  className="text-xs dark:text-gray-400"
                  style={theme === 'light' ? { color: '#4b5563' } : {}}
                >
                  {useMockData ? 'Демо' : 'Живое'}
                </span>
              </div>
            </div>

            {/* LLM Model Selector */}
            <div 
              className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
              style={theme === 'light' ? { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' } : {}}
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-500" />
                <span 
                  className="text-xs font-medium dark:text-gray-300"
                  style={theme === 'light' ? { color: '#1e40af' } : {}}
                >
                  AI Model:
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2"
                  style={theme === 'light' ? { backgroundColor: '#ffffff', borderColor: '#93c5fd', color: '#1e40af' } : {}}
                >
                  {LLM_MODELS.find(m => m.id === selectedModel)?.name || 'Выбрать модель'}
                  <span className="text-[10px] text-gray-500" style={theme === 'light' ? { color: '#3b82f6' } : {}}>▼</span>
                </button>
                {showModelSelector && (
                  <div 
                    className="absolute top-full mt-1 right-0 border rounded-lg shadow-lg z-10 min-w-[180px]"
                    style={theme === 'light' ? { 
                      backgroundColor: '#ffffff', 
                      borderColor: '#93c5fd' 
                    } : { 
                      backgroundColor: '#1f2937', 
                      borderColor: '#374151' 
                    }}
                  >
                    {LLM_MODELS.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelSelector(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs first:rounded-t-lg last:rounded-b-lg transition-colors"
                        style={theme === 'light' ? { 
                          color: '#111827',
                          '&:hover': { backgroundColor: '#eff6ff' }
                        } : {}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme === 'light' ? '#eff6ff' : '#374151';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div className="font-medium" style={theme === 'light' ? { color: '#111827' } : { color: '#f9fafb' }}>{model.name}</div>
                        <div className="text-[10px]" style={theme === 'light' ? { color: '#6b7280' } : { color: '#9ca3af' }}>{model.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Time Interval Selector */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span 
                className="text-xs font-medium dark:text-gray-300"
                style={theme === 'light' ? { color: '#374151' } : {}}
              >
                Период анализа:
              </span>
              <div className="flex gap-2 flex-1">
                {INTERVALS.map(interval => (
                  <button
                    key={interval.key}
                    onClick={() => setSelectedInterval(interval.key)}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedInterval === interval.key
                        ? 'bg-blue-500 text-white'
                        : 'dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600'
                    }`}
                    style={selectedInterval !== interval.key && theme === 'light' ? { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' } : {}}
                  >
                    {interval.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Groups List with Analysis */}
            <div className="space-y-3">
              {analysis.map((group) => {
                const groupPlatform = useMockData 
                  ? PLATFORMS.find(p => p.id === group.platform) 
                  : selectedPlatform;
                
                const getCardStyle = () => {
                  if (theme === 'dark') return {};
                  if (!group.sentimentAnalysis) return { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' };
                  if (group.sentimentAnalysis.sentiment === 'positive') return { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' };
                  if (group.sentimentAnalysis.sentiment === 'negative') return { backgroundColor: '#fef2f2', borderColor: '#fecaca' };
                  return { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' };
                };
                
                return (
                  <div 
                    key={group.id} 
                    className="p-3 rounded-lg border dark:bg-gray-800/50 dark:border-gray-700"
                    style={getCardStyle()}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {/* Platform & Group Logo */}
                        <div className="relative">
                          <div className={`w-9 h-9 rounded-lg ${groupPlatform?.color || 'bg-blue-500'} flex items-center justify-center text-lg`}>
                            {group.logo || group.name.charAt(0)}
                          </div>
                          {useMockData && groupPlatform && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-xs border border-gray-200 dark:border-gray-700">
                              {groupPlatform.emoji}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p 
                              className="font-medium text-sm dark:text-gray-100"
                              style={theme === 'light' ? { color: '#111827' } : {}}
                            >
                              {group.name}
                            </p>
                            {useMockData && groupPlatform && (
                              <span 
                                className="text-[10px] px-1.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400"
                                style={theme === 'light' ? { backgroundColor: '#e5e7eb', color: '#4b5563' } : {}}
                              >
                                {groupPlatform.name}
                              </span>
                            )}
                          </div>
                          <p 
                            className="text-xs dark:text-gray-400"
                            style={theme === 'light' ? { color: '#4b5563' } : {}}
                          >
                            {formatEngagement(group.memberCount)} members • {group.commentsCount} comments
                          </p>
                        </div>
                      </div>
                    </div>

                    {group.sentimentAnalysis && (
                      <div 
                        className="mt-3 p-2 dark:bg-gray-900/50 rounded border dark:border-gray-700"
                        style={theme === 'light' ? { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: '#e5e7eb' } : {}}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-xs font-semibold uppercase tracking-wide ${
                            group.sentimentAnalysis.sentiment === 'positive' ? 'text-green-600 dark:text-green-500' :
                            group.sentimentAnalysis.sentiment === 'negative' ? 'text-red-600 dark:text-red-500' : 
                            'text-yellow-600 dark:text-yellow-500'
                          }`}>
                            {group.sentimentAnalysis.sentiment} Sentiment
                          </p>
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {group.sentimentAnalysis.engagement}% Engagement
                          </p>
                        </div>
                        
                        <p 
                          className="text-xs dark:text-gray-300 mb-2 leading-relaxed"
                          style={theme === 'light' ? { color: '#374151' } : {}}
                        >
                          {group.sentimentAnalysis.summary}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {group.sentimentAnalysis.keyTopics.map((topic, idx) => (
                            <span 
                              key={idx}
                              className="text-[10px] px-2 py-1 dark:bg-blue-900/30 dark:text-blue-300 rounded-full border dark:border-blue-800"
                              style={theme === 'light' ? { backgroundColor: '#dbeafe', color: '#1d4ed8', borderColor: '#93c5fd' } : {}}
                            >
                              #{topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* LLM Chat Interface */}
            <div 
              className="border-t dark:border-gray-700 pt-3 flex-1 min-h-[200px] flex flex-col"
              style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
            >
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-purple-500" />
                <span 
                  className="text-xs font-semibold dark:text-gray-300"
                  style={theme === 'light' ? { color: '#374151' } : {}}
                >
                  ИИ-помощник анализа
                </span>
                {useMockData && (
                  <span 
                    className="text-[10px] px-1.5 py-0.5 rounded dark:bg-purple-900/30 dark:text-purple-400 border dark:border-purple-800"
                    style={theme === 'light' ? { backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#d8b4fe' } : {}}
                  >
                    Interactive in full version
                  </span>
                )}
              </div>
              
              <div 
                ref={chatRef} 
                className="flex-1 overflow-y-auto space-y-2 mb-3 p-2 dark:bg-gray-900/30 rounded-lg border dark:border-gray-700"
                style={theme === 'light' ? { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' } : {}}
              >
                {chatHistory.length > 0 ? (
                  chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[85%] p-2.5 rounded-lg text-xs leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 rounded-bl-sm'
                        }`}
                        style={message.role !== 'user' && theme === 'light' ? { backgroundColor: '#ffffff', borderColor: '#bfdbfe', color: '#111827' } : {}}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-4">
                    <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Start a conversation to analyze your social media data</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !useMockData && sendMessage()}
                  placeholder={useMockData ? "Available after configuration..." : "Ask about analysis, trends..."}
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={theme === 'light' ? { backgroundColor: '#ffffff', borderColor: '#93c5fd', color: '#111827' } : {}}
                  disabled={useMockData || !config.apiKey}
                />
                <button
                  onClick={sendMessage}
                  disabled={useMockData || !chatMessage.trim() || !config.apiKey}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Bot className="w-4 h-4" />
                </button>
              </div>
              {!useMockData && !config.apiKey && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Настройте API-ключ в параметрах для включения чата
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
