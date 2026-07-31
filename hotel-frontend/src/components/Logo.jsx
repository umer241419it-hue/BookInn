import React from 'react';

const Logo = ({
  size = 'medium',
  variant = 'default',
  showText = true,
  iconOnly = false,
  inline = false,
  className = '',
}) => {
  const dimensions = {
    xs: { iconSize: 20, fontSize: '0.95rem', gap: '0.3rem' },
    small: { iconSize: 26, fontSize: '1.15rem', gap: '0.45rem' },
    medium: { iconSize: 34, fontSize: '1.4rem', gap: '0.6rem' },
    large: { iconSize: 42, fontSize: '1.85rem', gap: '0.75rem' },
  };

  const currentSize = dimensions[size] || dimensions.medium;
  const bookColor = variant === 'light' ? '#FFFFFF' : '#1A2B3C';
  const innColor = '#C9A35D';

  return (
    <span
      className={`bookinn-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: currentSize.gap,
        userSelect: 'none',
        verticalAlign: inline ? '-0.15em' : 'middle',
      }}
    >
      {/* Favicon Logo Image */}
      <img
        src="/favicon.svg"
        alt="BookInn Logo"
        width={currentSize.iconSize}
        height={currentSize.iconSize}
        style={{
          width: `${currentSize.iconSize}px`,
          height: `${currentSize.iconSize}px`,
          flexShrink: 0,
          objectFit: 'contain',
          display: 'block',
        }}
      />

      {/* Styled Wordmark Text */}
      {showText && !iconOnly && (
        <span
          className="logo-text"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: currentSize.fontSize,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          <span style={{ color: bookColor }}>Book</span>
          <span style={{ color: innColor }}>Inn</span>
        </span>
      )}
    </span>
  );
};

export default Logo;
