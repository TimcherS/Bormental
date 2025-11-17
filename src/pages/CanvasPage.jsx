import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, X, Maximize2, Keyboard } from 'lucide-react';
import { useCanvas } from '../contexts/CanvasContext';
import { useTheme } from '../contexts/ThemeContext';
import WidgetSelector from '../components/WidgetSelector';
import Widget from '../components/Widget';
import CanvasSwitcher from '../components/CanvasSwitcher';
import Portal from '../components/Portal';
import WidgetConnection from '../components/WidgetConnection';

const GRID_SIZE = 20; // Grid dot spacing
const CANVAS_SCALE_FACTOR = 4;
const MIN_CANVAS_WIDTH = 4000;
const MIN_CANVAS_HEIGHT = 3000;
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];

const clampZoomValue = (value) => {
  const numericValue = typeof value === 'number' ? value : 1;
  return Math.min(Math.max(numericValue, ZOOM_LEVELS[0]), ZOOM_LEVELS[ZOOM_LEVELS.length - 1]);
};

const calculatePanBounds = (canvasSize, targetZoom) => {
  if (typeof window === 'undefined' || !canvasSize) {
    return { minPanX: 0, maxPanX: 0, minPanY: 0, maxPanY: 0 };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const contentWidth = canvasSize.width * targetZoom;
  const contentHeight = canvasSize.height * targetZoom;

  const horizontalSpace = viewportWidth - contentWidth;
  const verticalSpace = viewportHeight - contentHeight;

  const minPanX = horizontalSpace >= 0 ? horizontalSpace / 2 : horizontalSpace;
  const maxPanX = horizontalSpace >= 0 ? horizontalSpace / 2 : 0;
  const minPanY = verticalSpace >= 0 ? verticalSpace / 2 : verticalSpace;
  const maxPanY = verticalSpace >= 0 ? verticalSpace / 2 : 0;

  return { minPanX, maxPanX, minPanY, maxPanY };
};

const clampPanToBounds = (nextPan, canvasSize, targetZoom) => {
  const { minPanX, maxPanX, minPanY, maxPanY } = calculatePanBounds(canvasSize, targetZoom);
  return {
    x: Math.min(Math.max(nextPan.x, minPanX), maxPanX),
    y: Math.min(Math.max(nextPan.y, minPanY), maxPanY)
  };
};

const getInitialCanvasSize = () => {
  if (typeof window === 'undefined') {
    return { width: MIN_CANVAS_WIDTH, height: MIN_CANVAS_HEIGHT };
  }

  return {
    width: Math.max(window.innerWidth * CANVAS_SCALE_FACTOR, MIN_CANVAS_WIDTH),
    height: Math.max(window.innerHeight * CANVAS_SCALE_FACTOR, MIN_CANVAS_HEIGHT)
  };
};

export default function CanvasPage() {
  const { theme, toggleTheme } = useTheme();
  const {
    activeCanvas,
    updateWidget,
    deleteWidget,
    addWidget,
    duplicateWidget,
    addConnection,
    removeConnection,
    hasConnection,
    undo,
    redo,
    canUndo,
    canRedo,
    canvases,
    setActiveCanvasId,
    sidebarWidth,
    isSidebarCollapsed,
    getCanvasViewState,
    updateCanvasViewState
  } = useCanvas();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const hasAutoCenteredView = useRef(false);
  const hasSyncedViewState = useRef(false);

  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState(getInitialCanvasSize);

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
  
  // Connection mode state
  const [isConnectionMode, setIsConnectionMode] = useState(false);
  const [connectionSourceId, setConnectionSourceId] = useState(null);
  const [connectionCursorScreenPos, setConnectionCursorScreenPos] = useState({ x: 0, y: 0 }); // Store in SCREEN coords
  const [hoveredWidgetId, setHoveredWidgetId] = useState(null);

  // Snap to grid
  const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

    // Check if AI workspace widget exists
    const getAIWorkspaceWidget = () => {
      return activeCanvas?.widgets.find(w => w.type === 'chatgpt');
    };

    // Start connection mode
    const handleStartConnection = (sourceWidgetId) => {
      const aiWorkspace = getAIWorkspaceWidget();
      if (!aiWorkspace) {
        showToast('Сначала добавьте виджет ИИ-помощника для создания связей', 'error');
        return;
      }

      // Check if already connected
      if (hasConnection(sourceWidgetId, aiWorkspace.id)) {
        showToast('Этот виджет уже связан с ИИ-помощником', 'info');
        return;
      }

      setIsConnectionMode(true);
      setConnectionSourceId(sourceWidgetId);
    };

  // Exit connection mode
  const exitConnectionMode = () => {
    setIsConnectionMode(false);
    setConnectionSourceId(null);
    setHoveredWidgetId(null);
  };

  // Toast notifications
  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    // Auto-hide after 3 seconds
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getPanBounds = useCallback((targetZoom) => {
    const effectiveZoom = typeof targetZoom === 'number' ? targetZoom : zoom;
    return calculatePanBounds(canvasSize, effectiveZoom);
  }, [canvasSize, zoom]);

  const clampPan = useCallback((nextPan, targetZoom = zoom) => {
    const effectiveZoom = typeof targetZoom === 'number' ? targetZoom : zoom;
    return clampPanToBounds(nextPan, canvasSize, effectiveZoom);
  }, [canvasSize, zoom]);

  const applyZoomLevel = useCallback((nextZoom) => {
    setPan(prev => clampPan(prev, nextZoom));
    setZoom(nextZoom);
  }, [clampPan]);

  useEffect(() => {
    if (!hasAutoCenteredView.current) {
      const { minPanX, maxPanX, minPanY, maxPanY } = getPanBounds();
      setPan(() => clampPan({
        x: (minPanX + maxPanX) / 2,
        y: (minPanY + maxPanY) / 2
      }));
      hasAutoCenteredView.current = true;
      hasSyncedViewState.current = true;
    }
  }, [clampPan, getPanBounds]);

  useEffect(() => {
    setPan(prev => clampPan(prev));
  }, [clampPan]);

  useEffect(() => {
    if (!activeCanvas) {
      return;
    }

    const savedState = getCanvasViewState(activeCanvas.id);
    if (savedState) {
      const clampedZoom = clampZoomValue(savedState.zoom);
      const clampedPan = clampPanToBounds(savedState.pan ?? { x: 0, y: 0 }, canvasSize, clampedZoom);
      setZoom(clampedZoom);
      setPan(clampedPan);
      hasAutoCenteredView.current = true;
      hasSyncedViewState.current = true;
    } else {
      const fallbackZoom = 1;
      const fallbackPan = clampPanToBounds({ x: 0, y: 0 }, canvasSize, fallbackZoom);
      setZoom(fallbackZoom);
      setPan(fallbackPan);
      hasAutoCenteredView.current = false;
      hasSyncedViewState.current = false;
    }
  }, [activeCanvas?.id, canvasSize, getCanvasViewState]);

  useEffect(() => {
    if (!activeCanvas || !hasSyncedViewState.current) {
      return;
    }

    updateCanvasViewState(activeCanvas.id, { pan, zoom });
  }, [activeCanvas?.id, pan, zoom, updateCanvasViewState]);

  useEffect(() => {
    const stopPanning = () => setIsPanning(false);
    const handleMouseOut = (event) => {
      if (!event.relatedTarget) {
        stopPanning();
      }
    };

    window.addEventListener('mouseup', stopPanning);
    window.addEventListener('blur', stopPanning);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mouseup', stopPanning);
      window.removeEventListener('blur', stopPanning);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);


  // Handle mouse wheel for zoom
  const handleWheel = (e) => {
    // Check if any modal or fullscreen is open
    const isModalOpen = document.body.hasAttribute('data-modal-open');
    const isFullscreenOpen = document.body.hasAttribute('data-fullscreen-widget-open');
    const isDeleteModalOpen = document.body.hasAttribute('data-delete-modal-open');
    const isCalendarWheelLockActive = !e.ctrlKey && !e.metaKey && e.target.closest('[data-canvas-wheel-lock="true"]');
    
    // Don't handle zoom if any modal/fullscreen is open
    if (isModalOpen || isFullscreenOpen || isDeleteModalOpen) {
      return;
    }

    if (isCalendarWheelLockActive) {
      return;
    }
    
    // Allow zoom with Ctrl+wheel or just wheel (when not over input/textarea)
    if (e.ctrlKey || (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.closest('input') && !e.target.closest('textarea'))) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      
      // Get mouse position relative to canvas
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        return;
      }
      const rect = canvasElement.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate point in canvas space before zoom
      const pointBeforeZoomX = (mouseX - pan.x) / zoom;
      const pointBeforeZoomY = (mouseY - pan.y) / zoom;
      
      // Apply zoom
      const newZoom = clampZoomValue(zoom * delta);
      
      // Calculate point in canvas space after zoom
      const pointAfterZoomX = (mouseX - pan.x) / newZoom;
      const pointAfterZoomY = (mouseY - pan.y) / newZoom;
      
      // Calculate pan adjustment to keep mouse point stable
      const panAdjustX = (pointAfterZoomX - pointBeforeZoomX) * newZoom;
      const panAdjustY = (pointAfterZoomY - pointBeforeZoomY) * newZoom;
      
      const adjustedPan = clampPan({
        x: pan.x + panAdjustX,
        y: pan.y + panAdjustY
      }, newZoom);

      setZoom(newZoom);
      setPan(adjustedPan);
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
        // Remove widget focus when clicking on canvas background
        setSelectedWidget(null);
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

    if (isPanning && e.buttons === 0) {
      setIsPanning(false);
      return;
    }

    // Connection mode cursor tracking - store SCREEN coordinates
    if (isConnectionMode) {
      setConnectionCursorScreenPos({ x: e.clientX, y: e.clientY });
      
      // Auto-pan logic during connection mode - INSTANT and smooth, no wiggling needed
      const edgeThreshold = 100; // pixels from edge to start panning
      const maxPanSpeed = 15; // Maximum pan speed per frame
      const minPanSpeed = 3; // Minimum speed to avoid stopping
      
      const clientX = e.clientX;
      const clientY = e.clientY;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let panDeltaX = 0;
      let panDeltaY = 0;
      
      // Calculate pan delta with smooth acceleration
      if (clientX < edgeThreshold) {
        const distanceFromEdge = edgeThreshold - clientX;
        const normalizedDistance = Math.min(distanceFromEdge / edgeThreshold, 1);
        // Use exponential curve for better feel
        panDeltaX = minPanSpeed + (normalizedDistance ** 1.5) * (maxPanSpeed - minPanSpeed);
      } else if (clientX > viewportWidth - edgeThreshold) {
        const distanceFromEdge = clientX - (viewportWidth - edgeThreshold);
        const normalizedDistance = Math.min(distanceFromEdge / edgeThreshold, 1);
        panDeltaX = -(minPanSpeed + (normalizedDistance ** 1.5) * (maxPanSpeed - minPanSpeed));
      }
      
      if (clientY < edgeThreshold) {
        const distanceFromEdge = edgeThreshold - clientY;
        const normalizedDistance = Math.min(distanceFromEdge / edgeThreshold, 1);
        panDeltaY = minPanSpeed + (normalizedDistance ** 1.5) * (maxPanSpeed - minPanSpeed);
      } else if (clientY > viewportHeight - edgeThreshold) {
        const distanceFromEdge = clientY - (viewportHeight - edgeThreshold);
        const normalizedDistance = Math.min(distanceFromEdge / edgeThreshold, 1);
        panDeltaY = -(minPanSpeed + (normalizedDistance ** 1.5) * (maxPanSpeed - minPanSpeed));
      }
      
      // Apply auto-pan if there's any movement
      if (panDeltaX !== 0 || panDeltaY !== 0) {
        setPan(prevPan => clampPan({
          x: prevPan.x + panDeltaX,
          y: prevPan.y + panDeltaY
        }));
      }
      
      // Check if hovering over AI workspace
      const aiWorkspace = getAIWorkspaceWidget();
      if (aiWorkspace) {
        const isHovering = 
          x >= aiWorkspace.x &&
          x <= aiWorkspace.x + aiWorkspace.width &&
          y >= aiWorkspace.y &&
          y <= aiWorkspace.y + aiWorkspace.height;
        
        setHoveredWidgetId(isHovering ? aiWorkspace.id : null);
      }
      
      return; // Don't process panning in connection mode
    }

    if (isPanning) {
      e.preventDefault(); // Prevent default scrolling behavior
      // Calculate new pan position with bounds
      const newPanX = e.clientX - panStart.x;
      const newPanY = e.clientY - panStart.y;

      setPan(clampPan({
        x: newPanX,
        y: newPanY
      }));
    }

    if (isPlacingWidget) {
      setPlacingPosition({ x: snapToGrid(x), y: snapToGrid(y) });
    }
  };

  const handleMouseUp = (e) => {
    // Handle connection mode clicks
    if (isConnectionMode) {
      if (e.button === 0) { // Left click - establish connection
        const aiWorkspace = getAIWorkspaceWidget();
        if (hoveredWidgetId && aiWorkspace && hoveredWidgetId === aiWorkspace.id) {
          addConnection(connectionSourceId, aiWorkspace.id);
          showToast('Связь установлена!', 'success');
          exitConnectionMode();
        }
      } else if (e.button === 2) { // Right click - cancel
        exitConnectionMode();
        showToast('Связь отменена', 'info');
      }
      return;
    }
    
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
      // News widget needs vertical space for articles
      else if (isPlacingWidget === 'news') {
        widgetDimensions = { width: 500, height: 800 };
      }
      
      // Set default config based on widget type
      let defaultConfig = {};
      if (isPlacingWidget === 'news') {
        defaultConfig = {
          themes: [],
          agencies: ['all'],
          configured: false
        };
      }
      
      const widget = {
        type: isPlacingWidget,
        x: placingPosition.x - widgetDimensions.width / 2, // Center the widget on the placement position
        y: placingPosition.y - widgetDimensions.height / 2,
        width: widgetDimensions.width,
        height: widgetDimensions.height,
        config: defaultConfig
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
      setCanvasSize(getInitialCanvasSize());
    };
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize(); // Initial size
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Снова в сети', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Вы не в сети. Некоторые функции могут быть недоступны.', 'error');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle ESC key to cancel placement or connection mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isPlacingWidget) {
          setIsPlacingWidget(null);
        } else if (isConnectionMode) {
          exitConnectionMode();
          showToast('Действие отменено', 'info');
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlacingWidget, isConnectionMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Arrow keys: Pan canvas
      const PAN_SPEED = 50; // pixels to pan per key press
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setPan(prevPan => {
          let newPan = { ...prevPan };
          if (e.key === 'ArrowUp') newPan.y += PAN_SPEED;
          if (e.key === 'ArrowDown') newPan.y -= PAN_SPEED;
          if (e.key === 'ArrowLeft') newPan.x += PAN_SPEED;
          if (e.key === 'ArrowRight') newPan.x -= PAN_SPEED;
          return clampPan(newPan);
        });
        return;
      }

      // Cmd/Ctrl + Z: Отменить
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Cmd/Ctrl + Y или Cmd/Ctrl + Shift + Z: Повторить
      if ((e.ctrlKey || e.metaKey) &&
          (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Delete: Удалить выбранный виджет
      if (e.key === 'Delete' && selectedWidget) {
        e.preventDefault();
        deleteWidget(selectedWidget);
        return;
      }

      // Cmd/Ctrl + D: Дублировать выбранный виджет
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedWidget) {
        e.preventDefault();
        duplicateWidget(selectedWidget);
        return;
      }

      // Cmd/Ctrl + S: Сохранить (предотвратить диалог сохранения браузера)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Автосохранение обрабатывается в useEffect localStorage
        return;
      }

      // Cmd/Ctrl + 1-9: Переключить холсты
      if ((e.ctrlKey || e.metaKey) && /[1-9]/.test(e.key)) {
        e.preventDefault();
        const canvasIndex = parseInt(e.key) - 1;
        if (canvases[canvasIndex]) {
          setActiveCanvasId(canvases[canvasIndex].id);
        }
        return;
      }

      // Cmd/Ctrl + /: Показать горячие клавиши
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
    setShowKeyboardShortcuts,
    clampPan
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
            Офлайн
          </div>
        )}
        
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg border backdrop-blur-md transition-smooth btn-hover-lift ${
            theme === 'dark'
              ? 'bg-black/50 border-gray-700/50 hover:bg-gray-900/50'
              : 'bg-white/50 border-gray-300/50 hover:bg-gray-50/80'
          }`}
          aria-label="Переключить тему"
          title="Переключить тему"
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
          aria-label="Холсты"
          title="Холсты"
        >
          <Settings className="w-5 h-5" />
        </button>
        </div>
      </Portal>

      {/* Zoom controls - Centered vertically */}
      <Portal>
        <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-50" style={{ position: 'fixed' }}>
        <button
          onClick={() => {
            const nextZoom = ZOOM_LEVELS.find(level => level > zoom) ?? ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
            if (nextZoom === zoom) return;
            applyZoomLevel(nextZoom);
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all btn-hover-scale btn-hover-lift ${
            theme === 'dark'
              ? 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white'
              : 'bg-white/80 hover:bg-white text-gray-900'
          }`}
          title="Увеличить"
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
          onClick={() => {
            const previousLevels = [...ZOOM_LEVELS].reverse();
            const nextZoom = previousLevels.find(level => level < zoom) ?? ZOOM_LEVELS[0];
            if (nextZoom === zoom) return;
            applyZoomLevel(nextZoom);
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all btn-hover-scale btn-hover-lift ${
            theme === 'dark'
              ? 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white'
              : 'bg-white/80 hover:bg-white text-gray-900'
          }`}
          title="Уменьшить"
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
              
              {/* Viewport indicator - Thicker and more visible - Now draggable */}
              <rect
                x={-pan.x / zoom}
                y={-pan.y / zoom}
                width={window.innerWidth / zoom}
                height={window.innerHeight / zoom}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth="6"
                strokeDasharray="8 4"
                opacity="0.9"
                style={{ pointerEvents: 'all', cursor: 'move' }}
              />
            </svg>
            
            {/* Click to pan - overlay with viewport dragging */}
            <div
              className="absolute inset-0 cursor-pointer hover:bg-blue-500/5 transition-colors"
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                
                // Calculate viewport position in minimap coordinates
                const viewportX = (-pan.x / zoom) * (rect.width / canvasSize.width);
                const viewportY = (-pan.y / zoom) * (rect.height / canvasSize.height);
                const viewportWidth = (window.innerWidth / zoom) * (rect.width / canvasSize.width);
                const viewportHeight = (window.innerHeight / zoom) * (rect.height / canvasSize.height);
                
                // Check if clicking inside viewport rectangle for dragging
                const isInsideViewport = 
                  clickX >= viewportX && 
                  clickX <= viewportX + viewportWidth &&
                  clickY >= viewportY && 
                  clickY <= viewportY + viewportHeight;
                
                if (isInsideViewport) {
                  // Drag mode
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startPan = { ...pan };
                  
                  const handleMouseMove = (moveEvent) => {
                    const deltaX = moveEvent.clientX - startX;
                    const deltaY = moveEvent.clientY - startY;
                    
                    // Convert minimap movement to canvas pan
                    const minimapScale = canvasSize.width / rect.width;
                    const newPanX = startPan.x - (deltaX * minimapScale);
                    const newPanY = startPan.y - (deltaY * minimapScale);

                  setPan(clampPan({
                    x: newPanX,
                    y: newPanY
                  }));
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                } else {
                  // Click to jump mode
                  const x = (clickX / rect.width) * canvasSize.width;
                  const y = (clickY / rect.height) * canvasSize.height;
                  
                  // Center viewport on clicked position with proper zoom accounting
                  const targetPan = clampPan({
                    x: window.innerWidth / 2 - x * zoom,
                    y: window.innerHeight / 2 - y * zoom
                  });
                  
                  setPan(targetPan);
                }
              }}
              title="Кликните для навигации или перетащите индикатор для панорамирования"
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
          Добавить виджет
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
            isPanning ? 'cursor-grabbing' : isPlacingWidget ? 'cursor-crosshair' : isConnectionMode ? 'cursor-crosshair' : 'cursor-default'
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
          width={canvasSize.width}
          height={canvasSize.height}
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
              <circle cx="1" cy="1" r="1.5" fill={theme === 'dark' ? 'rgba(156, 163, 175, 0.4)' : 'rgba(100, 116, 139, 0.3)'} />
            </pattern>
          </defs>
          <rect width={canvasSize.width} height={canvasSize.height} fill="url(#dot-pattern)" />
        </svg>
        
        {/* Render connections (cables) - under all widgets */}
        {(activeCanvas.connections || []).map((connection) => {
          const sourceWidget = activeCanvas.widgets.find(w => w.id === connection.sourceId);
          const targetWidget = activeCanvas.widgets.find(w => w.id === connection.targetId);
          return (
            <WidgetConnection
              key={connection.id}
              connection={connection}
              sourceWidget={sourceWidget}
              targetWidget={targetWidget}
              onRemove={removeConnection}
              zoom={zoom}
              pan={pan}
            />
          );
        })}
        
        {/* Connection mode: Cable from source to cursor - IN CANVAS COORDINATES */}
        {isConnectionMode && connectionSourceId && (() => {
          const sourceWidget = activeCanvas.widgets.find(w => w.id === connectionSourceId);
          if (!sourceWidget || !canvasRef.current) return null;
          
          // Convert screen cursor position to canvas coordinates
          const rect = canvasRef.current.getBoundingClientRect();
          const cursorCanvasX = (connectionCursorScreenPos.x - rect.left) / zoom;
          const cursorCanvasY = (connectionCursorScreenPos.y - rect.top) / zoom;
          
          // Source widget center
          const sourceCenterX = sourceWidget.x + sourceWidget.width / 2;
          const sourceCenterY = sourceWidget.y + sourceWidget.height / 2;
          
          const dx = cursorCanvasX - sourceCenterX;
          const dy = cursorCanvasY - sourceCenterY;
          
          // Determine optimal exit point from source widget
          let sourceX, sourceY;
          
          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal dominant
            if (dx > 0) {
              sourceX = sourceWidget.x + sourceWidget.width;
              sourceY = sourceWidget.y + sourceWidget.height / 2;
            } else {
              sourceX = sourceWidget.x;
              sourceY = sourceWidget.y + sourceWidget.height / 2;
            }
          } else {
            // Vertical dominant
            if (dy > 0) {
              sourceX = sourceWidget.x + sourceWidget.width / 2;
              sourceY = sourceWidget.y + sourceWidget.height;
            } else {
              sourceX = sourceWidget.x + sourceWidget.width / 2;
              sourceY = sourceWidget.y;
            }
          }
          
          // STRAIGHT line from source to cursor (both in canvas coordinates)
          const path = `M ${sourceX} ${sourceY} L ${cursorCanvasX} ${cursorCanvasY}`;
          
          return (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{
                width: '100%',
                height: '100%',
                zIndex: 5,
              }}
            >
              <defs>
                <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>
              <path
                d={path}
                stroke="url(#connection-gradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8 4"
                opacity="0.8"
              />
              <circle
                cx={sourceX}
                cy={sourceY}
                r="6"
                fill="#3b82f6"
                stroke={theme === 'dark' ? '#1f2937' : '#ffffff'}
                strokeWidth="2"
              />
              <circle
                cx={cursorCanvasX}
                cy={cursorCanvasY}
                r="6"
                fill="#10b981"
                stroke={theme === 'dark' ? '#1f2937' : '#ffffff'}
                strokeWidth="2"
              />
            </svg>
          );
        })()}
        
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
            onStartConnection={handleStartConnection}
            isConnectionMode={isConnectionMode}
            isConnectionTarget={hoveredWidgetId === widget.id}
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
              Кликните для размещения виджета • Нажмите ESC для отмены
            </p>
          </div>
          </div>
        </Portal>
      )}
      
      {/* Instructions overlay for connection mode */}
      {isConnectionMode && (
        <Portal>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50" style={{ position: 'fixed' }}>
          <div className={`px-6 py-3 rounded-lg border ${
            theme === 'dark'
              ? 'bg-black/90 border-green-800'
              : 'bg-white/90 border-green-200'
          } backdrop-blur-sm`}>
            <p className="text-sm font-medium">
              {hoveredWidgetId
                ? '🔌 Кликните для соединения • Правый клик для отмены'
                : '🔌 Наведите на ИИ-помощника для соединения • Правый клик или ESC для отмены'}
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
                  Сочетания клавиш
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
                    <span>Отменить действие</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+Z
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Повторить действие</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+Y
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Повторить действие (альтернатива)</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+Shift+Z
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Удалить выбранный виджет</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Delete
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Дублировать выбранный виджет</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+D
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Сохранить холст</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+S
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Переключиться на холст 1-9</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+1-9
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Показать сочетания клавиш</span>
                    <kbd className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                      Ctrl+/
                    </kbd>
                  </div>
                </div>

                <div className="border-t pt-3 mt-4 text-xs opacity-75">
                  <p>• Сочетания работают, когда вы не вводите текст в поля</p>
                  <p>• Нажмите ESC для отмены размещения виджета</p>
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
