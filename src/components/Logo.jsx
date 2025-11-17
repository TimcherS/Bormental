export default function Logo({ className = "w-8 h-8", showText = false, textClassName = "text-xl font-semibold" }) {
  return (
    <div className="flex items-center gap-2">
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF77" />
            <stop offset="100%" stopColor="#F5A962" />
          </linearGradient>
        </defs>
        
        {/* Young man's head */}
        <ellipse cx="50" cy="35" rx="18" ry="20" fill="url(#skinGradient)" />
        
        {/* Hair */}
        <path
          d="M32 30 Q32 18, 50 18 Q68 18, 68 30 L65 32 Q65 22, 50 22 Q35 22, 35 32 Z"
          fill="#2C1810"
        />
        
        {/* Glasses frame - left */}
        <ellipse cx="42" cy="35" rx="6" ry="5" fill="none" stroke="#1F2937" strokeWidth="2" />
        
        {/* Glasses frame - right */}
        <ellipse cx="58" cy="35" rx="6" ry="5" fill="none" stroke="#1F2937" strokeWidth="2" />
        
        {/* Glasses bridge */}
        <line x1="48" y1="35" x2="52" y2="35" stroke="#1F2937" strokeWidth="2" />
        
        {/* Glasses arms */}
        <line x1="36" y1="35" x2="32" y2="33" stroke="#1F2937" strokeWidth="1.5" />
        <line x1="64" y1="35" x2="68" y2="33" stroke="#1F2937" strokeWidth="1.5" />
        
        {/* Eyes behind glasses */}
        <circle cx="42" cy="35" r="2" fill="#1F2937" />
        <circle cx="58" cy="35" r="2" fill="#1F2937" />
        
        {/* Nose */}
        <path d="M50 38 Q51 42, 52 43" stroke="#D97A4A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Smile */}
        <path d="M44 45 Q50 48, 56 45" stroke="#C75B39" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Neck and shoulders */}
        <path
          d="M40 52 Q40 55, 35 60 L35 75 L65 75 L65 60 Q60 55, 60 52"
          fill="url(#logoGradient)"
        />
        
        {/* Accent lines suggesting data/analytics */}
        <path
          d="M20 80 L30 88 L45 84 L60 90"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.8"
        />
        
        {/* Data points */}
        <circle cx="20" cy="80" r="2.5" fill="url(#logoGradient)" />
        <circle cx="30" cy="88" r="2.5" fill="url(#logoGradient)" />
        <circle cx="45" cy="84" r="2.5" fill="url(#logoGradient)" />
        <circle cx="60" cy="90" r="2.5" fill="url(#logoGradient)" />
        
        {/* Sparkle accent */}
        <path
          d="M78 25 L80 30 L85 28 L81 32 L83 37 L78 33 L73 37 L75 32 L71 28 L76 30 Z"
          fill="url(#logoGradient)"
          opacity="0.7"
        />
      </svg>
      {showText && <span className={textClassName}>Борменталь</span>}
    </div>
  );
}

