import React from 'react';

interface TrustPayLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
  theme?: 'dark' | 'light';
}

export const TrustPayIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
    >
      <defs>
        {/* Background Card Gradient */}
        <linearGradient id="tpSquircleBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#132032" />
          <stop offset="50%" stopColor="#0B1320" />
          <stop offset="100%" stopColor="#050912" />
        </linearGradient>

        {/* Dual-tint Border Gradient */}
        <linearGradient id="tpSquircleBorder" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(0, 229, 153, 0.55)" />
          <stop offset="50%" stopColor="rgba(56, 189, 248, 0.3)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
        </linearGradient>

        {/* Emerald to Cyan Shield Gradient */}
        <linearGradient id="tpShieldGrad" x1="20" y1="18" x2="80" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F5A0" />
          <stop offset="55%" stopColor="#00E599" />
          <stop offset="100%" stopColor="#00B4D8" />
        </linearGradient>

        {/* Monogram P Loop Gradient */}
        <linearGradient id="tpAccentGrad" x1="50" y1="35" x2="68" y2="49" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E599" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Soft Radial Ambient Aura */}
        <radialGradient id="tpInnerAura" cx="50" cy="46" r="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(0, 229, 153, 0.16)" />
          <stop offset="100%" stopColor="rgba(0, 229, 153, 0)" />
        </radialGradient>
      </defs>

      {/* Squircle Base Frame with Dual Glow Border */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="24"
        fill="url(#tpSquircleBg)"
        stroke="url(#tpSquircleBorder)"
        strokeWidth="1.5"
      />

      {/* Subtle Ambient Center Aura */}
      <circle cx="50" cy="48" r="32" fill="url(#tpInnerAura)" />

      {/* Geometric Shield Silhouette */}
      <path
        d="M50 18 L76 28 C76 52 50 74 50 79 C50 74 24 52 24 28 Z"
        fill="rgba(0, 229, 153, 0.05)"
        stroke="url(#tpShieldGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Clean Interlocking T-P Monogram & Instant Settlement Glyph */}
      {/* T Top Crossbar with rounded terminals */}
      <path
        d="M36 35 H64"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* T Vertical Stem */}
      <path
        d="M50 35 V58"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* P Upper Currency Arc (Gracefully interlocking with T) */}
      <path
        d="M50 35 H60 C64.5 35 67.5 38 67.5 42 C67.5 46 64.5 49 60 49 H50"
        stroke="url(#tpAccentGrad)"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lower Dynamic Settlement Chevron (Transfer Velocity) */}
      <path
        d="M43 54 L50 61 L57 54"
        stroke="#00E599"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Base Security Node */}
      <circle cx="50" cy="71" r="3" fill="#00E599" />
    </svg>
  );
};

export const TrustPayLogo: React.FC<TrustPayLogoProps> = ({
  size = 'md',
  showWordmark = true,
  layout,
  className = '',
  theme = 'dark',
}) => {
  // Determine layout: vertical for xl/lg (or when requested), horizontal for header/small
  const isVertical = layout === 'vertical' || (layout === undefined && (size === 'xl' || size === 'lg'));

  const iconDimensions = {
    sm: 30,
    md: 38,
    lg: 54,
    xl: 74,
  }[size];

  const titleSizes = {
    sm: '17px',
    md: '20px',
    lg: '24px',
    xl: '28px',
  }[size];

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isVertical ? '14px' : '10px',
        userSelect: 'none',
      }}
    >
      {/* Icon with soft ambient circular halo */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isVertical && size === 'xl' && (
          <div
            style={{
              position: 'absolute',
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 229, 153, 0.2) 0%, rgba(0, 229, 153, 0.05) 50%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <TrustPayIcon size={iconDimensions} />
        </div>
      </div>

      {/* Typography & Settlement Badge */}
      {showWordmark && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isVertical ? 'center' : 'flex-start',
            lineHeight: 1.1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: titleSizes,
              fontWeight: 800,
              letterSpacing: '-0.025em',
            }}
          >
            <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#0F172A' }}>
              Trust
            </span>
            <span
              style={{
                marginLeft: '1px',
                background: 'linear-gradient(135deg, #00E599 0%, #00D2B4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Pay
            </span>
          </div>

          {size === 'xl' && (
            <div
              style={{
                marginTop: '7px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0, 229, 153, 0.08)',
                border: '1px solid rgba(0, 229, 153, 0.22)',
                borderRadius: '9999px',
                padding: '3px 12px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#00E599',
              }}
            >
              <span>USDT</span>
              <span style={{ opacity: 0.45 }}>•</span>
              <span>INR Settlement</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
