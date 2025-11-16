import React, { useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Portal from './Portal';

export default function Modal({ children, open, onOpenChange, title }) {
  const { theme } = useTheme();

  // Prevent scrolling and zooming when modal is open (except inside modal content)
  useEffect(() => {
    if (open) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Mark that a modal is open globally
      document.body.setAttribute('data-modal-open', 'true');
      
      // Smart wheel event handler: allow scrolling inside modal, prevent canvas zoom outside
      const preventCanvasZoom = (e) => {
        // Check if the event target is inside the modal content area
        const modalContent = document.querySelector('[data-modal-content="true"]');
        const modalContainer = document.querySelector('[data-modal-container="true"]');
        
        // If we're inside the modal container (including header, footer, or scrollable content)
        if (modalContainer && modalContainer.contains(e.target)) {
          // If we're in the scrollable content area, check if we can still scroll
          if (modalContent && modalContent.contains(e.target)) {
            const { scrollTop, scrollHeight, clientHeight } = modalContent;
            const isScrollable = scrollHeight > clientHeight;
            const isAtTop = scrollTop === 0;
            const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
            
            // Allow scrolling if we're not at the boundaries or if scrolling in the right direction
            if (isScrollable) {
              if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                // At boundary and trying to scroll further - prevent
                e.preventDefault();
                e.stopPropagation();
              }
              // Otherwise allow the scroll (don't call preventDefault)
              else {
                e.stopPropagation(); // Stop propagation to prevent canvas zoom
              }
              return;
            }
          }
          // Inside modal but not in scrollable area (header/footer) - prevent
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        
        // Outside modal (on backdrop) - prevent everything
        e.preventDefault();
        e.stopPropagation();
      };
      
      // Use capture phase to intercept events before they reach the canvas
      document.addEventListener('wheel', preventCanvasZoom, { passive: false, capture: true });
      document.addEventListener('touchmove', preventCanvasZoom, { passive: false, capture: true });
      
      return () => {
        document.body.style.overflow = '';
        document.body.removeAttribute('data-modal-open');
        document.removeEventListener('wheel', preventCanvasZoom, { capture: true });
        document.removeEventListener('touchmove', preventCanvasZoom, { capture: true });
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onOpenChange(false);
          }
        }}
      >
        {/* Backdrop with blur */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity -z-10" />
        
        {/* Modal Content */}
        <div 
          data-modal-container="true"
          className={`relative w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl transform transition-all duration-300 overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-5 border-b ${
            theme === 'dark' 
              ? 'border-gray-700 bg-gray-800/50' 
              : 'border-gray-200 bg-gray-50/50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-blue-500/20' 
                  : 'bg-blue-100'
              }`}>
                <Settings className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div 
            data-modal-content="true"
            className={`overflow-y-auto max-h-[calc(90vh-250px)] px-6 py-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {children}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end gap-3 px-6 py-5 border-t ${
            theme === 'dark' 
              ? 'border-gray-700 bg-gray-800/50' 
              : 'border-gray-200 bg-gray-50/50'
          }`}>
            <button
              onClick={() => onOpenChange(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="widget-config-form"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
