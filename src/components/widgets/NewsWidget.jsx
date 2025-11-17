import { Newspaper, Bot } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const NEWS_AGENCIES = [
  { id: 'all', name: 'Все источники', color: '#6366f1' },
  { id: 'bbc', name: 'BBC News', color: '#bb1919' },
  { id: 'cnn', name: 'CNN', color: '#cc0000' },
  { id: 'reuters', name: 'Reuters', color: '#ff8000' },
  { id: 'ap', name: 'Associated Press', color: '#e32526' },
  { id: 'bloomberg', name: 'Bloomberg', color: '#000000' },
  { id: 'techcrunch', name: 'TechCrunch', color: '#0a9b00' },
  { id: 'theverge', name: 'The Verge', color: '#fa4b2a' }
];

const PREDEFINED_THEMES = [
  'Технологии',
  'Бизнес',
  'Политика',
  'Наука',
  'Здравоохранение',
  'Спорт',
  'Развлечения',
  'Мировые новости'
];

const TIME_FILTERS = [
  { key: '24h', label: 'Последние 24ч' },
  { key: 'week', label: 'Последняя неделя' },
  { key: 'month', label: 'Последний месяц' }
];

export default function NewsWidget({ config, isFullscreen = false }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [readArticles, setReadArticles] = useState(new Set());
  const summaryRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const getMockNews = () => {
    const now = Date.now();
    return [
      {
        id: '1',
        title: 'Прорыв в ИИ: Новая модель достигает человеческого уровня мышления',
        description: 'Исследователи разработали продвинутую ИИ-систему, демонстрирующую беспрецедентные способности к рассуждению, что является значительной вехой в искусственном интеллекте.',
        source: 'techcrunch',
        theme: 'Технологии',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
        url: 'https://techcrunch.com/ai-breakthrough',
        time: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: '2',
        title: 'Мировые рынки растут на фоне позитивных экономических данных',
        description: 'Фондовые рынки по всему миру выросли после публикации более сильных, чем ожидалось, экономических показателей, повысив доверие инвесторов.',
        source: 'bloomberg',
        theme: 'Бизнес',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
        url: 'https://bloomberg.com/markets-rally',
        time: new Date(now - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: '3',
        title: 'Достигнуто новое климатическое соглашение на международном саммите',
        description: 'Лидеры мира подписали знаковое климатическое соглашение, направленное на сокращение выбросов углерода на 50% в течение следующего десятилетия.',
        source: 'bbc',
        theme: 'Политика',
        image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b0?w=400&h=200&fit=crop',
        url: 'https://bbc.com/climate-agreement',
        time: new Date(now - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: '4',
        title: 'Учёные обнаружили потенциальное лекарство от редкого заболевания',
        description: 'Команда исследователей выявила перспективное лечение, которое может революционизировать уход за пациентами с редким генетическим расстройством.',
        source: 'reuters',
        theme: 'Наука',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=200&fit=crop',
        url: 'https://reuters.com/medical-breakthrough',
        time: new Date(now - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        id: '5',
        title: 'Крупная технологическая компания анонсирует революционный продукт',
        description: 'Отраслевой гигант представляет новаторскую технологию, обещающую преобразить взаимодействие с цифровыми устройствами.',
        source: 'theverge',
        theme: 'Технологии',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop',
        url: 'https://theverge.com/tech-announcement',
        time: new Date(now - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        id: '6',
        title: 'Всемирная организация здравоохранения обновляет рекомендации',
        description: 'ВОЗ публикует обновлённые рекомендации по здоровью на основе последних научных исследований и консультаций экспертов.',
        source: 'cnn',
        theme: 'Здравоохранение',
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=200&fit=crop',
        url: 'https://cnn.com/health-guidelines',
        time: new Date(now - 18 * 60 * 60 * 1000), // 18 hours ago
      },
      {
        id: '7',
        title: 'Финал чемпионата собирает рекордную аудиторию',
        description: 'Долгожданный финал спортивного чемпионата привлёк миллионы зрителей по всему миру, установив новые рекорды.',
        source: 'ap',
        theme: 'Спорт',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop',
        url: 'https://apnews.com/sports-championship',
        time: new Date(now - 20 * 60 * 60 * 1000), // 20 hours ago
      },
      {
        id: '8',
        title: 'Награждённый фильм бьёт рекорды кассовых сборов',
        description: 'Критически высоко оценённый фильм стал самым кассовым в этом году, превзойдя все ожидания.',
        source: 'bbc',
        theme: 'Развлечения',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=200&fit=crop',
        url: 'https://bbc.com/entertainment-news',
        time: new Date(now - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: '9',
        title: 'Экономика развивающихся рынков демонстрирует сильный рост',
        description: 'Развивающаяся страна сообщает о впечатляющем экономическом расширении, привлекая международных инвесторов и бизнес.',
        source: 'bloomberg',
        theme: 'Бизнес',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=200&fit=crop',
        url: 'https://bloomberg.com/emerging-markets',
        time: new Date(now - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        id: '10',
        title: 'Космическое агентство анонсирует амбициозную миссию на Марс',
        description: 'Обнародованы планы по созданию космического корабля нового поколения для исследования Красной планеты и поиска признаков жизни.',
        source: 'reuters',
        theme: 'Наука',
        image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=200&fit=crop',
        url: 'https://reuters.com/mars-mission',
        time: new Date(now - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: '11',
        title: 'Эксперты по кибербезопасности предупреждают о новом векторе угроз',
        description: 'Исследователи безопасности выявили изощрённый метод атаки, направленный на корпоративные системы по всему миру.',
        source: 'techcrunch',
        theme: 'Технологии',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop',
        url: 'https://techcrunch.com/cybersecurity-threat',
        time: new Date(now - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
      {
        id: '12',
        title: 'Международное торговое соглашение подписано после многолетних переговоров',
        description: 'Несколько стран подписывают всеобъемлющее торговое соглашение, которое должно стимулировать экономическое сотрудничество и снизить барьеры.',
        source: 'cnn',
        theme: 'Политика',
        image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=200&fit=crop',
        url: 'https://cnn.com/trade-deal',
        time: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      }
    ];
  };

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const mockAllNews = getMockNews();
      
      // Filter by selected themes
      const selectedThemes = config.themes || [];
      const selectedAgencies = config.agencies || ['all'];
      
      let filtered = mockAllNews;
      
      // Filter by themes if any are selected
      if (selectedThemes.length > 0) {
        filtered = filtered.filter(article => 
          selectedThemes.includes(article.theme)
        );
      }
      
      // Filter by agencies if not "all"
      if (!selectedAgencies.includes('all')) {
        filtered = filtered.filter(article => 
          selectedAgencies.includes(article.source)
        );
      }
      
      setNews(filtered);
      setFilteredNews(filtered);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [config.themes, config.agencies]);

  // Apply time filter
  useEffect(() => {
    const now = Date.now();
    let filtered = [];

    switch (timeFilter) {
      case '24h':
        filtered = news.filter(article => (now - article.time.getTime()) < 24 * 60 * 60 * 1000);
        break;
      case 'week':
        filtered = news.filter(article => (now - article.time.getTime()) < 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filtered = news.filter(article => (now - article.time.getTime()) < 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        filtered = news;
    }

    setFilteredNews(filtered);
  }, [news, timeFilter]);

  const handleSummarize = async () => {
    if (!filteredNews.length) return;

    setIsSummarizing(true);
    try {
      const themeBreakdown = {};
      filteredNews.forEach(article => {
        themeBreakdown[article.theme] = (themeBreakdown[article.theme] || 0) + 1;
      });

      const topThemes = Object.entries(themeBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      const generatedSummary = `📰 News Summary - ${filteredNews.length} articles analyzed:

📊 Coverage by Theme:
${topThemes.map(([theme, count]) => `• ${theme}: ${count} article${count > 1 ? 's' : ''}`).join('\n')}

🔥 Top Stories:
${filteredNews.slice(0, 3).map((article, i) => 
  `${i + 1}. ${article.title}
   Source: ${NEWS_AGENCIES.find(a => a.id === article.source)?.name || article.source}
   Theme: ${article.theme}`
).join('\n\n')}

📈 Reading Statistics:
• Total articles: ${filteredNews.length}
• Articles read: ${Array.from(readArticles).filter(id => filteredNews.find(a => a.id === id)).length}
• Unread articles: ${filteredNews.length - Array.from(readArticles).filter(id => filteredNews.find(a => a.id === id)).length}
• Most active source: ${Object.entries(
  filteredNews.reduce((acc, article) => {
    acc[article.source] = (acc[article.source] || 0) + 1;
    return acc;
  }, {})
).sort(([, a], [, b]) => b - a)[0]?.[0] ? NEWS_AGENCIES.find(a => a.id === Object.entries(
  filteredNews.reduce((acc, article) => {
    acc[article.source] = (acc[article.source] || 0) + 1;
    return acc;
  }, {})
).sort(([, a], [, b]) => b - a)[0]?.[0])?.name : 'N/A'}

${!config.configured ? '\n💡 Demo Summary - Configure widget for personalized news analysis' : ''}`;

      setSummary(generatedSummary);
      setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      setIsSummarizing(false);
    } catch (error) {
      console.error('Summary failed:', error);
      setSummary('Failed to generate news summary. Please try again.');
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

  const handleArticleClick = (articleId, url) => {
    setReadArticles(prev => new Set([...prev, articleId]));
    window.open(url, '_blank', 'noopener,noreferrer');
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
            📰 Демо-режим - Настройте виджет для выбора тем и источников новостей
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
            <div className="space-y-4 flex flex-col">
              {/* Header with configuration info */}
              <div 
                className="flex items-center justify-between pb-2 border-b dark:border-gray-700"
                style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: '#6366f1' }}
                  >
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <p 
                      className="font-semibold text-sm dark:text-gray-100"
                      style={theme === 'light' ? { color: '#111827' } : {}}
                    >
                      Анализ новостей
                    </p>
                    <p 
                      className="text-xs dark:text-gray-400"
                      style={theme === 'light' ? { color: '#4b5563' } : {}}
                    >
                      {config.themes?.length || 'All'} themes • {config.agencies?.includes('all') ? 'All sources' : `${config.agencies?.length || 0} sources`}
                    </p>
                  </div>
                </div>
              </div>

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

              {/* News Count Summary */}
              <div className="flex items-center justify-between">
                <span 
                  className="text-sm font-medium dark:text-gray-100"
                  style={theme === 'light' ? { color: '#111827' } : {}}
                >
                  {filteredNews.length} articles found
                </span>
                <span 
                  className="text-xs dark:text-gray-400"
                  style={theme === 'light' ? { color: '#4b5563' } : {}}
                >
                  {Array.from(readArticles).filter(id => filteredNews.find(a => a.id === id)).length} read
                </span>
              </div>

              {/* Actions */}
              {filteredNews.length > 0 && (
                <div 
                  className="space-y-2 pt-2 border-t dark:border-gray-700"
                  style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
                >
                  <button
                    onClick={handleSummarize}
                    disabled={!filteredNews.length || isSummarizing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    <Bot className="w-4 h-4" />
                    {isSummarizing ? 'Анализирую...' : `Проанализировать ${filteredNews.length} статей`}
                  </button>

                  {!config.configured && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                      💡 Демо-режим - Настройте виджет для персонализированных сводок
                    </p>
                  )}
                </div>
              )}

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

              {/* News List - Scrollable */}
              <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
                {filteredNews.length === 0 ? (
                  <div 
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                    style={theme === 'light' ? { color: '#6b7280' } : {}}
                  >
                    <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No news articles found for the selected filters.</p>
                    <p className="text-xs mt-1">Try adjusting your time range or configuration.</p>
                  </div>
                ) : (
                  filteredNews.map((article) => {
                    const isRead = readArticles.has(article.id);
                    const agency = NEWS_AGENCIES.find(a => a.id === article.source);
                    
                    return (
                      <div
                        key={article.id}
                        onClick={() => handleArticleClick(article.id, article.url)}
                        className="rounded-lg cursor-pointer transition-all border dark:bg-gray-800 dark:border-gray-700 hover:opacity-90 hover:shadow-md overflow-hidden"
                        style={theme === 'light' ? { 
                          backgroundColor: isRead ? '#f3f4f6' : '#ffffff',
                          borderColor: '#e5e7eb',
                          opacity: isRead ? 0.6 : 1
                        } : {
                          opacity: isRead ? 0.5 : 1
                        }}
                      >
                        {/* Article Image */}
                        <div className="relative">
                          <img 
                            src={article.image} 
                            alt={article.title}
                            className="w-full object-cover"
                            style={isFullscreen ? { 
                              height: '240px', 
                              opacity: isRead ? 0.7 : 1 
                            } : { 
                              height: '128px', 
                              opacity: isRead ? 0.7 : 1 
                            }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop';
                            }}
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <span 
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={theme === 'light' ? { 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                color: article.theme === 'Technology' ? '#2563eb' :
                                       article.theme === 'Business' ? '#059669' :
                                       article.theme === 'Politics' ? '#dc2626' :
                                       article.theme === 'Science' ? '#7c3aed' :
                                       article.theme === 'Health' ? '#ea580c' :
                                       '#4b5563'
                              } : {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: '#ffffff'
                              }}
                            >
                              {article.theme}
                            </span>
                          </div>
                        </div>
                        
                        {/* Article Content */}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 
                              className="font-semibold text-sm leading-snug dark:text-gray-100"
                              style={theme === 'light' ? { color: '#111827' } : {}}
                            >
                              {article.title}
                            </h3>
                          </div>
                          
                          <p 
                            className="text-xs mb-2 line-clamp-2 dark:text-gray-400"
                            style={theme === 'light' ? { color: '#4b5563' } : {}}
                          >
                            {article.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: agency?.color || '#6b7280' }}
                              />
                              <span 
                                className="text-xs font-medium dark:text-gray-400"
                                style={theme === 'light' ? { color: '#6b7280' } : {}}
                              >
                                {agency?.name || article.source}
                              </span>
                            </div>
                            <span 
                              className="text-xs dark:text-gray-500"
                              style={theme === 'light' ? { color: '#9ca3af' } : {}}
                            >
                              {formatTime(article.time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

