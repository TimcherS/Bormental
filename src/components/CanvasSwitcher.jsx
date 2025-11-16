import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCanvas } from '../contexts/CanvasContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';

export default function CanvasSwitcher() {
  const { canvases, activeCanvasId, setActiveCanvasId, sidebarWidth, setSidebarWidth, isSidebarCollapsed, toggleSidebarCollapsed } = useCanvas();
  const { theme } = useTheme();
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
        className="hidden md:flex fixed left-0 top-0 h-full z-40 transition-all duration-300"
        style={{ width: isSidebarCollapsed ? '64px' : `${sidebarWidth}px` }}
      >
        {/* Sidebar Content */}
        <div className={`relative flex flex-col ${isSidebarCollapsed ? 'items-center' : ''} h-full ${
          theme === 'dark' ? 'bg-black/95 border-r border-gray-800' : 'bg-white/95 border-r border-gray-200'
        } backdrop-blur-sm p-4`}>
          {/* Toggle Button */}
          <button
            onClick={toggleSidebarCollapsed}
            className={`mb-4 p-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Canvas Buttons */}
          <div className="flex flex-col gap-3 flex-1">
            {canvases.map((canvas) => (
              <button
                key={canvas.id}
                onClick={() => setActiveCanvasId(canvas.id)}
                className={`group relative transition-all rounded-lg border-2 ${
                  isSidebarCollapsed ? 'w-10 h-10 flex items-center justify-center' : 'w-full h-16 px-3 py-2'
                } ${
                  activeCanvasId === canvas.id
                    ? 'border-blue-500 bg-blue-500'
                    : theme === 'dark'
                    ? 'border-gray-800 bg-black hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
                title={`${canvas.name} (${canvas.widgets.length} widgets)`}
              >
                {isSidebarCollapsed ? (
                  <span className={`font-bold text-lg ${
                    activeCanvasId === canvas.id ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {canvas.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span className={`text-sm font-medium text-center ${
                    activeCanvasId === canvas.id ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <div className="font-semibold truncate">{canvas.name}</div>
                    <div className="text-xs opacity-75">{canvas.widgets.length} widgets</div>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Resize Handle */}
        {!isSidebarCollapsed && (
          <div
            onMouseDown={handleResizeStart}
            className={`absolute right-0 top-0 w-2 h-full cursor-ew-resize ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} transition-colors opacity-0 hover:opacity-100 z-50`}
          />
        )}
      </div>

      {/* Mobile Layout - Bottom Horizontal Bar */}
      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <div className={`rounded-2xl border shadow-lg p-2 ${
          theme === 'dark' ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex gap-2 overflow-x-auto max-w-[90vw]">
            {canvases.map((canvas) => (
              <button
                key={canvas.id}
                onClick={() => setActiveCanvasId(canvas.id)}
                className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all min-w-[100px] ${
                  activeCanvasId === canvas.id
                    ? 'border-blue-500 bg-blue-500'
                    : theme === 'dark'
                    ? 'border-gray-800 bg-black hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <span className={`text-sm font-medium text-center ${
                  activeCanvasId === canvas.id ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div className="font-semibold truncate">{canvas.name}</div>
                  <div className="text-xs opacity-75">{canvas.widgets.length} widgets</div>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
