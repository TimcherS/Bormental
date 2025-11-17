import { Bot, Send, Upload, Trash2, Loader2, Settings, FileText, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import openaiService from '../../services/openai.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function ChatGPTWidget({ config, onUpdate, isFullscreen = false }) {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    // Initialize from config if available, otherwise use default
    if (config?.messages && Array.isArray(config.messages) && config.messages.length > 0) {
      return config.messages;
    }
    return [
      { role: 'assistant', content: 'Здравствуйте! Как я могу помочь проанализировать ваш бизнес сегодня?' }
    ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Persist messages to config when they change (but not on initial mount)
  const isInitialMount = useRef(true);
  const scrollContainerRef = useRef(null);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (onUpdate && messages.length > 0) {
      onUpdate({ messages });
    }
  }, [messages]);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    const newFiles = [];
    for (let file of files) {
      try {
        const base64 = await toBase64(file);
        newFiles.push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64
        });
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Build message content with file information
    let messageContent = message;
    if (attachedFiles.length > 0) {
      const fileList = attachedFiles.map(f => `\n- ${f.name} (${(f.size / 1024).toFixed(1)} KB)`).join('');
      messageContent += `\n\n[Attached Files: ${attachedFiles.length}${fileList}]`;
    }

    const newMessages = [...messages, { role: 'user', content: messageContent, files: attachedFiles }];
    setMessages(newMessages);
    setMessage('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const response = await openaiService.createChatCompletion(newMessages, {
        model: config?.model || 'gpt-3.5-turbo',
        temperature: config?.temperature || 0.7,
        systemPrompt: config?.systemPrompt || 'You are a helpful business assistant. Provide clear, actionable insights for business decisions.',
        max_tokens: config?.maxTokens || 1000
      });

      const assistantMessage = response.choices[0]?.message;
      if (assistantMessage) {
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('ChatGPT API error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}. Please check your API key in the widget settings.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    const initialMessage = [
      { role: 'assistant', content: 'Здравствуйте! Как я могу помочь проанализировать ваш бизнес сегодня?' }
    ];
    setMessages(initialMessage);
    setAttachedFiles([]);
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
      className="flex flex-col h-full"
      data-canvas-wheel-lock="true"
      onWheel={handleWidgetWheel}
    >
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto ${isFullscreen ? 'p-6' : 'p-4'} ${isFullscreen ? 'space-y-4' : 'space-y-3'}`}
      >
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${isFullscreen ? 'mb-4' : 'mb-3'}`}>
            <div className={`max-w-[80%] ${isFullscreen ? 'px-4 py-3' : 'px-3 py-2'} rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : theme === 'dark' 
                  ? 'bg-gray-900 text-gray-100' 
                  : 'bg-gray-200 text-black'
            }`}>
              <p className={isFullscreen ? 'text-base' : 'text-sm'}>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`max-w-[80%] ${isFullscreen ? 'px-4 py-3' : 'px-3 py-2'} rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-200'} flex items-center gap-2 ${theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className={isFullscreen ? 'text-base' : 'text-sm'}>Анализирую ваш запрос...</p>
            </div>
          </div>
        )}
      </div>
      <form 
        onSubmit={handleSend} 
        className={`${isFullscreen ? 'p-6' : 'p-3'} border-t dark:border-gray-800`}
        style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
      >
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={handleClear}
            className={`px-3 py-1.5 text-xs border rounded-lg transition-colors flex items-center gap-1 ${
              theme === 'dark'
                ? 'border-gray-800 hover:bg-gray-900 text-white'
                : 'border-gray-300 hover:bg-gray-50 text-gray-900'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            Очистить
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-1.5 text-xs border rounded-lg transition-colors flex items-center gap-1 ${
              theme === 'dark'
                ? 'border-gray-800 hover:bg-gray-900 text-white'
                : 'border-gray-300 hover:bg-gray-50 text-gray-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            Загрузить {attachedFiles.length > 0 && `(${attachedFiles.length})`}
          </button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json,.xml,.jpg,.jpeg,.png,.gif"
          />
          <span 
            className="text-xs ml-auto self-center dark:text-gray-400"
            style={theme === 'light' ? { color: '#374151' } : {}}
          >
            {messages.length} сообщений
          </span>
        </div>
        
        {/* Attached Files Display */}
        {attachedFiles.length > 0 && (
          <div className="mb-2 space-y-2 max-h-32 overflow-y-auto">
            {attachedFiles.map(file => (
              <div 
                key={file.id}
                className="flex items-center gap-2 py-2 px-3 text-xs rounded-lg transition-colors"
                style={theme === 'light' ? { 
                  backgroundColor: '#f9fafb',
                  color: '#374151'
                } : {
                  backgroundColor: '#374151',
                  color: '#e5e7eb'
                }}
              >
                <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#6b7280' }} />
                <span className="flex-1 truncate">{file.name}</span>
                <span 
                  className="flex-shrink-0"
                  style={theme === 'light' ? { color: '#6b7280' } : { color: '#9ca3af' }}
                >
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Спросите что угодно..."
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className={`w-full px-4 py-3 rounded-lg border dark:border-gray-800 bg-transparent ${isFullscreen ? 'text-base' : 'text-sm'} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${isFullscreen ? 'min-h-[6rem] max-h-64' : 'min-h-[4rem] max-h-32'} overflow-y-auto`}
            style={theme === 'light' ? { resize: 'vertical', borderColor: '#e5e7eb' } : { resize: 'vertical' }}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isFullscreen ? 'px-6 py-4' : 'px-4 py-3'} bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold ${isFullscreen ? 'text-base' : 'text-sm'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className={`${isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} animate-spin`} />
                <span>Обработка...</span>
              </>
            ) : (
              <>
                <Send className={`${isFullscreen ? 'w-5 h-5' : 'w-4 h-4'}`} />
                <span>Отправить</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
