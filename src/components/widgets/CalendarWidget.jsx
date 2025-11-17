import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Settings, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, X, Video, ExternalLink } from 'lucide-react';
import Portal from '../Portal';
import { useTheme } from '../../contexts/ThemeContext';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function CalendarWidget({ widget, onUpdate, isFullscreen = false, fullscreenView, setFullscreenView }) {
  const { theme } = useTheme();
  const [currentView, setCurrentView] = useState(widget.config.savedView || 'day'); // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const scrollContainerRef = useRef(null);
  
  const getInputClasses = () => {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
    return baseClasses;
  };

  const getInputStyle = () => {
    if (theme === 'light') {
      return {
        backgroundColor: '#f9fafb',
        borderColor: '#bfdbfe',
        color: '#111827'
      };
    }
    return {
      backgroundColor: '#374151',
      borderColor: '#4b5563',
      color: '#f9fafb'
    };
  };

  const baseInputClasses = getInputClasses();

  // Mock events with descriptions and video links from multiple sources
  const [events, setEvents] = useState(widget.config.events || [
    {
      id: '1',
      title: 'Синхронизация команды',
      description: 'Еженедельная синхронизация и обновление статуса команды',
      videoLink: 'https://meet.google.com/abc-defg-hij',
      hour: 10,
      minute: 0,
      date: '2025-11-16',
      color: 'blue',
      duration: 60,
      source: 'google'
    },
    {
      id: '2',
      title: 'Презентация для клиента',
      description: 'Презентация результатов Q4 для ключевых заинтересованных сторон',
      videoLink: 'https://zoom.us/j/123456789',
      hour: 14,
      minute: 30,
      date: '2025-11-16',
      color: 'green',
      duration: 60,
      source: 'bitrix24'
    },
    {
      id: '3',
      title: 'Маркетинговый звонок',
      description: 'Обсуждение стратегии новой кампании и распределения бюджета',
      hour: 16,
      minute: 0,
      date: '2025-11-16',
      color: 'purple',
      duration: 45,
      source: 'amocrm'
    },
    {
      id: '4',
      title: 'Стратегическое планирование',
      description: 'Сессия долгосрочного планирования с руководством',
      videoLink: 'https://teams.microsoft.com/l/meetup-join/xyz',
      hour: 9,
      minute: 0,
      date: '2025-11-17',
      color: 'red',
      duration: 90,
      source: 'google'
    },
    {
      id: '5',
      title: 'Обзор бюджета',
      description: 'Ежемесячный обзор бюджета с финансовой командой',
      hour: 16,
      minute: 0,
      date: '2025-11-17',
      color: 'purple',
      duration: 45,
      source: 'yandex'
    },
    {
      id: '6',
      title: 'Еженедельный стендап',
      description: 'Быстрая синхронизация по прогрессу текущего спринта',
      videoLink: 'https://meet.google.com/weekly-standup',
      hour: 11,
      minute: 0,
      date: '2025-11-18',
      color: 'orange',
      duration: 30,
      source: 'google'
    },
    {
      id: '7',
      title: 'Обзор дизайна',
      description: 'Обзор новых дизайнов UI/UX для мобильного приложения',
      hour: 13,
      minute: 30,
      date: '2025-11-18',
      color: 'pink',
      duration: 90,
      source: 'bitrix24'
    },
    {
      id: '8',
      title: 'Демо продукта',
      description: 'Демонстрация новых функций потенциальным клиентам',
      videoLink: 'https://zoom.us/j/987654321',
      hour: 15,
      minute: 30,
      date: '2025-11-19',
      color: 'blue',
      duration: 60,
      source: 'amocrm'
    },
    {
      id: '9',
      title: 'Встреча по продажам',
      description: 'Обзор воронки продаж и прогнозов',
      hour: 10,
      minute: 0,
      date: '2025-11-19',
      color: 'green',
      duration: 60,
      source: 'bitrix24'
    },
    {
      id: '10',
      title: 'Технический воркшоп',
      description: 'Практический воркшоп по новым инструментам и практикам разработки',
      videoLink: 'https://meet.google.com/tech-workshop',
      hour: 14,
      minute: 0,
      date: '2025-11-20',
      color: 'purple',
      duration: 120,
      source: 'google'
    },
    {
      id: '11',
      title: 'Кофе-брейк',
      description: 'Неформальный разговор с членами команды',
      hour: 9,
      minute: 30,
      date: '2025-11-20',
      color: 'orange',
      duration: 30,
      source: 'google'
    },
    {
      id: '12',
      title: 'Сессия обучения',
      description: 'Обучение продукта для команды поддержки клиентов',
      videoLink: 'https://zoom.us/j/training-session',
      hour: 11,
      minute: 0,
      date: '2025-11-21',
      color: 'red',
      duration: 90,
      source: 'yandex'
    },
    {
      id: '13',
      title: 'Звонок инвесторам',
      description: 'Квартальный звонок обновления с инвесторами',
      videoLink: 'https://meet.google.com/investor-call',
      hour: 15,
      minute: 0,
      date: '2025-11-21',
      color: 'blue',
      duration: 60,
      source: 'google'
    },
    {
      id: '14',
      title: 'Командный обед',
      description: 'Обед для укрепления командного духа в новом ресторане',
      hour: 12,
      minute: 30,
      date: '2025-11-22',
      color: 'pink',
      duration: 60,
      source: 'google'
    },
    {
      id: '15',
      title: 'Обзор кода',
      description: 'Обзор запросов на слияние и обсуждение улучшений качества кода',
      hour: 10, 
      minute: 0, 
      date: '2025-11-22', 
      color: 'green', 
      duration: 45,
      source: 'bitrix24'
    }
  ]);

  // Event modal state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    videoLink: '',
    date: '',
    hour: 9,
    minute: 0,
    duration: 60,
    color: 'blue',
    source: 'google'
  });

  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };


  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getFilteredEvents = () => {
    if (currentView === 'day') {
      const todayStr = currentDate.toISOString().split('T')[0];
      return events.filter(event => event.date === todayStr);
    } else if (currentView === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= weekStart && eventDate <= weekEnd;
      });
    } else if (currentView === 'month') {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= monthStart && eventDate <= monthEnd;
      });
    }
    return events;
  };

  const getSourceLabel = (source) => {
    const sources = {
      'bitrix24': 'Битрикс24',
      'amocrm': 'AmoCRM',
      'yandex': 'Яндекс Трекер',
      'google': 'Google'
    };
    return sources[source] || source;
  };

const EVENT_COLOR_SHADES = {
  blue: {
    lightBg: '#dbeafe',
    lightBorder: '#93c5fd',
    stripe: '#60a5fa',
    darkBg: 'rgba(30, 64, 175, 0.35)',
    darkBorder: '#3b82f6'
  },
  green: {
    lightBg: '#dcfce7',
    lightBorder: '#86efac',
    stripe: '#22c55e',
    darkBg: 'rgba(20, 83, 45, 0.4)',
    darkBorder: '#16a34a'
  },
  red: {
    lightBg: '#fee2e2',
    lightBorder: '#fecaca',
    stripe: '#ef4444',
    darkBg: 'rgba(127, 29, 29, 0.45)',
    darkBorder: '#f87171'
  },
  purple: {
    lightBg: '#ede9fe',
    lightBorder: '#c4b5fd',
    stripe: '#a855f7',
    darkBg: 'rgba(91, 33, 182, 0.45)',
    darkBorder: '#c084fc'
  },
  orange: {
    lightBg: '#ffedd5',
    lightBorder: '#fdba74',
    stripe: '#fb923c',
    darkBg: 'rgba(124, 45, 18, 0.45)',
    darkBorder: '#fb923c'
  },
  pink: {
    lightBg: '#fce7f3',
    lightBorder: '#f9a8d4',
    stripe: '#ec4899',
    darkBg: 'rgba(131, 24, 67, 0.45)',
    darkBorder: '#f472b6'
  },
  default: {
    lightBg: '#f3f4f6',
    lightBorder: '#d1d5db',
    stripe: '#9ca3af',
    darkBg: 'rgba(31, 41, 55, 0.45)',
    darkBorder: '#94a3b8'
  }
};

const SOURCE_TAG_STYLES = {
  google: { bg: '#eff6ff', text: '#1d4ed8', border: '#93c5fd' },
  bitrix24: { bg: '#ecfeff', text: '#0369a1', border: '#67e8f9' },
  amocrm: { bg: '#f5f3ff', text: '#6d28d9', border: '#c4b5fd' },
  yandex: { bg: '#fff7ed', text: '#c2410c', border: '#fdba74' },
  default: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
};

const getEventVisualStyles = (color, theme) => {
  const palette = EVENT_COLOR_SHADES[color] || EVENT_COLOR_SHADES.default;
  if (theme === 'light') {
    return {
      backgroundColor: palette.lightBg,
      border: `1px solid ${palette.lightBorder}`,
      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)'
    };
  }
  return {
    backgroundColor: palette.darkBg,
    border: `1px solid ${palette.darkBorder}`,
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.35)'
  };
};

const getStripedBackground = (color, theme = 'light') => {
  const palette = EVENT_COLOR_SHADES[color] || EVENT_COLOR_SHADES.default;
  if (theme === 'light') {
    return `repeating-linear-gradient(135deg, ${palette.lightBg}, ${palette.lightBg} 8px, ${palette.stripe} 8px, ${palette.stripe} 16px)`;
  }
  return `repeating-linear-gradient(135deg, ${palette.darkBg}, ${palette.darkBg} 8px, ${palette.darkBorder} 8px, ${palette.darkBorder} 16px)`;
};

const getSourceTagStyle = (source, theme) => {
  const palette = SOURCE_TAG_STYLES[source] || SOURCE_TAG_STYLES.default;
  if (theme === 'light') {
    return {
      backgroundColor: palette.bg,
      color: palette.text,
      border: `1px solid ${palette.border}`
    };
  }
  return {
    backgroundColor: 'rgba(31, 41, 55, 0.65)',
    color: '#f9fafb',
    border: '1px solid rgba(148, 163, 184, 0.6)'
  };
};

  const renderDayView = () => {
    const dayEvents = getFilteredEvents().sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimePercent = ((currentHour * 60 + currentMinute) / (24 * 60)) * 100;
    const isToday = currentDate.toDateString() === now.toDateString();
    
    // Hours from 0 to 23
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const HOUR_HEIGHT = 80; // pixels per hour - increased from 60 for bigger events
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-center mb-3">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h4>
        <div 
          className="relative border border-gray-200 dark:border-gray-700 rounded-lg" 
          style={theme === 'light' ? { height: `${24 * HOUR_HEIGHT}px`, borderColor: '#e5e7eb' } : { height: `${24 * HOUR_HEIGHT}px` }}
        >
          {/* Hour marks */}
          {hours.map((hour) => (
            <div 
              key={hour} 
              className={`absolute w-full flex ${hour > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}
              style={theme === 'light' ? { 
                top: `${hour * HOUR_HEIGHT}px`, 
                height: `${HOUR_HEIGHT}px`, 
                borderColor: hour > 0 ? '#e5e7eb' : 'transparent'
              } : { 
                top: `${hour * HOUR_HEIGHT}px`, 
                height: `${HOUR_HEIGHT}px`
              }}
            >
              <div 
                className="w-20 flex-shrink-0 text-xs dark:text-gray-400 pr-3 text-right flex items-center justify-end"
                style={theme === 'light' ? { color: '#4b5563' } : {}}
              >
                {formatTime(hour, 0)}
              </div>
              <div className="flex-1 relative pl-3">
                {/* Events at this hour */}
                {dayEvents
                  .filter(event => {
                    const eventStart = event.hour * 60 + event.minute;
                    const eventEnd = eventStart + event.duration;
                    const hourStart = hour * 60;
                    const hourEnd = (hour + 1) * 60;
                    return eventStart < hourEnd && eventEnd > hourStart;
                  })
                  .map(event => {
                    const eventStart = event.hour * 60 + event.minute;
                    const topOffset = ((eventStart - hour * 60) / 60) * HOUR_HEIGHT;
                    const height = (event.duration / 60) * HOUR_HEIGHT;
                    const isFirstHourOfEvent = event.hour === hour;
                    const cardStyles = getEventVisualStyles(event.color, theme);
                    const hasDetails = Boolean(event.description || event.videoLink || event.source);
                    
                    if (!isFirstHourOfEvent) return null;
                    
                    return (
                      <div
                        key={event.id}
                        className="absolute left-0 right-2 mx-1 rounded-xl p-3 group cursor-pointer hover:shadow-xl focus-within:ring-2 focus-within:ring-blue-300/70 focus-visible:outline-none transition-all flex flex-col gap-2"
                        style={{ 
                          top: `${topOffset}px`, 
                          height: `${Math.max(height, 36)}px`,
                          zIndex: 6,
                          ...cardStyles
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 flex-shrink-0">
                          <div className="flex-1 min-w-0">
                            <p 
                              className="font-semibold text-sm truncate dark:text-gray-100"
                              style={theme === 'light' ? { color: '#0f172a' } : {}}
                            >
                              {event.title}
                            </p>
                            <div 
                              className="flex items-center gap-1 text-xs dark:text-gray-300 mt-1 text-gray-600"
                              style={theme === 'light' ? { color: '#374151' } : {}}
                            >
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{formatTime(event.hour, event.minute)}</span>
                              <span>({event.duration}min)</span>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                            <button
                              type="button"
                              onClick={() => openEditEvent(event)}
                              className="p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300"
                              title="Редактировать событие"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteEvent(event.id)}
                              className="p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 dark:text-red-300"
                              title="Удалить событие"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {hasDetails && (
                          <div 
                            className="text-xs dark:text-gray-200 text-gray-600 flex-1 min-h-0 overflow-y-auto pr-1 space-y-2"
                            style={{ scrollbarWidth: 'thin' }}
                          >
                            {event.description && (
                              <p className="leading-snug whitespace-pre-line">
                                {event.description}
                              </p>
                            )}
                            {event.videoLink && (
                              <a
                                href={event.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Video className="w-3 h-3" />
                                <span>Join meeting</span>
                              </a>
                            )}
                            {event.source && (
                              <span 
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight"
                                style={getSourceTagStyle(event.source, theme)}
                              >
                                {getSourceLabel(event.source)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
          
          {/* Current time indicator */}
          {isToday && (
            <div 
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${(currentTimePercent / 100) * 24 * HOUR_HEIGHT}px` }}
            >
              <div className="flex items-center w-full">
                <div className="w-2 h-2 rounded-full bg-red-500 ml-1" />
                <div className="flex-1 h-0.5 bg-red-500" />
              </div>
            </div>
          )}
        </div>
        {dayEvents.length === 0 && (
          <p 
            className="text-xs dark:text-gray-400 text-center py-4"
            style={theme === 'light' ? { color: '#4b5563' } : {}}
          >
            Нет запланированных событий
          </p>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekEvents = getFilteredEvents();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimePercent = ((currentHour * 60 + currentMinute) / (24 * 60)) * 100;
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const HOUR_HEIGHT = 80; // pixels per hour - increased from 60 for bigger events

    return (
      <div>
        <h4 className="text-sm font-medium text-center mb-3">
          Неделя с {weekStart.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
        </h4>
        <div 
          className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
        >
          {/* Time column */}
          <div 
            className="w-16 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20"
            style={theme === 'light' ? { backgroundColor: 'transparent', borderColor: '#e5e7eb' } : {}}
          >
            <div 
              className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center"
              style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
            ></div>
            <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
              {hours.map((hour) => (
                <div 
                  key={hour} 
                  className={`absolute w-full text-xs dark:text-gray-400 text-right pr-2 flex items-center justify-end ${hour > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}
                  style={theme === 'light' ? { 
                    top: `${hour * HOUR_HEIGHT}px`, 
                    height: `${HOUR_HEIGHT}px`, 
                    color: '#4b5563',
                    borderColor: hour > 0 ? '#e5e7eb' : 'transparent'
                  } : { 
                    top: `${hour * HOUR_HEIGHT}px`, 
                    height: `${HOUR_HEIGHT}px` 
                  }}
                >
                  {hour % 12 || 12}{hour >= 12 ? 'PM' : 'AM'}
                </div>
              ))}
            </div>
          </div>
          
          {/* Days columns */}
          <div className="flex-1 grid grid-cols-7">
            {daysOfWeek.map((day, i) => {
              const date = new Date(weekStart);
              date.setDate(weekStart.getDate() + i);
              const dateStr = date.toISOString().split('T')[0];
              const dayEvents = weekEvents.filter(event => event.date === dateStr)
                .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
              const isToday = date.toDateString() === now.toDateString();

              return (
                <div 
                  key={day} 
                  className="border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative flex-1"
                  style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
                >
                  {/* Day header */}
                  <div 
                    className="h-12 bg-white dark:bg-gray-800 text-center py-2 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"
                    style={theme === 'light' ? { backgroundColor: 'transparent', borderColor: '#e5e7eb' } : {}}
                  >
                    <div 
                      className="text-xs dark:text-gray-400"
                      style={theme === 'light' ? { color: '#6b7280' } : {}}
                    >
                      {day}
                    </div>
                    <div 
                      className={`text-sm font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}
                      style={!isToday && theme === 'light' ? { color: '#111827' } : {}}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                  
                  {/* Hour grid */}
                  <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                    {hours.map((hour) => (
                      <div 
                        key={hour} 
                        className={`absolute w-full ${hour > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}
                        style={theme === 'light' ? {
                          top: `${hour * HOUR_HEIGHT}px`, 
                          height: `${HOUR_HEIGHT}px`, 
                          borderColor: hour > 0 ? '#e5e7eb' : 'transparent'
                        } : {
                          top: `${hour * HOUR_HEIGHT}px`, 
                          height: `${HOUR_HEIGHT}px`
                        }}
                      />
                    ))}
                    
                    {/* Events */}
                    {dayEvents.map(event => {
                      const eventStart = event.hour * 60 + event.minute;
                      const topOffset = (eventStart / (24 * 60)) * 24 * HOUR_HEIGHT;
                      const height = (event.duration / 60) * HOUR_HEIGHT;
                      const palette = EVENT_COLOR_SHADES[event.color] || EVENT_COLOR_SHADES.default;
                      const eventLabel = `${event.title} · ${formatTime(event.hour, event.minute)}`;

                      if (!isFullscreen) {
                        return (
                          <div
                            key={event.id}
                            className="absolute left-2 right-2 rounded-full border cursor-pointer transition-opacity hover:opacity-90"
                            style={{
                              top: `${topOffset}px`,
                              height: `${Math.max(height, 8)}px`,
                              backgroundImage: getStripedBackground(event.color, theme),
                              borderColor: theme === 'light' ? palette.lightBorder : palette.darkBorder,
                              zIndex: 4
                            }}
                            title={eventLabel}
                            aria-label={eventLabel}
                            onClick={() => handleDayClick(date)}
                          />
                        );
                      }

                      const cardStyles = getEventVisualStyles(event.color, theme);

                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 rounded-xl p-2 group cursor-pointer hover:shadow-xl transition-all flex flex-col gap-1"
                          style={{ 
                            top: `${topOffset}px`, 
                            height: `${Math.max(height, 34)}px`,
                            zIndex: 6,
                            ...cardStyles
                          }}
                          onClick={() => handleDayClick(date)}
                        >
                          <p 
                            className="font-semibold text-xs truncate leading-tight dark:text-gray-100"
                            style={theme === 'light' ? { color: '#0f172a' } : {}}
                          >
                            {event.title}
                          </p>
                          <div 
                            className="flex items-center justify-between text-[11px] dark:text-gray-300"
                            style={theme === 'light' ? { color: '#000000' } : {}}
                          >
                            <span>{formatTime(event.hour, event.minute)}</span>
                            {event.videoLink && <Video className="w-3 h-3 text-blue-500 dark:text-blue-400" />}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Current time indicator for today */}
                    {isToday && (
                      <div 
                        className="absolute z-20 pointer-events-none"
                        style={{ top: `${(currentTimePercent / 100) * 24 * HOUR_HEIGHT}px`, left: '-16px', right: 0 }}
                      >
                        <div className="flex items-center w-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 ml-1" />
                          <div className="flex-1 h-0.5 bg-red-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const handleDayClick = (date) => {
    setCurrentDate(new Date(date));
    setCurrentView('day');
  };

  const renderMonthView = () => {
    const monthEvents = getFilteredEvents();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        <h4 className="text-sm font-medium text-center mb-3 flex-shrink-0">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="grid grid-cols-7 gap-1 text-xs flex-1 overflow-hidden" style={{ gridAutoRows: '1fr' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div 
              key={day} 
              className="text-center font-semibold uppercase tracking-wide text-[11px] border-b border-gray-200 dark:border-gray-700" 
              style={theme === 'light' ? { gridRow: 1, backgroundColor: 'transparent', color: '#111827', padding: '2px 0' } : { gridRow: 1, padding: '2px 0' }}
            >
              {day}
            </div>
          ))}
          {Array.from({ length: 42 }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const isCurrentMonth = date.getMonth() === month;
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = monthEvents.filter(event => event.date === dateStr);
            const row = Math.floor(i / 7) + 2; // +2 because row 1 is header

            return (
              <div 
                key={i} 
                onClick={() => dayEvents.length > 0 && handleDayClick(date)}
                className={`p-2 border border-gray-200 dark:border-gray-700 rounded overflow-hidden flex flex-col relative ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/20' : 'bg-white dark:bg-gray-800'
                } ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' : ''}`}
                style={theme === 'light' ? { 
                  gridRow: row, 
                  backgroundColor: !isCurrentMonth ? '#f9fafb' : '#ffffff',
                  borderColor: '#e5e7eb'
                } : { gridRow: row }}
              >
                <div 
                  className={`text-sm mb-1 font-bold flex-shrink-0 ${isCurrentMonth ? 'dark:text-gray-100' : 'dark:text-gray-400'}`}
                  style={theme === 'light' ? { color: isCurrentMonth ? '#111827' : '#6b7280' } : {}}
                >
                  {date.getDate()}
                </div>
                {dayEvents.length > 0 && (
                  <div 
                    className="absolute bottom-0 right-0 min-w-[24px] h-[24px] flex items-center justify-center text-xs font-bold text-white rounded-tl-lg"
                    style={{
                      backgroundColor: dayEvents.length <= 2 ? '#10b981' : dayEvents.length <= 4 ? '#f59e0b' : '#ef4444',
                      paddingLeft: '6px',
                      paddingRight: '6px'
                    }}
                  >
                    {dayEvents.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      videoLink: '',
      date: currentDate.toISOString().split('T')[0],
      hour: 9,
      minute: 0,
      duration: 60,
      color: 'blue',
      source: 'google'
    });
    setIsEventModalOpen(true);
  };

  const openEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      videoLink: event.videoLink || '',
      date: event.date,
      hour: event.hour,
      minute: event.minute,
      duration: event.duration,
      color: event.color,
      source: event.source || 'google'
    });
    setIsEventModalOpen(true);
  };

  const saveEvent = () => {
    if (!eventForm.title.trim() || !eventForm.date) return;

    const newEvent = {
      ...eventForm,
      id: editingEvent?.id || Date.now().toString(),
    };

    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map(event =>
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      updatedEvents = [...events, newEvent];
    }

    setEvents(updatedEvents);
    onUpdate({ events: updatedEvents, savedView: currentView });
    setIsEventModalOpen(false);
  };

  // Save view state whenever it changes
  useEffect(() => {
    onUpdate({ savedView: currentView });
  }, [currentView]);

  const deleteEvent = (eventId) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    onUpdate({ events: updatedEvents });
  };

  const handleWidgetWheel = (e) => {
    const scrollContainer = scrollContainerRef.current;
    const isModifierZoom = e.ctrlKey || e.metaKey;

    if (isModifierZoom) {
      return; // Let intentional zoom gestures bubble to the canvas
    }

    if (!scrollContainer) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
    const isInteractingWithScrollableArea = scrollContainer.contains(e.target);

    // Block canvas zoom while hovering anywhere on the widget
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
      className="p-4 h-full flex flex-col"
      data-canvas-wheel-lock="true"
      onWheel={handleWidgetWheel}
    >
      <div className="space-y-3 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm">
            {widget.config.calendarName ? `${widget.config.calendarName} Calendar` : 'Calendar Events'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={openAddEvent}
              className={`p-2 rounded-lg border transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-blue-200 ${
                theme === 'light'
                  ? 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100'
                  : 'bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700'
              }`}
              title="Добавить событие"
            >
              <Plus className="w-4 h-4" />
            </button>
            <Calendar className={`w-4 h-4 text-${widget.config.calendarColor || 'blue'}-500`} />
            {!widget.config.configured ? (
              <span 
                className="text-xs dark:text-gray-400"
                style={theme === 'light' ? { color: '#4b5563' } : {}}
              >
                Mock Data
              </span>
            ) : (
              <span 
                className="text-xs dark:text-gray-400"
                style={theme === 'light' ? { color: '#4b5563' } : {}}
              >
                Connected
              </span>
            )}
          </div>
        </div>
        {/* Navigation and View Controls */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigateDate('prev')}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="Предыдущий"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'day'
                  ? 'bg-blue-500 text-white'
                  : 'dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600'
              }`}
              style={currentView !== 'day' && theme === 'light' ? { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' } : {}}
            >
              Day
            </button>
            <button
              onClick={() => setCurrentView('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600'
              }`}
              style={currentView !== 'week' && theme === 'light' ? { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' } : {}}
            >
              Week
            </button>
            <button
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600'
              }`}
              style={currentView !== 'month' && theme === 'light' ? { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' } : {}}
            >
              Month
            </button>
          </div>
          <button
            onClick={() => navigateDate('next')}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="Следующий"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Content */}
        <div 
          ref={scrollContainerRef}
          className={`overflow-y-auto overflow-x-hidden ${isFullscreen ? 'flex-1 min-h-0 pr-1' : ''}`}
          style={isFullscreen ? { minHeight: 0 } : { maxHeight: '500px' }}
        >
          {currentView === 'day' && renderDayView()}
          {currentView === 'week' && renderWeekView()}
          {currentView === 'month' && renderMonthView()}
        </div>
      </div>

      {/* Event Modal */}
      {isEventModalOpen && (
        <Portal>
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]"
            onClick={() => setIsEventModalOpen(false)}
          >
              <div 
                className="rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] flex flex-col border"
                style={theme === 'light' ? { 
                  backgroundColor: '#ffffff', 
                  borderColor: '#bfdbfe' 
                } : { 
                  backgroundColor: '#1f2937', 
                  borderColor: '#374151' 
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h3 
                    className="text-lg font-semibold"
                    style={theme === 'light' ? { color: '#111827' } : { color: '#f9fafb' }}
                  >
                    {editingEvent ? 'Редактировать событие' : 'Добавить новое событие'}
                  </h3>
                  <button
                    onClick={() => setIsEventModalOpen(false)}
                    className="p-2 rounded-lg transition-colors"
                    style={theme === 'light' ? { 
                      color: '#6b7280' 
                    } : { 
                      color: '#d1d5db' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#374151';
                      e.currentTarget.style.color = theme === 'light' ? '#111827' : '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme === 'light' ? '#6b7280' : '#d1d5db';
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0">
              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  style={theme === 'light' ? { color: '#374151' } : {}}
                >
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className={baseInputClasses}
                  style={getInputStyle()}
                  placeholder="Введите название события"
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  style={theme === 'light' ? { color: '#374151' } : {}}
                >
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className={baseInputClasses}
                  style={getInputStyle()}
                  placeholder="Enter event description"
                  rows="3"
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  style={theme === 'light' ? { color: '#374151' } : {}}
                >
                  Video Meeting Link (optional)
                </label>
                <input
                  type="url"
                  value={eventForm.videoLink}
                  onChange={(e) => setEventForm({ ...eventForm, videoLink: e.target.value })}
                  className={baseInputClasses}
                  style={getInputStyle()}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  style={theme === 'light' ? { color: '#374151' } : {}}
                >
                  Source
                </label>
                <select
                  value={eventForm.source}
                  onChange={(e) => setEventForm({ ...eventForm, source: e.target.value })}
                  className={baseInputClasses}
                  style={getInputStyle()}
                >
                  <option value="google">Google</option>
                  <option value="bitrix24">Битрикс24</option>
                  <option value="amocrm">AmoCRM</option>
                  <option value="yandex">Яндекс Трекер</option>
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  style={theme === 'light' ? { color: '#374151' } : {}}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className={baseInputClasses}
                  style={getInputStyle()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={eventForm.hour}
                      onChange={(e) => setEventForm({ ...eventForm, hour: parseInt(e.target.value) })}
                      className={`${baseInputClasses} flex-1`}
                      style={getInputStyle()}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {(i % 12 || 12).toString().padStart(2, '0')} {i >= 12 ? 'PM' : 'AM'}
                        </option>
                      ))}
                    </select>
                    <select
                      value={eventForm.minute}
                      onChange={(e) => setEventForm({ ...eventForm, minute: parseInt(e.target.value) })}
                      className={`${baseInputClasses} flex-1`}
                      style={getInputStyle()}
                    >
                      {Array.from({ length: 4 }, (_, i) => (
                        <option key={i * 15} value={i * 15}>
                          {(i * 15).toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (min)
                  </label>
                  <select
                    value={eventForm.duration}
                    onChange={(e) => setEventForm({ ...eventForm, duration: parseInt(e.target.value) })}
                    className={baseInputClasses}
                    style={getInputStyle()}
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  {['blue', 'green', 'red', 'purple', 'orange', 'pink'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        eventForm.color === color
                          ? 'border-black dark:border-white'
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-${color}-500`}
                    />
                  ))}
                </div>
              </div>
              </div>

              <div 
                className="flex gap-3 justify-end mt-6 flex-shrink-0 pt-4 border-t"
                style={theme === 'light' ? { borderColor: '#bfdbfe' } : { borderColor: '#374151' }}
              >
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="px-4 py-2 rounded-lg border transition-colors"
                style={theme === 'light' ? { 
                  backgroundColor: '#f3f4f6', 
                  borderColor: '#d1d5db',
                  color: '#374151'
                } : { 
                  backgroundColor: '#374151', 
                  borderColor: '#4b5563',
                  color: '#d1d5db'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'light' ? '#e5e7eb' : '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#374151';
                }}
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={saveEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400"
              >
                {editingEvent ? 'Update' : 'Create'} Event
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
