import { Bot, Send, Upload, Trash2, Loader2, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import openaiService from '../../services/openai.js';

export default function ChatGPTWidget({ config, onUpdate, isFullscreen = false }) {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    // Initialize from config if available, otherwise use default
    if (config?.messages && Array.isArray(config.messages) && config.messages.length > 0) {
      return config.messages;
    }
    return [
      { role: 'assistant', content: 'Hello! How can I help you analyze your business today?' }
    ];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Persist messages to config when they change (but not on initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (onUpdate && messages.length > 0) {
      onUpdate({ messages });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    setMessage('');
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
      { role: 'assistant', content: 'Hello! How can I help you analyze your business today?' }
    ];
    setMessages(initialMessage);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 overflow-y-auto ${isFullscreen ? 'p-6' : 'p-4'} ${isFullscreen ? 'space-y-4' : 'space-y-3'}`}>
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
              <p className={isFullscreen ? 'text-base' : 'text-sm'}>Analyzing your request...</p>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className={`${isFullscreen ? 'p-6' : 'p-3'} border-t border-gray-200 dark:border-gray-800`}>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            Upload
          </button>
          <span className={`text-xs ml-auto self-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
          }`}>
            {messages.length} messages
          </span>
        </div>
        <div className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything..."
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className={`w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent ${isFullscreen ? 'text-base' : 'text-sm'} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${isFullscreen ? 'min-h-[6rem] max-h-64' : 'min-h-[4rem] max-h-32'} overflow-y-auto`}
            style={{ resize: 'vertical' }}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isFullscreen ? 'px-6 py-4' : 'px-4 py-3'} bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold ${isFullscreen ? 'text-base' : 'text-sm'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className={`${isFullscreen ? 'w-5 h-5' : 'w-4 h-4'} animate-spin`} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className={`${isFullscreen ? 'w-5 h-5' : 'w-4 h-4'}`} />
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
