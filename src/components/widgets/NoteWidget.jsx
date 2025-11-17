import { FileText, Paperclip, Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function NoteWidget({ config, onUpdate, isFullscreen = false }) {
  const { theme } = useTheme();
  const [text, setText] = useState(config.text || '');
  const [attachments, setAttachments] = useState(config.attachments || []);
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Save changes when exiting fullscreen mode
  useEffect(() => {
    if (!isFullscreen && text !== config.text) {
      onUpdate({ ...config, text });
    }
  }, [isFullscreen]);

  // Sync local state with config when it changes externally
  useEffect(() => {
    if (config.text !== text) {
      setText(config.text || '');
    }
  }, [config.text]);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const newAttachments = [...attachments];
    for (let file of files) {
      try {
        const base64 = await toBase64(file);
        newAttachments.push({
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
    setAttachments(newAttachments);
    onUpdate({ ...config, attachments: newAttachments });
  };

  const deleteAttachment = (id) => {
    const newAtt = attachments.filter(att => att.id !== id);
    setAttachments(newAtt);
    onUpdate({ ...config, attachments: newAtt });
  };

  const downloadFile = (att) => {
    const link = document.createElement('a');
    link.href = att.data;
    link.download = att.name;
    link.click();
  };

  const handleBlur = () => {
    onUpdate({ ...config, text });
  };

  // Text formatting functions
  const wrapSelection = (before, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    setText(newText);
    onUpdate({ ...config, text: newText });

    // Restore selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newText = beforeText + textToInsert + afterText;
    setText(newText);
    onUpdate({ ...config, text: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleBold = () => wrapSelection('**');
  const handleItalic = () => wrapSelection('*');
  const handleUnderline = () => wrapSelection('__');
  const handleBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const beforeLine = text.substring(0, lineStart);
    const afterLine = text.substring(lineStart);
    
    const newText = beforeLine + '• ' + afterLine;
    setText(newText);
    onUpdate({ ...config, text: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + 2, lineStart + 2);
    }, 0);
  };

  const handleNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const beforeLine = text.substring(0, lineStart);
    const afterLine = text.substring(lineStart);
    
    const newText = beforeLine + '1. ' + afterLine;
    setText(newText);
    onUpdate({ ...config, text: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + 3, lineStart + 3);
    }, 0);
  };

  const getFontSizeClass = (fontSize) => {
    if (isFullscreen) {
      switch (fontSize) {
        case 'small': return 'text-base';
        case 'large': return 'text-2xl';
        default: return 'text-lg';
      }
    }
    switch (fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getBgColorClass = (bgColor) => {
    switch (bgColor) {
      case 'yellow': return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'blue': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'green': return 'bg-green-50 dark:bg-green-900/20';
      case 'pink': return 'bg-pink-50 dark:bg-pink-900/20';
      default: return 'bg-transparent';
    }
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
      className="h-full flex flex-col"
      data-canvas-wheel-lock="true"
      onWheel={handleWidgetWheel}
    >
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto flex flex-col p-2 space-y-2"
      >
        {/* Панель инструментов текстового редактора */}
        <div 
          className="flex gap-1 p-2 border-b flex-shrink-0 flex-wrap"
          style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
        >
          <button
            onClick={handleBold}
            title="Bold (wrap with **)"
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            type="button"
          >
            <Bold className="w-4 h-4" style={theme === 'light' ? { color: '#374151' } : { color: '#d1d5db' }} />
          </button>
          <button
            onClick={handleItalic}
            title="Italic (wrap with *)"
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            type="button"
          >
            <Italic className="w-4 h-4" style={theme === 'light' ? { color: '#374151' } : { color: '#d1d5db' }} />
          </button>
          <button
            onClick={handleUnderline}
            title="Underline (wrap with __)"
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            type="button"
          >
            <Underline className="w-4 h-4" style={theme === 'light' ? { color: '#374151' } : { color: '#d1d5db' }} />
          </button>
          <div 
            className="w-px bg-gray-300 dark:bg-gray-600 mx-1"
            style={theme === 'light' ? { backgroundColor: '#d1d5db' } : {}}
          />
          <button
            onClick={handleBulletList}
            title="Маркированный список"
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            type="button"
          >
            <List className="w-4 h-4" style={theme === 'light' ? { color: '#374151' } : { color: '#d1d5db' }} />
          </button>
          <button
            onClick={handleNumberedList}
            title="Нумерованный список"
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            type="button"
          >
            <ListOrdered className="w-4 h-4" style={theme === 'light' ? { color: '#374151' } : { color: '#d1d5db' }} />
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Type your notes here..."
          className={`flex-1 w-full ${isFullscreen ? 'p-6' : 'p-3'} rounded-lg ${theme === 'dark' ? 'text-gray-100' : 'text-black'} placeholder-gray-400 dark:placeholder-gray-500 ${getBgColorClass(config.backgroundColor)} resize-none focus:outline-none ${getFontSizeClass(config.fontSize)} min-h-0`}
        />
        <div 
          className="flex-shrink-0 pt-3 border-t flex-col space-y-3"
          style={theme === 'light' ? { borderColor: '#e5e7eb' } : {}}
        >
          <div className="flex items-start gap-3">
            <button 
              onClick={() => fileInputRef.current.click()} 
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all shadow-sm flex-shrink-0"
              style={theme === 'light' ? { 
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: '1px solid #2563eb'
              } : {
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: '1px solid #2563eb'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'light' ? '#2563eb' : '#2563eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
              }}
            >
              <Paperclip className="w-4 h-4" />
              Прикрепить файл
            </button>
            {attachments.length > 0 && (
              <div className="flex-1 max-h-32 overflow-y-auto space-y-2">
                {attachments.map(att => (
                  <div 
                    key={att.id} 
                    className="flex items-center gap-2 py-2 text-xs rounded-lg px-3 transition-colors"
                    style={theme === 'light' ? { 
                      color: '#374151',
                      backgroundColor: '#f9fafb'
                    } : {
                      backgroundColor: '#374151'
                    }}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#6b7280' }} />
                    <span className="flex-1 truncate">{att.name}</span>
                    <span 
                      className="dark:text-gray-400 flex-shrink-0"
                      style={theme === 'light' ? { color: '#6b7280' } : {}}
                    >
                      ({(att.size / 1024).toFixed(1)} KB)
                    </span>
                    <button 
                      onClick={() => downloadFile(att)} 
                      className="px-2 py-1 rounded-md text-xs font-medium transition-all flex-shrink-0"
                      style={theme === 'light' ? {
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe'
                      } : {
                        backgroundColor: '#1e3a8a',
                        color: '#93c5fd',
                        border: '1px solid #1e40af'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#dbeafe' : '#1e40af';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#eff6ff' : '#1e3a8a';
                      }}
                    >
                      ↓
                    </button>
                    <button 
                      onClick={() => deleteAttachment(att.id)} 
                      className="px-2 py-1 rounded-md text-xs font-medium transition-all flex-shrink-0"
                      style={theme === 'light' ? {
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca'
                      } : {
                        backgroundColor: '#7f1d1d',
                        color: '#fca5a5',
                        border: '1px solid #991b1b'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#fee2e2' : '#991b1b';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#fef2f2' : '#7f1d1d';
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <span 
              className="text-xs dark:text-gray-400"
              style={theme === 'light' ? { color: '#6b7280' } : {}}
            >
              {text.length} characters
            </span>
          </div>
        </div>
      </div>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
