import { useState } from 'react';
import { Calendar, Clock, Settings, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, X } from 'lucide-react';

export default function CalendarWidget({ widget, onUpdate, isFullscreen = false }) {
  const [currentView, setCurrentView] = useState('day'); // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Events stored in widget config, fallback to default
  const [events, setEvents] = useState(widget.config.events || [
    { id: '1', title: 'Team Sync Meeting', hour: 10, minute: 0, date: '2025-11-16', color: 'blue', duration: 60 },
    { id: '2', title: 'Client Presentation', hour: 14, minute: 30, date: '2025-11-16', color: 'green', duration: 60 },
    { id: '3', title: 'Strategy Planning', hour: 9, minute: 0, date: '2025-11-17', color: 'red', duration: 90 },
    { id: '4', title: 'Budget Review', hour: 16, minute: 0, date: '2025-11-17', color: 'purple', duration: 45 },
    { id: '5', title: 'Weekly Standup', hour: 11, minute: 0, date: '2025-11-18', color: 'orange', duration: 30 },
    { id: '6', title: 'Product Demo', hour: 15, minute: 30, date: '2025-11-19', color: 'pink', duration: 60 }
  ]);

  // Event modal state
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    hour: 9,
    minute: 0,
    duration: 60,
    color: 'blue'
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

  const renderDayView = () => {
    const dayEvents = getFilteredEvents().sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-center mb-3">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h4>
        {dayEvents.length === 0 ? (
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center py-4">No events scheduled</p>
        ) : (
          dayEvents.map((event) => (
            <div key={event.id} className={`p-3 rounded-lg border-l-4 ${getColorClass(event.color)} bg-gray-50 dark:bg-gray-800 group`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{formatTime(event.hour, event.minute)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({event.duration}min)</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditEvent(event)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Edit Event"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="font-medium text-sm">{event.title}</p>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekEvents = getFilteredEvents();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div>
        <h4 className="text-sm font-medium text-center mb-3">
          Week of {new Date(currentDate.getTime() - currentDate.getDay() * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h4>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center font-medium py-1 border-b border-gray-200 dark:border-gray-700">
              {day}
            </div>
          ))}
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - currentDate.getDay() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = weekEvents.filter(event => event.date === dateStr);

            return (
              <div key={i} className="min-h-[60px] p-1 border border-gray-200 dark:border-gray-700 rounded">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{date.getDate()}</div>
                {dayEvents.slice(0, 2).map(event => (
                  <div key={event.id} className={`text-xs p-1 mb-1 rounded border-l-2 ${
                    event.color === 'blue' ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                    event.color === 'green' ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' :
                    event.color === 'red' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' :
                    'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
                  } truncate`}>
                    {formatTime(event.hour, event.minute)}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">+{dayEvents.length - 2} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthEvents = getFilteredEvents();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    return (
      <div>
        <h4 className="text-sm font-medium text-center mb-3">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="grid grid-cols-7 gap-0.5 text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium py-2 bg-gray-100 dark:bg-gray-800 rounded">
              {day}
            </div>
          ))}
          {Array.from({ length: 42 }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const isCurrentMonth = date.getMonth() === month;
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = monthEvents.filter(event => event.date === dateStr);

            return (
              <div key={i} className={`min-h-[60px] p-1 border border-gray-200 dark:border-gray-700 rounded ${
                !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/20' : 'bg-white dark:bg-gray-800'
              }`}>
                <div className={`text-xs mb-1 ${isCurrentMonth ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {date.getDate()}
                </div>
                {dayEvents.slice(0, 1).map(event => (
                  <div key={event.id} className={`text-xs p-1 rounded border-l-2 ${
                    event.color === 'blue' ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                    event.color === 'green' ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' :
                    event.color === 'red' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' :
                    'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20'
                  } truncate`}>
                    {event.title.length > 8 ? event.title.substring(0, 8) + '...' : event.title}
                  </div>
                ))}
                {dayEvents.length > 1 && (
                  <div className="text-xs text-blue-500 mt-1">+{dayEvents.length - 1}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getColorClass = (color) => {
    const colors = {
      blue: 'border-l-blue-500',
      green: 'border-l-green-500',
      red: 'border-l-red-500',
      purple: 'border-l-purple-500',
      orange: 'border-l-orange-500',
      pink: 'border-l-pink-500'
    };
    return colors[color] || 'border-l-blue-500';
  };

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      date: currentDate.toISOString().split('T')[0],
      hour: 9,
      minute: 0,
      duration: 60,
      color: 'blue'
    });
    setIsEventModalOpen(true);
  };

  const openEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      hour: event.hour,
      minute: event.minute,
      duration: event.duration,
      color: event.color
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
    onUpdate({ events: updatedEvents });
    setIsEventModalOpen(false);
  };

  const deleteEvent = (eventId) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    onUpdate({ events: updatedEvents });
  };

  return (
    <div className="p-4">
      {!widget.config.configured ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <Settings className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm text-gray-700 dark:text-gray-300">Configure calendar sources</p>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">Select provider and enter API details</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">
              {widget.config.calendarName ? `${widget.config.calendarName} Calendar` : 'Calendar Events'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={openAddEvent}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Add Event"
              >
                <Plus className="w-4 h-4" />
              </button>
              <Calendar className={`w-4 h-4 text-${widget.config.calendarColor || 'blue'}-500`} />
              <span className="text-xs text-gray-600 dark:text-gray-400">Connected</span>
            </div>
          </div>
          {/* Navigation and View Controls */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentView('day')}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  currentView === 'day'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'border border-gray-200 dark:border-gray-800'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setCurrentView('week')}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  currentView === 'week'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'border border-gray-200 dark:border-gray-800'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView('month')}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  currentView === 'month'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'border border-gray-200 dark:border-gray-800'
                }`}
              >
                Month
              </button>
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Content */}
          <div className="max-h-64 overflow-y-auto">
            {currentView === 'day' && renderDayView()}
            {currentView === 'week' && renderWeekView()}
            {currentView === 'month' && renderMonthView()}
          </div>
        </div>
      )}

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingEvent ? 'Update' : 'Create'} Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
