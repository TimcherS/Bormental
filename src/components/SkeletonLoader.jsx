export default function SkeletonLoader({ className = '', lines = 3, showAvatar = false }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-300 dark:bg-gray-600 rounded mb-2 h-3 ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
}
