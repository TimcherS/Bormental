import { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, Settings, GripVertical, Maximize2, X, AlertTriangle, Cable } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SocialMediaWidget from './widgets/SocialMediaWidget';
import EmailWidget from './widgets/EmailWidget';
import CalendarWidget from './widgets/CalendarWidget';
import RevenueWidget from './widgets/RevenueWidget';
import ChartWidget from './widgets/ChartWidget';
import MarketingWidget from './widgets/MarketingWidget';
import ChatGPTWidget from './widgets/ChatGPTWidget';
import NoteWidget from './widgets/NoteWidget';
import NewsWidget from './widgets/NewsWidget';
import WidgetConfigModal from './WidgetConfigModal';
import Portal from './Portal';
import openaiService from '../services/openai.js';

export default function Widget({ widget, isSelected, onSelect, onUpdate, onDelete, gridSize, pan, zoom, onStartConnection, isConnectionMode, isConnectionTarget }) {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBorderHovered, setIsBorderHovered] = useState(false);
  const [resizeType, setResizeType] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const widgetRef = useRef(null);

  const MIN_WIDTH = 200;
  const MIN_HEIGHT = 150;

  const snapToGrid = useCallback((value) => {
    return Math.round(value / gridSize) * gridSize;
  }, [gridSize]);

  const handleInteractionStart = useCallback((clientX, clientY, e) => {
    // Don't start dragging if clicking on buttons, inputs, or interactive elements
    if (e.target.closest('.widget-resize-handle') || 
        e.target.closest('.widget-config') || 
        e.target.closest('.widget-delete') || 
        e.target.closest('.widget-fullscreen') ||
        e.target.closest('.widget-connect-btn') ||
        e.target.closest('button') ||
        e.target.closest('input') ||
        e.target.closest('textarea') ||
        e.target.closest('select') ||
        e.target.closest('a') ||
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT' ||
        e.target.tagName === 'A') {
      return;
    }

    // Get canvas container for coordinate conversion
    const canvasElement = widgetRef.current?.parentElement;
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();
    // Convert client coordinates to canvas space
    const canvasX = (clientX - rect.left) / zoom;
    const canvasY = (clientY - rect.top) / zoom;

    // Capture drag offset in closure
    const dragOffsetX = canvasX - widget.x;
    const dragOffsetY = canvasY - widget.y;

    setIsDragging(true);
    setDragStart({ x: dragOffsetX, y: dragOffsetY });
    onSelect();

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'crosshair';

    const handleInteractionMove = (e) => {
      e.preventDefault();
      // Prevent text selection
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const currentY = e.touches ? e.touches[0].clientY : e.clientY;

      // Convert to canvas space
      const canvasCurrentX = (currentX - rect.left) / zoom;
      const canvasCurrentY = (currentY - rect.top) / zoom;

      const newX = Math.max(0, snapToGrid(canvasCurrentX - dragOffsetX));
      const newY = Math.max(0, snapToGrid(canvasCurrentY - dragOffsetY));
      
      // Update drag position for cross indicator
      setDragPosition({ x: newX, y: newY });
      onUpdate({ x: newX, y: newY });
    };

    const handleInteractionEnd = () => {
      setIsDragging(false);
      setDragPosition({ x: 0, y: 0 });
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleInteractionMove);
      document.removeEventListener('mouseup', handleInteractionEnd);
      document.removeEventListener('touchmove', handleInteractionMove);
      document.removeEventListener('touchend', handleInteractionEnd);
    };

    document.addEventListener('mousemove', handleInteractionMove);
    document.addEventListener('mouseup', handleInteractionEnd);
    document.addEventListener('touchmove', handleInteractionMove, { passive: false });
    document.addEventListener('touchend', handleInteractionEnd);
  }, [widget, snapToGrid, onSelect, onUpdate, zoom]);

  const handleMouseDown = useCallback((e) => {
    handleInteractionStart(e.clientX, e.clientY, e);
  }, [handleInteractionStart]);

  const handleResizeInteractionStart = useCallback((clientX, clientY, type, e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeType(type);

    // Get canvas container for coordinate conversion
    const canvasElement = widgetRef.current?.parentElement;
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();
    // Convert client coordinates to canvas space for resize start
    const canvasStartX = (clientX - rect.left) / zoom;
    const canvasStartY = (clientY - rect.top) / zoom;

    const initialResizeStart = {
      width: widget.width,
      height: widget.height,
      x: widget.x,
      y: widget.y,
      startX: canvasStartX,
      startY: canvasStartY,
      type
    };

    setResizeStart(initialResizeStart);

    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'crosshair';

    const handleInteractionMove = (e) => {
      e.preventDefault();
      // Prevent text selection
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const currentY = e.touches ? e.touches[0].clientY : e.clientY;

      // Convert to canvas space
      const canvasCurrentX = (currentX - rect.left) / zoom;
      const canvasCurrentY = (currentY - rect.top) / zoom;

      let updates = {};

      switch (type) {
        case 'se': { // bottom-right corner
          const deltaX = canvasCurrentX - initialResizeStart.startX;
          const deltaY = canvasCurrentY - initialResizeStart.startY;
          updates.width = Math.max(MIN_WIDTH, snapToGrid(initialResizeStart.width + deltaX));
          updates.height = Math.max(MIN_HEIGHT, snapToGrid(initialResizeStart.height + deltaY));
          break;
        }
        case 'sw': { // bottom-left corner
          const deltaXsw = canvasCurrentX - initialResizeStart.startX;
          const deltaYsw = canvasCurrentY - initialResizeStart.startY;
          updates.x = Math.max(0, snapToGrid(initialResizeStart.x + deltaXsw));
          updates.width = Math.max(MIN_WIDTH, snapToGrid(initialResizeStart.width - deltaXsw));
          updates.height = Math.max(MIN_HEIGHT, snapToGrid(initialResizeStart.height + deltaYsw));
          break;
        }
        case 'ne': { // top-right corner
          const deltaXne = canvasCurrentX - initialResizeStart.startX;
          const deltaYne = canvasCurrentY - initialResizeStart.startY;
          updates.y = Math.max(0, snapToGrid(initialResizeStart.y + deltaYne));
          updates.width = Math.max(MIN_WIDTH, snapToGrid(initialResizeStart.width + deltaXne));
          updates.height = Math.max(MIN_HEIGHT, snapToGrid(initialResizeStart.height - deltaYne));
          break;
        }
        case 'nw': { // top-left corner
          const deltaXnw = canvasCurrentX - initialResizeStart.startX;
          const deltaYnw = canvasCurrentY - initialResizeStart.startY;
          updates.x = Math.max(0, snapToGrid(initialResizeStart.x + deltaXnw));
          updates.y = Math.max(0, snapToGrid(initialResizeStart.y + deltaYnw));
          updates.width = Math.max(MIN_WIDTH, snapToGrid(initialResizeStart.width - deltaXnw));
          updates.height = Math.max(MIN_HEIGHT, snapToGrid(initialResizeStart.height - deltaYnw));
          break;
        }
        case 'n': { // north side
          const deltaYn = canvasCurrentY - initialResizeStart.startY;
          updates.y = Math.max(0, snapToGrid(initialResizeStart.y + deltaYn));
          updates.height = Math.max(MIN_HEIGHT, snapToGrid(initialResizeStart.height - deltaYn));
          break;
        }
        case 's': { // south side
          const deltaYs = canvasCurrentY - initialResizeStart.startY;
          updates.height = Math.max(MIN_HEIGHT, snapToGrid(initialResizeStart.height + deltaYs));
          break;
        }
        case 'e': { // east side
          const deltaXe = canvasCurrentX - initialResizeStart.startX;
          updates.width = Math.max(MIN_WIDTH, snapToGrid(initialResizeStart.width + deltaXe));
          break;
        }
        case 'w': { // west side
          const deltaXw = canvasCurrentX - initialResizeStart.startX;
          updates.x = Math.max(0, snapToGrid(initialResizeStart.x + deltaXw));
          updates.width = Math.max(MIN_WIDTH, snapToGrid(initialResizeStart.width - deltaXw));
          break;
        }
      }

      onUpdate(updates);
    };

    const handleInteractionEnd = () => {
      setIsResizing(false);
      setResizeType(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleInteractionMove);
      document.removeEventListener('mouseup', handleInteractionEnd);
      document.removeEventListener('touchmove', handleInteractionMove);
      document.removeEventListener('touchend', handleInteractionEnd);
    };

    document.addEventListener('mousemove', handleInteractionMove);
    document.addEventListener('mouseup', handleInteractionEnd);
    document.addEventListener('touchmove', handleInteractionMove, { passive: false });
    document.addEventListener('touchend', handleInteractionEnd);
  }, [widget, snapToGrid, onUpdate, MIN_WIDTH, MIN_HEIGHT, zoom]);



  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent scrolling and zooming when modals are open
  useEffect(() => {
    if (isFullscreen || isDeleteConfirmOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Mark that a fullscreen/modal is open globally
      if (isFullscreen) {
        document.body.setAttribute('data-fullscreen-widget-open', 'true');
      }
      if (isDeleteConfirmOpen) {
        document.body.setAttribute('data-delete-modal-open', 'true');
      }
      
      // Smart wheel event handler: allow scrolling inside modal/fullscreen, prevent canvas zoom outside
      const preventCanvasZoom = (e) => {
        // Check if we're in fullscreen mode or modal
        const fullscreenContainer = document.querySelector('[data-fullscreen-widget="true"]');
        const deleteModal = document.querySelector('[data-delete-modal="true"]');
        
        // Check fullscreen widget - allow ALL scrolling inside
        if (fullscreenContainer && fullscreenContainer.contains(e.target)) {
          // Find scrollable element within fullscreen
          let currentElement = e.target;
          while (currentElement && currentElement !== fullscreenContainer) {
            const { scrollHeight, clientHeight } = currentElement;
            if (scrollHeight > clientHeight) {
              // This element is scrollable, allow scroll
              e.stopPropagation(); // Prevent propagation to canvas
              return;
            }
            currentElement = currentElement.parentElement;
          }
          // Check the fullscreen container itself
          const { scrollTop, scrollHeight, clientHeight } = fullscreenContainer;
          const isScrollable = scrollHeight > clientHeight;
          const isAtTop = scrollTop === 0;
          const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
          
          if (isScrollable) {
            if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
              // At boundary - prevent
              e.preventDefault();
              e.stopPropagation();
            } else {
              // Allow scroll
              e.stopPropagation();
            }
            return;
          }
          // Not scrollable but inside fullscreen - prevent propagation
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        
        // Check delete confirmation modal
        if (deleteModal && deleteModal.contains(e.target)) {
          // Allow scrolling in delete modal (though it usually doesn't scroll)
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        
        // Outside all modals - prevent canvas interaction
        e.preventDefault();
        e.stopPropagation();
      };
      
      // Use capture phase to intercept before canvas handlers
      document.addEventListener('wheel', preventCanvasZoom, { passive: false, capture: true });
      document.addEventListener('touchmove', preventCanvasZoom, { passive: false, capture: true });
      
      return () => {
        document.body.style.overflow = '';
        document.body.removeAttribute('data-fullscreen-widget-open');
        document.body.removeAttribute('data-delete-modal-open');
        document.removeEventListener('wheel', preventCanvasZoom, { capture: true });
        document.removeEventListener('touchmove', preventCanvasZoom, { capture: true });
      };
    }
  }, [isFullscreen, isDeleteConfirmOpen]);

  const renderWidgetContent = () => {
    const commonProps = { isFullscreen };
    switch (widget.type) {
      case 'note':
        return <NoteWidget config={widget.config} isFullscreen={isFullscreen} onUpdate={(updates) => onUpdate({ config: { ...widget.config, ...updates } })} />;
      case 'chatgpt':
        return <ChatGPTWidget config={widget.config} isFullscreen={isFullscreen} onUpdate={(updates) => onUpdate({ config: { ...widget.config, ...updates } })} />;
      case 'social-media': return <SocialMediaWidget config={widget.config} isFullscreen={isFullscreen} />;
      case 'email': return <EmailWidget config={widget.config} isFullscreen={isFullscreen} />;
      case 'calendar': return <CalendarWidget widget={widget} isFullscreen={isFullscreen} onUpdate={(updates) => onUpdate({ config: { ...widget.config, ...updates } })} fullscreenView={widget.config.fullscreenView} setFullscreenView={(view) => onUpdate({ config: { ...widget.config, fullscreenView: view } })} />;
      case 'revenue': return <RevenueWidget config={widget.config} isFullscreen={isFullscreen} />;
      case 'chart': return <ChartWidget config={widget.config} isFullscreen={isFullscreen} />;
      case 'marketing': return <MarketingWidget config={widget.config} isFullscreen={isFullscreen} />;
      case 'news': return <NewsWidget config={widget.config} isFullscreen={isFullscreen} />;
      default: return <div>Unknown widget type</div>;
    }
  };

  const widgetStyle = {
    transform: `translate(${widget.x}px, ${widget.y}px)`,
    width: `${widget.width}px`,
    height: `${widget.height}px`,
    zIndex: isSelected ? 10 : 1,
    boxShadow: isSelected
      ? (theme === 'dark' ? '0 0 0 2px rgba(59, 130, 246, 0.6)' : '0 0 0 2px rgba(37, 99, 235, 0.6)')
      : isConnectionTarget
      ? (theme === 'dark' ? '0 0 0 3px rgba(16, 185, 129, 0.6), 0 0 20px rgba(16, 185, 129, 0.4)' : '0 0 0 3px rgba(5, 150, 105, 0.6), 0 0 20px rgba(5, 150, 105, 0.3)')
      : '0 2px 8px rgba(0,0,0,0.1)',
  };

  const fullscreenStyle = isFullscreen ? {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(90vw, 1200px)',
    height: 'min(90vh, 800px)',
    maxWidth: '1200px',
    maxHeight: '800px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  } : widgetStyle;

  if (isFullscreen) {
    return (
      <Portal>
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10000] transition-all duration-300"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            ref={widgetRef}
            data-fullscreen-widget="true"
            className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-2xl shadow-2xl overflow-hidden cursor-default max-w-5xl max-h-[90vh] overflow-auto transform transition-all duration-300 scale-100 ${
              theme === 'dark' ? 'border border-gray-700' : 'border border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={fullscreenStyle}
          >
            <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <h3 className={`text-xl font-semibold capitalize ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {widget.config?.name || widget.type.replace('-', ' ')} Widget
              </h3>
              <button
                onClick={() => setIsFullscreen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            <div className={`flex-1 min-h-0 overflow-hidden ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              {renderWidgetContent()}
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  return (
    <>
      <div
        ref={widgetRef}
        className={`absolute ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } rounded-xl shadow-md-modern border overflow-hidden cursor-move transition-smooth flex flex-col ${
          isSelected ? 'ring-2 ring-blue-500/60 shadow-glow-blue' : 'hover:shadow-lg-modern'
        } ${isDragging ? 'z-50 opacity-98 scale-[1.02]' : ''}`}
        style={widgetStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY, e)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (!isResizing) {
            setIsHovered(false);
            setIsBorderHovered(false);
          }
        }}
        onMouseMove={(e) => {
          if (!isResizing && isSelected) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const borderThreshold = 20; // pixels from edge
            
            const isNearBorder = 
              x < borderThreshold || 
              x > rect.width - borderThreshold || 
              y < borderThreshold || 
              y > rect.height - borderThreshold;
            
            setIsBorderHovered(isNearBorder);
          }
        }}
      >
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' 
            ? 'border-gray-700 bg-gradient-to-r from-gray-700/40 via-transparent to-transparent' 
            : 'border-gray-200 bg-gradient-to-r from-gray-50/40 via-transparent to-transparent'
        }`}>
          <div className="flex items-center gap-2">
            {/* Connection Icon - Only show if not in connection mode and not the AI workspace */}
            {!isConnectionMode && widget.type !== 'chatgpt' && (
              <button
                className="p-1 rounded transition-smooth hover:bg-green-500/20 text-gray-400 hover:text-green-500 widget-connect-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onStartConnection) {
                    onStartConnection(widget.id);
                  }
                }}
                title="Connect to AI Workspace"
              >
                <Cable size={16} />
              </button>
            )}
            
            <div 
              className="cursor-grab active:cursor-grabbing p-1 rounded transition-smooth"
              style={theme === 'light' ? {} : { ':hover': { backgroundColor: 'rgba(55, 65, 81, 0.5)' } }}
              onMouseEnter={(e) => {
                if (theme === 'dark') {
                  e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (theme === 'dark') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <GripVertical size={16} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className={`text-sm font-semibold capitalize ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}>
              {widget.config?.name || widget.type.replace('-', ' ')}
            </h3>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              className="p-2 rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-500/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-smooth btn-hover-scale widget-config"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfigModalOpen(true);
              }}
              title="Настроить"
            >
              <Settings size={16} />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-purple-500/10 dark:hover:bg-purple-500/20 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-smooth btn-hover-scale widget-fullscreen"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
              }}
              title="Во весь экран"
            >
              <Maximize2 size={16} />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-red-500/10 dark:hover:bg-red-500/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-smooth btn-hover-scale widget-delete"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteConfirmOpen(true);
              }}
              title="Удалить"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {renderWidgetContent()}
        </div>
        {isSelected && (isBorderHovered || isResizing) && (
          <>
            {/* Corner handles */}
            {/* Bottom-right */}
            <div
              className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize widget-resize-handle border-2 border-blue-500 rounded-tl-lg transition-all duration-200 hover:scale-110 z-10 ${
                theme === 'dark'
                  ? 'bg-blue-500/80 hover:bg-blue-400'
                  : 'bg-blue-600/80 hover:bg-blue-500'
              }`}
              onMouseDown={(e) => handleResizeInteractionStart(e.clientX, e.clientY, 'se', e)}
              onTouchStart={(e) => handleResizeInteractionStart(e.touches[0].clientX, e.touches[0].clientY, 'se', e)}
              title="Drag to resize"
            />
            {/* Bottom-left */}
            <div
              className={`absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize widget-resize-handle border-2 border-blue-500 rounded-tr-lg transition-all duration-200 hover:scale-110 z-10 ${
                theme === 'dark'
                  ? 'bg-blue-500/80 hover:bg-blue-400'
                  : 'bg-blue-600/80 hover:bg-blue-500'
              }`}
              onMouseDown={(e) => handleResizeInteractionStart(e.clientX, e.clientY, 'sw', e)}
              onTouchStart={(e) => handleResizeInteractionStart(e.touches[0].clientX, e.touches[0].clientY, 'sw', e)}
              title="Drag to resize"
            />
            {/* Top-right */}
            <div
              className={`absolute top-0 right-0 w-4 h-4 cursor-ne-resize widget-resize-handle border-2 border-blue-500 rounded-bl-lg transition-all duration-200 hover:scale-110 z-10 ${
                theme === 'dark'
                  ? 'bg-blue-500/80 hover:bg-blue-400'
                  : 'bg-blue-600/80 hover:bg-blue-500'
              }`}
              onMouseDown={(e) => handleResizeInteractionStart(e.clientX, e.clientY, 'ne', e)}
              onTouchStart={(e) => handleResizeInteractionStart(e.touches[0].clientX, e.touches[0].clientY, 'ne', e)}
              title="Drag to resize"
            />
            {/* Top-left */}
            <div
              className={`absolute top-0 left-0 w-4 h-4 cursor-nw-resize widget-resize-handle border-2 border-blue-500 rounded-br-lg transition-all duration-200 hover:scale-110 z-10 ${
                theme === 'dark'
                  ? 'bg-blue-500/80 hover:bg-blue-400'
                  : 'bg-blue-600/80 hover:bg-blue-500'
              }`}
              onMouseDown={(e) => handleResizeInteractionStart(e.clientX, e.clientY, 'nw', e)}
              onTouchStart={(e) => handleResizeInteractionStart(e.touches[0].clientX, e.touches[0].clientY, 'nw', e)}
              title="Drag to resize"
            />
            
            {/* Side handles */}
            {/* North (top) */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-3 cursor-ns-resize widget-resize-handle border-2 border-blue-500 rounded-b-lg transition-all duration-200 hover:scale-110 z-10 ${
                theme === 'dark'
                  ? 'bg-blue-500/80 hover:bg-blue-400'
                  : 'bg-blue-600/80 hover:bg-blue-500'
              }`}
              onMouseDown={(e) => handleResizeInteractionStart(e.clientX, e.clientY, 'n', e)}
              onTouchStart={(e) => handleResizeInteractionStart(e.touches[0].clientX, e.touches[0].clientY, 'n', e)}
              title="Drag to resize height"
            />
            {/* South (bottom) */}
            <div
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-3 cursor-ns-resize widget-resize-handle border-2 border-blue-500 rounded-t-lg transition-all duration-200 hover:scale-110 z-10 ${
                theme === 'dark'
                  ? 'bg-blue-500/80 hover:bg-blue-400'
                  : 'bg-blue-600/80 hover:bg-blue-500'
              }`}
              onMouseDown={(e) => handleResizeInteractionStart(e.clientX, e.clientY, 's', e)}
              onTouchStart={(e) => handleResizeInteractionStart(e.touches[0].clientX, e.touches[0].clientY, 's', e)}
              title="Drag to resize height"
            />
            {/* East (right) */}
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-8 cursor-ew-resize widget-resize-handle border-2 border-blue-500 rounded-l-lg transition-all duration-200 hover:scale-110 z-10 ${
                theme === 'dark'
                  ? 'bg-blue-500/80 hover:bg-blue-400'
                  : 'bg-blue-600/80 hover:bg-blue-500'
              }`}
              onMouseDown={(e) => handleResizeInteractionStart(e.clientX, e.clientY, 'e', e)}
              onTouchStart={(e) => handleResizeInteractionStart(e.touches[0].clientX, e.touches[0].clientY, 'e', e)}
              title="Drag to resize width"
            />
            {/* West (left) */}
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-3 h-8 cursor-ew-resize widget-resize-handle border-2 border-blue-500 rounded-r-lg transition-all duration-200 hover:scale-110 z-10 ${
                theme === 'dark'
                  ? 'bg-blue-500/80 hover:bg-blue-400'
                  : 'bg-blue-600/80 hover:bg-blue-500'
              }`}
              onMouseDown={(e) => handleResizeInteractionStart(e.clientX, e.clientY, 'w', e)}
              onTouchStart={(e) => handleResizeInteractionStart(e.touches[0].clientX, e.touches[0].clientY, 'w', e)}
              title="Drag to resize width"
            />
          </>
        )}
        
        {/* Visual cross indicator during drag/resize */}
        {(isDragging || isResizing) && (
          <>
            {/* Cross at drag position (top-left corner) or widget center (during resize) */}
            {isDragging ? (
              <>
                {/* Horizontal line at drag position */}
                <div
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: dragPosition.x - 10,
                    top: dragPosition.y,
                    width: '20px',
                    height: '4px',
                    backgroundColor: 'rgb(59 130 246)',
                  }}
                />
                {/* Vertical line at drag position */}
                <div
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: dragPosition.x,
                    top: dragPosition.y - 10,
                    width: '4px',
                    height: '20px',
                    backgroundColor: 'rgb(59 130 246)',
                  }}
                />
              </>
            ) : (
              <>
                {/* Horizontal line at widget center */}
                <div
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: widget.x + widget.width / 2 - 10,
                    top: widget.y + widget.height / 2,
                    width: '20px',
                    height: '4px',
                    backgroundColor: 'rgb(59 130 246)',
                  }}
                />
                {/* Vertical line at widget center */}
                <div
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: widget.x + widget.width / 2,
                    top: widget.y + widget.height / 2 - 10,
                    width: '4px',
                    height: '20px',
                    backgroundColor: 'rgb(59 130 246)',
                  }}
                />
              </>
            )}
          </>
        )}
      </div>

      {isDeleteConfirmOpen && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000]">
            <div data-delete-modal="true" className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={24} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Удалить виджет
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Вы уверены, что хотите удалить этот виджет? Это действие нельзя отменить.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    onDelete(widget.id);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      <WidgetConfigModal
        widget={widget}
        open={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        onSave={(configData) => {
          // Save API key to OpenAI service for chatgpt widgets
          if (widget.type === 'chatgpt' && configData.apiKey) {
            openaiService.setApiKey(configData.apiKey);
          }
          onUpdate({ config: { ...widget.config, ...configData } });
        }}
      />
    </>
  );
}
