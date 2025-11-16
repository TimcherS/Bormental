import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, X, Maximize2, Keyboard } from 'lucide-react';
import { useCanvas } from '../contexts/CanvasContext';
import { useTheme } from '../contexts/ThemeContext';
import WidgetSelector from '../components/WidgetSelector';
import Widget from '../components/Widget';
import CanvasSwitcher from '../components/CanvasSwitcher';
import Portal from '../components/Portal';

const GRID_SIZE = 20; // Grid dot spacing

export default function CanvasPage() {
  const { theme, toggleTheme } = useTheme();
  const {
    activeCanvas,
    updateWidget,
    deleteWidget,
    addWidget,
    duplicateWidget,
    undo,
    redo,
    canUndo,
    canRedo,
    canvases,
    setActiveCanvasId,
    sidebarWidth,
    isSidebarCollapsed
  } = useCanvas();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth * 2, height: window.innerHeight * 2 });

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isWidgetSelectorOpen, setIsWidgetSelectorOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [isPlacingWidget, setIsPlacingWidget] = useState(null);
  const [placingPosition, setPlacingPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('error'); // error, success, info
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Snap to grid
  const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  // Toast notifications
  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    // Auto-hide after 3 seconds
    setTimeout(() => setToastMessage(null), 3000);
  };


  // Handle mouse wheel for zoom
  const handleWheel = (e) => {
    // Check if any modal or fullscreen is open
    const isModalOpen = document.body.hasAttribute('data-modal-open');
    const isFullscreenOpen = document.body.hasAttribute('data-fullscreen-widget-open');
    const isDeleteModalOpen = document.body.hasAttribute('data-delete-modal-open');
    
    // Don't handle zoom if any modal/fullscreen is open
    if (isModalOpen || isFullscreenOpen || isDeleteModalOpen) {
      return;
    }
    
    // Allow zoom with Ctrl+wheel or just wheel (when not over input/textarea)
    if (e.ctrlKey || (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.closest('input') && !e.target.closest('textarea'))) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(Math.max(prev * delta, 0.25), 3));
    }
  };

  // Handle pan with middle mouse button, right mouse button, or left click on empty canvas
  const handleMouseDown = (e) => {
    // Middle mouse button (button 1) or right mouse button (button 2) for panning
    if ((e.button === 1 || e.button === 2) && !isPlacingWidget) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (e.button === 0 && !isPlacingWidget) {
      // Left mouse button - check if clicking on empty canvas (not on a widget)
      const target = e.target;
      
      // Check if clicking directly on canvas background elements
      const isDirectCanvasClick = target === canvasRef.current ||
                                  target.tagName === 'svg' ||
                                  target.tagName === 'rect' ||
                                  target.tagName === 'circle' ||
                                  target.tagName === 'defs' ||
                                  target.tagName === 'pattern';
      
      // Check if clicking inside a widget (widgets have rounded-xl class and are absolute positioned)
      const isInsideWidget = target.closest('.absolute.rounded-xl') !== null;
      
      // Only pan if clicking directly on canvas background, not inside a widget
      if (isDirectCanvasClick && !isInsideWidget) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    } else if (e.button === 2 && isPlacingWidget) {
      // Prevent context menu during placement
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    // Always track current mouse position
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setMousePosition({ x: snapToGrid(x), y: snapToGrid(y) });

    if (isPanning) {
      e.preventDefault(); // Prevent default scrolling behavior
      // Calculate new pan position with bounds
      const newPanX = e.clientX - panStart.x;
      const newPanY = e.clientY - panStart.y;

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Limit canvas size to 2x2 screens
      const maxCanvasWidth = canvasSize.width;
      const maxCanvasHeight = canvasSize.height;

      // Calculate bounds - limit panning to 2x2 screen area
      const minPanX = -(maxCanvasWidth - viewportWidth) / zoom;
      const maxPanX = 0;
      const minPanY = -(maxCanvasHeight - viewportHeight) / zoom;
      const maxPanY = 0;

      const clampedPanX = Math.max(minPanX, Math.min(maxPanX, newPanX));
      const clampedPanY = Math.max(minPanY, Math.min(maxPanY, newPanY));

      setPan({
        x: clampedPanX,
        y: clampedPanY
      });
    }

    if (isPlacingWidget) {
      setPlacingPosition({ x: snapToGrid(x), y: snapToGrid(y) });
    }
  };

  const handleMouseUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (isPlacingWidget && (e.button === 0 || e.button === 2)) { // Place with left or right click
      e.preventDefault(); // Prevent context menu from appearing (right click)
      
      // Define widget dimensions based on type - vertically stretched by default
      let widgetDimensions = { width: 500, height: 700 }; // Default: vertically stretched (2x larger)
      
      // Note and ChatGPT widgets need more space for intensive work
      if (isPlacingWidget === 'note' || isPlacingWidget === 'chatgpt') {
        widgetDimensions = { width: 700, height: 900 };
      }
      // Chart widgets also need more space
      else if (isPlacingWidget === 'chart') {
        widgetDimensions = { width: 700, height: 900 };
      }
      
      const widget = {
        type: isPlacingWidget,
        x: placingPosition.x - widgetDimensions.width / 2, // Center the widget on the placement position
        y: placingPosition.y - widgetDimensions.height / 2,
        width: widgetDimensions.width,
        height: widgetDimensions.height,
        config: {}
      };

      addWidget(widget);
      setIsPlacingWidget(null);
    }
  };

  // Prevent context menu
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventDefault);
    return () => document.removeEventListener('contextmenu', preventDefault);
  }, []);

  // Update canvas size on window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({ width: window.innerWidth * 2, height: window.innerHeight * 2 });
    };
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize(); // Initial size
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('You are back online', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('You are offline. Some features may be unavailable.', 'error');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle ESC key to cancel placement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPlacingWidget) {
        setIsPlacingWidget(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlacingWidget]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Cmd/Ctrl + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) &&
          (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Delete: Remove selected widget
      if (e.key === 'Delete' && selectedWidget) {
        e.preventDefault();
        deleteWidget(selectedWidget);
        return;
      }

      // Cmd/Ctrl + D: Duplicate selected widget
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedWidget) {
        e.preventDefault();
        duplicateWidget(selectedWidget);
        return;
      }

      // Cmd/Ctrl + S: Save (prevent default to avoid browser save dialog)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Auto-save is handled by localStorage useEffect
        return;
      }

      // Cmd/Ctrl + 1-9: Switch canvases
      if ((e.ctrlKey || e.metaKey) && /[1-9]/.test(e.key)) {
        e.preventDefault();
        const canvasIndex = parseInt(e.key) - 1;
        if (canvases[canvasIndex]) {
          setActiveCanvasId(canvases[canvasIndex].id);
        }
        return;
      }

      // Cmd/Ctrl + /: Show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlacingWidget,
    selectedWidget,
    canUndo,
    canRedo,
    undo,
    redo,
    deleteWidget,
    duplicateWidget,
    canvases,
    setActiveCanvasId,
    setShowKeyboardShortcuts
  ]);

  if (!activeCanvas) {
    navigate('/canvas-select');
    return null;
  }

  const currentDateTime = new Date().toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      {/* Fixed UI Elements - Rendered via Portal to document.body to ensure they're truly fixed to viewport */}
      {/* Canvas Switcher */}
      <Portal>
        <CanvasSwitcher />
      </Portal>

      {/* Top-right controls - Fixed to viewport */}
      <Portal>
        <div className="fixed top-4 right-4 flex items-center gap-3 z-50" style={{ position: 'fixed' }}>
        <div className={`px-4 py-2 rounded-xl backdrop-blur-md transition-smooth ${
          theme === 'dark'
            ? 'bg-black/50 hover:bg-gray-900/50'
            : 'bg-white/50 hover:bg-gray-50/80'
        }`}>
          <span className="text-sm font-medium">{currentDateTime}</span>
        </div>

        {!isOnline && (
          <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs font-semibold shadow-lg">
            Offline
          </div>
        )}
        
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg border backdrop-blur-md transition-smooth btn-hover-lift ${
            theme === 'dark'
              ? 'bg-black/50 border-gray-700/50 hover:bg-gray-900/50'
              : 'bg-white/50 border-gray-300/50 hover:bg-gray-50/80'
          }`}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button
          onClick={() => navigate('/canvas-select')}
          className={`p-2 rounded-lg border backdrop-blur-md transition-smooth btn-hover-lift ${
            theme === 'dark'
              ? 'bg-black/50 border-gray-700/50 hover:bg-gray-900/50'
              : 'bg-white/50 border-gray-300/50 hover:bg-gray-50/80'
          }`}
          aria-label="Settings"
          title="Canvases"
        >
          <Settings className="w-5 h-5" />
        </button>
        </div>
      </Portal>

      {/* Zoom controls - Centered vertically */}
      <Portal>
        <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-50" style={{ position: 'fixed' }}>
        <button
          onClick={() => setZoom(prev => {
            // Zoom to next nice level: 25%, 50%, 75%, 100%, 125%, 150%, 200%, 300%
            const levels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];
            const currentIndex = levels.findIndex(level => level > prev);
            if (currentIndex === -1) return 3; // Max zoom
            return levels[currentIndex];
          })}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all btn-hover-scale btn-hover-lift ${
            theme === 'dark'
              ? 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white'
              : 'bg-white/80 hover:bg-white text-gray-900'
          }`}
          title="Zoom in"
        >
          +
        </button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all backdrop-blur-md ${
          theme === 'dark'
            ? 'bg-gray-900/80 text-gray-300'
            : 'bg-white/80 text-gray-900'
        }`}>
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(prev => {
            // Zoom to previous nice level: 25%, 50%, 75%, 100%, 125%, 150%, 200%, 300%
            const levels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];
            const currentIndex = levels.findLastIndex(level => level < prev);
            if (currentIndex === -1) return 0.25; // Min zoom
            return levels[currentIndex];
          })}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all btn-hover-scale btn-hover-lift ${
            theme === 'dark'
              ? 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white'
              : 'bg-white/80 hover:bg-white text-gray-900'
          }`}
          title="Zoom out"
        >
          −
        </button>
        </div>
      </Portal>

      {/* Minimap - Bottom right corner */}
      <Portal>
        <div className="fixed bottom-6 right-6 z-50" style={{ position: 'fixed' }}>
        <div className={`rounded-lg border shadow-xl backdrop-blur-md overflow-hidden ${
          theme === 'dark'
            ? 'bg-gray-900/90 border-gray-700/60'
            : 'bg-white/90 border-gray-200/60'
        }`} style={{ width: '200px', height: '150px' }}>
          {/* Minimap content */}
          <div className="relative" style={{ width: '100%', height: '100%' }}>
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0"
            >
              {/* Background */}
              <rect
                width={canvasSize.width}
                height={canvasSize.height}
                fill={theme === 'dark' ? '#1f2937' : '#f9fafb'}
              />
              
              {/* Grid pattern for minimap */}
              <defs>
                <pattern
                  id="minimap-grid"
                  x="0"
                  y="0"
                  width={GRID_SIZE * 5}
                  height={GRID_SIZE * 5}
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="0.5" fill={theme === 'dark' ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.2)'} />
                </pattern>
              </defs>
              <rect width={canvasSize.width} height={canvasSize.height} fill="url(#minimap-grid)" />
              
              {/* Widgets on minimap */}
              {activeCanvas.widgets.map((widget) => (
                <rect
                  key={widget.id}
                  x={widget.x}
                  y={widget.y}
                  width={widget.width}
                  height={widget.height}
                  fill={selectedWidget === widget.id ? '#3b82f6' : (theme === 'dark' ? '#4b5563' : '#9ca3af')}
                  stroke={selectedWidget === widget.id ? '#60a5fa' : (theme === 'dark' ? '#6b7280' : '#6b7280')}
                  strokeWidth="1"
                  opacity={selectedWidget === widget.id ? 0.8 : 0.5}
                  rx="2"
                />
              ))}
              
              {/* Viewport indicator - Thicker and more visible */}
              <rect
                x={-pan.x / zoom}
                y={-pan.y / zoom}
                width={window.innerWidth / zoom}
                height={window.innerHeight / zoom}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="6"
                strokeDasharray="8 4"
                opacity="0.9"
              />
            </svg>
            
            {/* Click to pan - overlay */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const svg = e.currentTarget.querySelector('svg');
                if (!svg) return;
                
                const svgRect = svg.getBoundingClientRect();
                const x = ((e.clientX - svgRect.left) / svgRect.width) * canvasSize.width;
                const y = ((e.clientY - svgRect.top) / svgRect.height) * canvasSize.height;
                
                // Center viewport on clicked position
                const newPanX = Math.max(
                  -(canvasSize.width - window.innerWidth) / zoom,
                  Math.min(0, -(x - window.innerWidth / (2 * zoom)))
                );
                const newPanY = Math.max(
                  -(canvasSize.height - window.innerHeight) / zoom,
                  Math.min(0, -(y - window.innerHeight / (2 * zoom)))
                );
                
                setPan({ x: newPanX, y: newPanY });
              }}
              title="Click to center viewport"
            />
          </div>
        </div>
        </div>
      </Portal>

      {/* Widget Selector Button - Enhanced */}
      <Portal>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50" style={{ position: 'fixed' }}>
        <button
          onMouseDown={(e) => {
            // Capture mouse position when clicking to open selector
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / zoom;
            const y = (e.clientY - rect.top) / zoom;
            setMousePosition({ x: snapToGrid(x), y: snapToGrid(y) });
          }}
          onClick={() => setIsWidgetSelectorOpen(!isWidgetSelectorOpen)}
          className={`px-8 py-4 rounded-2xl border flex items-center gap-3 font-semibold text-lg transition-all btn-hover-lift shadow-xl-modern ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-900/90 to-purple-900/90 border-blue-700/70 hover:from-blue-800 hover:to-purple-800 text-white shadow-glow-blue'
              : 'bg-gradient-to-r from-blue-50/90 to-purple-50/90 border-blue-200/70 hover:from-blue-100 hover:to-purple-100 text-gray-900'
          }`}
        >
          <Plus className="w-6 h-6" />
          Add Indicator
        </button>
        </div>
      </Portal>

      {/* Main Canvas Container */}
      <div 
        className={`relative w-screen h-screen overflow-hidden ${
          theme === 'dark' ? 'bg-black' : 'bg-white'
        }`}
      >
        {/* Main Canvas - Full width, sidebar overlays it */}
        <div
          ref={canvasRef}
          className={`absolute ${
            isPanning ? 'cursor-grabbing' : isPlacingWidget ? 'cursor-crosshair' : 'cursor-default'
          }`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            left: 0,
            top: 0,
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
        {/* Dotted Background Grid */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
          style={{ minWidth: '100vw', minHeight: '100vh' }}
        >
          <defs>
            <pattern
              id="dot-pattern"
              x="0"
              y="0"
              width={GRID_SIZE}
              height={GRID_SIZE}
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="rgba(156, 163, 175, 0.2)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
        {/* Render widgets */}
        {activeCanvas.widgets.map((widget) => (
          <Widget
            key={widget.id}
            widget={widget}
            isSelected={selectedWidget === widget.id}
            onSelect={() => setSelectedWidget(widget.id)}
            onUpdate={(updates) => updateWidget(widget.id, updates)}
            onDelete={() => deleteWidget(widget.id)}
            gridSize={GRID_SIZE}
            pan={pan}
            zoom={zoom}
          />
        ))}

        {/* Placing widget preview - Cross at placement position */}
        {isPlacingWidget && (
          <>
            {/* Widget shape contour */}
            <div
              className="absolute pointer-events-none rounded-xl border-2 border-dashed border-blue-400"
              style={{
                left: placingPosition.x - ((isPlacingWidget === 'note' || isPlacingWidget === 'chatgpt' || isPlacingWidget === 'chart') ? 350 : 250),
                top: placingPosition.y - ((isPlacingWidget === 'note' || isPlacingWidget === 'chatgpt' || isPlacingWidget === 'chart') ? 450 : 350),
                width: (isPlacingWidget === 'note' || isPlacingWidget === 'chatgpt' || isPlacingWidget === 'chart') ? 700 : 500,
                height: (isPlacingWidget === 'note' || isPlacingWidget === 'chatgpt' || isPlacingWidget === 'chart') ? 900 : 700,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                zIndex: 5
              }}
            />
            {/* Cross at placement position (centered) */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: placingPosition.x - 10,
                top: placingPosition.y - 10,
                width: 20,
                height: 4,
                backgroundColor: 'rgb(59 130 246)',
                zIndex: 10
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                left: placingPosition.x - 10,
                top: placingPosition.y - 10,
                width: 4,
                height: 20,
                backgroundColor: 'rgb(59 130 246)',
                zIndex: 10
              }}
            />
          </>
        )}
      </div>

      {/* Widget Selector Menu */}
      {isWidgetSelectorOpen && (
        <WidgetSelector
          onSelect={(type) => {
            setIsPlacingWidget(type);
            setPlacingPosition(mousePosition); // Initialize with captured mouse position
            setIsWidgetSelectorOpen(false);
          }}
          onClose={() => setIsWidgetSelectorOpen(false)}
        />
      )}

      {/* Instructions overlay when placing - Fixed to viewport center */}
      {isPlacingWidget && (
        <Portal>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50" style={{ position: 'fixed' }}>
          <div className={`px-6 py-3 rounded-lg border ${
            theme === 'dark'
              ? 'bg-black/90 border-gray-800'
              : 'bg-white/90 border-gray-200'
          } backdrop-blur-sm`}>
            <p className="text-sm font-medium">
              Click to place • Press ESC to cancel
            </p>
          </div>
          </div>
        </Portal>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <Portal>
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              style={{ position: 'fixed' }}
              onClick={() => setShowKeyboardShortcuts(false)}
            />
            {/* Modal */}
            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-lg w-full mx-4 ${
            theme === 'dark' ? 'bg-black' : 'bg-white'
          } border ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          } rounded-2xl shadow-2xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className={`p-1 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Undo</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+Z
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Redo</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+Y
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Redo (alternative)</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+Shift+Z
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Delete selected widget</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Delete
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicate selected widget</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+D
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Save canvas</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+S
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Switch to canvas 1-9</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+1-9
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Show shortcuts help</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+/
                    </kbd>
                  </div>
                </div>

                <div className="border-t pt-3 mt-4 text-xs opacity-75">
                  <p>• Shortcuts work when not typing in text fields</p>
                  <p>• Press ESC to cancel widget placement</p>
                </div>
              </div>
            </div>
          </div>
          </>
        </Portal>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Portal>
          <div className="fixed bottom-4 right-4 z-50" style={{ position: 'fixed' }}>
          <div className={`px-4 py-3 rounded-lg border shadow-lg max-w-sm ${
            toastType === 'error'
              ? 'bg-red-500 text-white border-red-600'
              : toastType === 'success'
              ? 'bg-green-500 text-white border-green-600'
              : 'bg-blue-500 text-white border-blue-600'
          }`}>
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
          </div>
        </Portal>
      )}
      </div>
    </>
  );
}
