import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const CanvasContext = createContext();

export function CanvasProvider({ children }) {
  const [canvases, setCanvases] = useState(() => {
    try {
      const saved = localStorage.getItem('canvases');
      return saved ? JSON.parse(saved) : [
        {
          id: '1',
          name: 'Главная панель',
          widgets: [
            {
              id: 'demo1',
              type: 'note',
              x: 50,
              y: 50,
              width: 300,
              height: 200,
              config: { content: 'Добро пожаловать в Business Copilot!\n\nЭто демо-панель с примерными виджетами.' }
            },
            {
              id: 'demo2',
              type: 'revenue',
              x: 400,
              y: 50,
              width: 300,
              height: 200,
              config: {}
            },
            {
              id: 'demo3',
              type: 'calendar',
              x: 50,
              y: 300,
              width: 300,
              height: 200,
              config: {}
            }
          ],
          connections: []
        }
      ];
    } catch (error) {
      console.error('Error loading canvases from localStorage:', error);
      return [
        {
          id: '1',
          name: 'Главная панель',
          widgets: [
            {
              id: 'demo1',
              type: 'note',
              x: 50,
              y: 50,
              width: 300,
              height: 200,
              config: { content: 'Добро пожаловать в Business Copilot!\n\nЭто демо-панель с примерными виджетами.' }
            }
          ],
          connections: []
        }
      ];
    }
  });

  const [activeCanvasId, setActiveCanvasId] = useState(() => {
    try {
      const saved = localStorage.getItem('activeCanvasId');
      const savedCanvases = localStorage.getItem('canvases');
      let availableCanvases;
      
      try {
        availableCanvases = savedCanvases ? JSON.parse(savedCanvases) : null;
      } catch {
        availableCanvases = null;
      }
      
      // If we have saved canvases, validate that the saved activeCanvasId exists
      if (availableCanvases && saved) {
        const canvasExists = availableCanvases.some(c => c.id === saved);
        if (canvasExists) {
          return saved;
        }
      }
      
      // If no valid saved ID, use the first available canvas ID
      if (availableCanvases && availableCanvases.length > 0) {
        return availableCanvases[0].id;
      }
      
      return '1'; // Default fallback
    } catch (error) {
      console.error('Error loading activeCanvasId from localStorage:', error);
      return '1';
    }
  });

  const [selectedWidgetId, setSelectedWidgetId] = useState(null);

  // Sidebar width for adjustable panels
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarWidth');
      return saved ? parseInt(saved) : 256;
    } catch (error) {
      return 256;
    }
  });

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      const screenWidth = window.innerWidth;
      // Auto-collapse on smaller screens (tablet and mobile)
      return screenWidth < 1280; // Collapse by default on < xl breakpoint
    } catch (error) {
      return false;
    }
  });

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Auto-collapse sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      // Auto-collapse on smaller screens (tablet and mobile)
      if (screenWidth < 1280) {
        setIsSidebarCollapsed(true);
      } else if (screenWidth >= 1280) {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save sidebar width to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebarWidth', sidebarWidth.toString());
    } catch (error) {
      console.error('Error saving sidebarWidth to localStorage:', error);
    }
  }, [sidebarWidth]);

  useEffect(() => {
    try {
      localStorage.setItem('canvases', JSON.stringify(canvases));
    } catch (error) {
      console.error('Error saving canvases to localStorage:', error);
      // Could show a toast here if we had access to it, but for now just log
    }
  }, [canvases]);

  useEffect(() => {
    try {
      localStorage.setItem('activeCanvasId', activeCanvasId);
    } catch (error) {
      console.error('Error saving activeCanvasId to localStorage:', error);
    }
  }, [activeCanvasId]);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId);

  // Ensure activeCanvasId always points to a valid canvas
  useEffect(() => {
    if (!activeCanvas && canvases.length > 0) {
      console.warn('Active canvas not found, switching to first available canvas');
      setActiveCanvasId(canvases[0].id);
    }
  }, [activeCanvas, canvases]);

  const addCanvas = (name) => {
    const newCanvas = {
      id: Date.now().toString(),
      name,
      widgets: [],
      connections: []
    };
    setCanvases(prev => [...prev, newCanvas]);
    return newCanvas.id;
  };

  const deleteCanvas = (id) => {
    setCanvases(prev => prev.filter(c => c.id !== id));
    if (activeCanvasId === id && canvases.length > 1) {
      setActiveCanvasId(canvases.find(c => c.id !== id).id);
    }
  };

  const renameCanvas = (id, newName) => {
    setCanvases(prev => prev.map(canvas =>
      canvas.id === id ? { ...canvas, name: newName } : canvas
    ));
  };

  const addWidget = (widget) => {
    setCanvases(prev => prev.map(canvas => 
      canvas.id === activeCanvasId
        ? { ...canvas, widgets: [...canvas.widgets, { ...widget, id: Date.now().toString() }] }
        : canvas
    ));
  };

  const updateWidget = (widgetId, updates) => {
    setCanvases(prev => prev.map(canvas =>
      canvas.id === activeCanvasId
        ? {
            ...canvas,
            widgets: canvas.widgets.map(w =>
              w.id === widgetId ? { ...w, ...updates } : w
            )
          }
        : canvas
    ));
  };

  const deleteWidget = (widgetId) => {
    setCanvases(prev => prev.map(canvas =>
      canvas.id === activeCanvasId
        ? { 
            ...canvas, 
            widgets: canvas.widgets.filter(w => w.id !== widgetId),
            // Also remove all connections involving this widget
            connections: (canvas.connections || []).filter(
              conn => conn.sourceId !== widgetId && conn.targetId !== widgetId
            )
          }
        : canvas
    ));
  };

  // Connection management functions
  const addConnection = (sourceId, targetId) => {
    const newConnection = {
      id: Date.now().toString(),
      sourceId,
      targetId,
      createdAt: Date.now()
    };
    
    setCanvases(prev => prev.map(canvas =>
      canvas.id === activeCanvasId
        ? { 
            ...canvas, 
            connections: [...(canvas.connections || []), newConnection] 
          }
        : canvas
    ));
    
    return newConnection.id;
  };

  const removeConnection = (connectionId) => {
    setCanvases(prev => prev.map(canvas =>
      canvas.id === activeCanvasId
        ? { 
            ...canvas, 
            connections: (canvas.connections || []).filter(c => c.id !== connectionId) 
          }
        : canvas
    ));
  };

  const hasConnection = (sourceId, targetId) => {
    if (!activeCanvas) return false;
    return (activeCanvas.connections || []).some(
      conn => conn.sourceId === sourceId && conn.targetId === targetId
    );
  };

  const getWidgetConnections = (widgetId) => {
    if (!activeCanvas) return [];
    return (activeCanvas.connections || []).filter(
      conn => conn.sourceId === widgetId || conn.targetId === widgetId
    );
  };

  // History management for undo/redo
  const saveToHistory = (action, canvasId = activeCanvasId) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ action, canvasId, canvases: [...canvases], activeCanvasId });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvases(history[historyIndex - 1].canvases);
      setActiveCanvasId(history[historyIndex - 1].activeCanvasId);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvases(history[historyIndex + 1].canvases);
      setActiveCanvasId(history[historyIndex + 1].activeCanvasId);
    }
  };

  // Override widget functions to save history
  const addWidgetWithHistory = (widget) => {
    addWidget(widget);
    saveToHistory('add-widget');
  };

  const updateWidgetWithHistory = (widgetId, updates) => {
    const oldWidget = activeCanvas?.widgets.find(w => w.id === widgetId);
    if (oldWidget) {
      updateWidget(widgetId, updates);
      // Only save history for position/resize changes
      if ('x' in updates || 'y' in updates || 'width' in updates || 'height' in updates) {
        saveToHistory('update-widget', oldWidget);
      }
    }
  };

  const deleteWidgetWithHistory = (widgetId) => {
    const widgetToDelete = activeCanvas?.widgets.find(w => w.id === widgetId);
    deleteWidget(widgetId);
    setSelectedWidgetId(selectedWidgetId === widgetId ? null : selectedWidgetId);
    saveToHistory('delete-widget', widgetToDelete);
  };

  const duplicateWidget = (widgetId) => {
    const widgetToDuplicate = activeCanvas?.widgets.find(w => w.id === widgetId);
    if (widgetToDuplicate) {
      const newWidget = {
        ...widgetToDuplicate,
        id: Date.now().toString(),
        x: widgetToDuplicate.x + 20,
        y: widgetToDuplicate.y + 20
      };
      addWidgetWithHistory(newWidget);
      setSelectedWidgetId(newWidget.id);
    }
  };

  // Toggle sidebar collapsed state
  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  // Canvas view state management (zoom and pan per canvas)
  const [canvasViewStates, setCanvasViewStates] = useState(() => {
    try {
      const saved = localStorage.getItem('canvasViewStates');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading canvas view states:', error);
      return {};
    }
  });

  const canvasViewStatesRef = useRef(canvasViewStates);

  useEffect(() => {
    canvasViewStatesRef.current = canvasViewStates;
  }, [canvasViewStates]);

  // Save canvas view states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('canvasViewStates', JSON.stringify(canvasViewStates));
    } catch (error) {
      console.error('Error saving canvas view states:', error);
    }
  }, [canvasViewStates]);

  const getCanvasViewState = useCallback((canvasId) => {
    return canvasViewStatesRef.current[canvasId] || null;
  }, []);

  const updateCanvasViewState = useCallback((canvasId, viewState) => {
    setCanvasViewStates(prev => {
      const prevState = prev[canvasId];
      if (
        prevState &&
        prevState.zoom === viewState.zoom &&
        prevState.pan?.x === viewState.pan?.x &&
        prevState.pan?.y === viewState.pan?.y
      ) {
        return prev;
      }

      return {
        ...prev,
        [canvasId]: viewState
      };
    });
  }, []);

  return (
    <CanvasContext.Provider value={{
      canvases,
      activeCanvasId,
      activeCanvas,
      selectedWidgetId,
      setSelectedWidgetId,
      setActiveCanvasId,
      addCanvas,
      deleteCanvas,
      renameCanvas,
      addWidget: addWidgetWithHistory,
      updateWidget: updateWidgetWithHistory,
      deleteWidget: deleteWidgetWithHistory,
      duplicateWidget,
      addConnection,
      removeConnection,
      hasConnection,
      getWidgetConnections,
      undo,
      redo,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1,
      sidebarWidth,
      setSidebarWidth,
      isSidebarCollapsed,
      toggleSidebarCollapsed,
      getCanvasViewState,
      updateCanvasViewState
    }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within CanvasProvider');
  }
  return context;
}
