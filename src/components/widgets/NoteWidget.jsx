import { FileText, Paperclip } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function NoteWidget({ config, onUpdate, isFullscreen = false }) {
  const { theme } = useTheme();
  const [text, setText] = useState(config.text || '');
  const [attachments, setAttachments] = useState(config.attachments || []);
  const fileInputRef = useRef(null);

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

  return (
    <div className="h-full flex flex-col p-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="Type your notes here..."
        className={`flex-1 w-full ${isFullscreen ? 'p-6' : 'p-3'} rounded-lg ${theme === 'dark' ? 'text-gray-100' : 'text-black'} placeholder-gray-400 dark:placeholder-gray-500 ${getBgColorClass(config.backgroundColor)} resize-none focus:outline-none ${getFontSizeClass(config.fontSize)} min-h-0`}
      />
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <Paperclip className="w-4 h-4" />
          Attach Files
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {text.length} characters
        </span>
      </div>
      {attachments.length > 0 && (
        <div className="mt-2 max-h-32 overflow-y-auto px-4">
          {attachments.map(att => (
            <div key={att.id} className="flex items-center gap-2 py-1 text-xs text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-600" />
              <span className="flex-1 truncate">{att.name}</span>
              <span className="text-gray-500 dark:text-gray-400">({(att.size / 1024).toFixed(1)} KB)</span>
              <button onClick={() => downloadFile(att)} className="text-blue-500 dark:text-blue-400 p-1 hover:text-blue-600 dark:hover:text-blue-300">↓</button>
              <button onClick={() => deleteAttachment(att.id)} className="text-red-500 dark:text-red-400 p-1 hover:text-red-600 dark:hover:text-red-300">×</button>
            </div>
          ))}
        </div>
      )}
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
