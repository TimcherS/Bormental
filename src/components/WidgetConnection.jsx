import { useState } from 'react';
import { Unlink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Portal from './Portal';

/**
 * WidgetConnection component renders a cable/line between two widgets
 * Represents data flow from source widget to AI workspace
 */
export default function WidgetConnection({ connection, sourceWidget, targetWidget, onRemove, zoom, pan }) {
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  if (!sourceWidget || !targetWidget) return null;

  // Calculate optimal connection points based on widget positions
  const sourceCenterX = sourceWidget.x + sourceWidget.width / 2;
  const sourceCenterY = sourceWidget.y + sourceWidget.height / 2;
  const targetCenterX = targetWidget.x + targetWidget.width / 2;
  const targetCenterY = targetWidget.y + targetWidget.height / 2;
  
  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;
  
  // Determine optimal connection sides
  let sourceX, sourceY, targetX, targetY;
  
  // For source widget: choose side closest to target
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection is dominant
    if (dx > 0) {
      // Target is to the right
      sourceX = sourceWidget.x + sourceWidget.width;
      sourceY = sourceWidget.y + sourceWidget.height / 2;
    } else {
      // Target is to the left
      sourceX = sourceWidget.x;
      sourceY = sourceWidget.y + sourceWidget.height / 2;
    }
  } else {
    // Vertical connection is dominant
    if (dy > 0) {
      // Target is below
      sourceX = sourceWidget.x + sourceWidget.width / 2;
      sourceY = sourceWidget.y + sourceWidget.height;
    } else {
      // Target is above
      sourceX = sourceWidget.x + sourceWidget.width / 2;
      sourceY = sourceWidget.y;
    }
  }
  
  // For target widget: choose side closest to source
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection is dominant
    if (dx > 0) {
      // Source is to the left
      targetX = targetWidget.x;
      targetY = targetWidget.y + targetWidget.height / 2;
    } else {
      // Source is to the right
      targetX = targetWidget.x + targetWidget.width;
      targetY = targetWidget.y + targetWidget.height / 2;
    }
  } else {
    // Vertical connection is dominant
    if (dy > 0) {
      // Source is above
      targetX = targetWidget.x + targetWidget.width / 2;
      targetY = targetWidget.y;
    } else {
      // Source is below
      targetX = targetWidget.x + targetWidget.width / 2;
      targetY = targetWidget.y + targetWidget.height;
    }
  }

  // Create optimized curved path - more straightforward, minimal wiggle
  const distance = Math.sqrt(dx * dx + dy * dy);
  const controlOffset = Math.min(distance * 0.4, 200); // Adaptive but limited offset
  
  // Determine control point direction based on dominant axis
  let cp1X, cp1Y, cp2X, cp2Y;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal dominant - control points extend horizontally
    cp1X = sourceX + (dx > 0 ? controlOffset : -controlOffset);
    cp1Y = sourceY;
    cp2X = targetX - (dx > 0 ? controlOffset : -controlOffset);
    cp2Y = targetY;
  } else {
    // Vertical dominant - control points extend vertically
    cp1X = sourceX;
    cp1Y = sourceY + (dy > 0 ? controlOffset : -controlOffset);
    cp2X = targetX;
    cp2Y = targetY - (dy > 0 ? controlOffset : -controlOffset);
  }
  
  const path = `M ${sourceX} ${sourceY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${targetX} ${targetY}`;

  // Calculate midpoint for click detection
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const handleCableClick = (e) => {
    e.stopPropagation();
    // Get click position in screen coordinates
    setMenuPosition({
      x: e.clientX,
      y: e.clientY
    });
    setShowMenu(true);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove(connection.id);
    setShowMenu(false);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  // Connection color based on source widget type
  const connectionColors = {
    'email': '#10b981', // green
    'news': '#6366f1', // indigo
    'social-media': '#3b82f6', // blue
    'calendar': '#a855f7', // purple
    'marketing': '#f97316', // orange
    'revenue': '#eab308', // yellow
    'chart': '#ec4899', // pink
    'note': '#6b7280', // gray
  };

  const color = connectionColors[sourceWidget.type] || '#3b82f6';

  return (
    <>
      {/* Cable/Connection Line */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          zIndex: 0, // Under all widgets
        }}
      >
        {/* Glow effect for the cable */}
        <defs>
          <filter id={`glow-${connection.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Animated gradient for data flow */}
          <linearGradient id={`gradient-${connection.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }}>
              <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" style={{ stopColor: color, stopOpacity: 0.8 }}>
              <animate attributeName="offset" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.3 }}>
              <animate attributeName="offset" values="1;1;1" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* Main cable path - thicker invisible layer for easier clicking */}
        <path
          d={path}
          stroke="transparent"
          strokeWidth="20"
          fill="none"
          className="pointer-events-auto cursor-pointer"
          onClick={handleCableClick}
        />

        {/* Visible cable with glow */}
        <path
          d={path}
          stroke={color}
          strokeWidth="3"
          fill="none"
          filter={`url(#glow-${connection.id})`}
          opacity="0.7"
          strokeDasharray="10 5"
          className="pointer-events-none"
        >
          {/* Animated dash offset for flowing effect */}
          <animate
            attributeName="stroke-dashoffset"
            values="0;-15;0"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Connection start indicator (circle at source) */}
        <circle
          cx={sourceX}
          cy={sourceY}
          r="6"
          fill={color}
          stroke={theme === 'dark' ? '#1f2937' : '#ffffff'}
          strokeWidth="2"
          className="pointer-events-none"
        />

        {/* Connection end indicator (arrow at target) */}
        <g transform={`translate(${targetX}, ${targetY})`}>
          <circle
            r="6"
            fill={color}
            stroke={theme === 'dark' ? '#1f2937' : '#ffffff'}
            strokeWidth="2"
            className="pointer-events-none"
          />
          <path
            d="M -3 -3 L 3 0 L -3 3 Z"
            fill={theme === 'dark' ? '#1f2937' : '#ffffff'}
            className="pointer-events-none"
          />
        </g>

        {/* Data flow particles animation */}
        <circle r="3" fill={color} opacity="0.8">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={path}
          />
        </circle>
        <circle r="3" fill={color} opacity="0.6">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={path}
            begin="1s"
          />
        </circle>
        <circle r="3" fill={color} opacity="0.4">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={path}
            begin="2s"
          />
        </circle>
      </svg>

      {/* Context Menu - Rendered via Portal to escape canvas transforms */}
      {showMenu && (
        <Portal>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={handleCloseMenu}
          />
          
          {/* Menu */}
          <div
            className={`fixed z-[9999] ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-700'
                : 'bg-white border-gray-200'
            } border rounded-lg shadow-xl overflow-hidden`}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            <button
              onClick={handleRemove}
              className={`flex items-center gap-2 px-4 py-2 w-full text-left text-sm transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-800 text-red-400 hover:text-red-300'
                  : 'hover:bg-gray-50 text-red-600 hover:text-red-700'
              }`}
            >
              <Unlink className="w-4 h-4" />
              Remove Connection
            </button>
          </div>
        </Portal>
      )}
    </>
  );
}

