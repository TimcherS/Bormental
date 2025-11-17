import { ChevronLeft, ChevronRight, Grid3x3 } from 'lucide-react';
import { useCanvas } from '../contexts/CanvasContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CanvasSwitcher() {
  const { canvases, activeCanvasId, setActiveCanvasId, sidebarWidth, setSidebarWidth, isSidebarCollapsed, toggleSidebarCollapsed } = useCanvas();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);

  // Handle resize start
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
  };

  // Handle resize move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const deltaX = e.clientX - startXRef.current;
        const newWidth = Math.max(128, Math.min(512, sidebarWidth + deltaX)); // Min 128px, max 512px
        setSidebarWidth(newWidth);
        startXRef.current = e.clientX;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth, setSidebarWidth]);

  return (
    <>
      {/* Adjustable Desktop/Tablet Layout - Left Collapsible Sidebar */}
      <div
        className="hidden md:flex fixed left-0 top-0 h-full z-40 sidebar-panel-transition"
        style={{ width: isSidebarCollapsed ? '72px' : `${sidebarWidth}px` }}
      >
        {/* Sidebar Content */}
        <div className={`relative flex flex-col ${isSidebarCollapsed ? 'items-center' : ''} h-full ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-gray-800/50' 
            : 'bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r border-gray-200/50'
        } backdrop-blur-md shadow-xl ${isSidebarCollapsed ? 'px-2 py-4' : 'px-4 py-6'} transition-all duration-300`}>
          {/* Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className={`mb-3 rounded-xl transition-all duration-300 flex items-center gap-2 flex-shrink-0 ${
              isSidebarCollapsed ? 'p-2.5 justify-center w-14' : 'px-3 py-2.5'
            } ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 shadow-lg'
                : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 shadow-md'
            } hover:scale-105 active:scale-95`}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isSidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">Назад</span>}
          </button>

          {/* Back to Canvas Select Button */}
          <button
            type="button"
            onClick={() => navigate('/canvas-select')}
            className={`mb-6 rounded-xl transition-all duration-300 flex items-center gap-2 flex-shrink-0 ${
              isSidebarCollapsed ? 'p-2.5 justify-center w-14' : 'px-3 py-2.5'
            } ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 shadow-lg text-blue-300'
                : 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 shadow-md text-blue-700'
            } hover:scale-105 active:scale-95`}
            title="К канвасам"
          >
            {isSidebarCollapsed ? <Grid3x3 size={18} /> : <><Grid3x3 size={18} /><span className="text-sm font-medium whitespace-nowrap">К канвасам</span></>}
          </button>

          {/* Canvas Buttons */}
          <div className={`flex flex-col ${isSidebarCollapsed ? 'gap-3' : 'gap-4'} flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide`}>
            {canvases.map((canvas) => {
              const isActive = activeCanvasId === canvas.id;
              const layoutClasses = isSidebarCollapsed
                ? 'w-14 h-14 items-center justify-center px-0 py-0'
                : 'w-full min-h-[72px] px-4 py-3 items-start text-left gap-1';
              const paletteClasses = isActive
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white border border-blue-400 shadow-lg shadow-blue-900/40'
                  : 'bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-500/30'
                : theme === 'dark'
                ? 'bg-gray-900 text-gray-200 border border-gray-800 hover:bg-gray-800 hover:border-gray-600'
                : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-400';
              const focusRingClasses = theme === 'dark'
                ? 'focus-visible:ring-blue-400 focus-visible:ring-offset-gray-950'
                : 'focus-visible:ring-blue-500 focus-visible:ring-offset-white';

              return (
                <button
                  key={canvas.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setActiveCanvasId(canvas.id)}
                  className={`sidebar-item-transition relative flex flex-col flex-shrink-0 rounded-2xl ${layoutClasses} ${paletteClasses} ${focusRingClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95`}
                  title={`${canvas.name} (${canvas.widgets.length} виджетов)`}
                >
                  {isSidebarCollapsed ? (
                    <span className="font-semibold text-lg leading-none">
                      {canvas.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <div className="w-full">
                      <div className="font-semibold text-sm truncate">{canvas.name}</div>
                      <div className={`text-xs mt-1 flex items-center gap-1 ${
                        isActive ? 'text-white/90' : theme === 'dark' ? 'text-gray-400/90' : 'text-gray-500'
                      }`}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{canvas.widgets.length} виджетов</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resize Handle */}
        {!isSidebarCollapsed && (
          <div
            onMouseDown={handleResizeStart}
            className={`absolute right-0 top-0 w-1 h-full cursor-ew-resize transition-all ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-transparent via-blue-500/30 to-transparent hover:via-blue-500/60' 
                : 'bg-gradient-to-r from-transparent via-blue-400/30 to-transparent hover:via-blue-400/60'
            } opacity-0 hover:opacity-100 z-50`}
          />
        )}
      </div>

      {/* Mobile Layout - Bottom Horizontal Bar */}
      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <div className={`rounded-2xl shadow-2xl p-2 backdrop-blur-lg ${
          theme === 'dark' 
            ? 'bg-gray-900/95 border border-gray-800/50' 
            : 'bg-white/95 border border-gray-200/50'
        }`}>
          <div className="flex gap-2 overflow-x-auto max-w-[90vw] scrollbar-thin">
            {canvases.map((canvas) => (
              <button
                key={canvas.id}
                onClick={() => setActiveCanvasId(canvas.id)}
                className={`group relative flex-shrink-0 px-4 py-3 rounded-xl transition-all duration-200 min-w-[100px] overflow-hidden ${
                  activeCanvasId === canvas.id
                    ? theme === 'dark'
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30'
                      : 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-400/40'
                    : theme === 'dark'
                    ? 'bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600'
                    : 'bg-white/80 hover:bg-white border border-gray-300/50 hover:border-gray-400 hover:shadow-md'
                } active:scale-95`}
              >
                {/* Animated gradient overlay for active state */}
                {activeCanvasId === canvas.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                
                <div className={`relative z-10 text-sm font-medium text-center ${
                  activeCanvasId === canvas.id ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div className="font-semibold truncate">{canvas.name}</div>
                  <div className={`text-xs flex items-center justify-center gap-1 mt-0.5 ${
                    activeCanvasId === canvas.id ? 'text-white/80' : 'opacity-60'
                  }`}>
                    <span className="inline-block w-1 h-1 rounded-full bg-current"></span>
                    <span>{canvas.widgets.length} widgets</span>
                  </div>
                </div>
                
                {/* Active indicator line */}
                {activeCanvasId === canvas.id && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
