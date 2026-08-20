import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

/**
 * Reusable CopyButton component with visual feedback and event isolation.
 *
 * @param {Object} props
 * @param {string} props.text - The exact string to copy to clipboard.
 * @param {string} [props.label='ID'] - Label describing the item (e.g. 'Order ID', 'Payment ID', 'Refund ID').
 * @param {string} [props.title] - Optional override for tooltip title.
 * @param {string} [props.className] - Optional CSS class name.
 * @param {Object} [props.style] - Optional inline style object.
 * @param {number} [props.iconSize=12] - Size of the Lucide icons.
 * @param {boolean} [props.alwaysShowLabel=false] - If true, always displays text label alongside icon.
 */
const CopyButton = ({
  text,
  label = 'ID',
  title,
  className = '',
  style = {},
  iconSize = 12,
  alwaysShowLabel = false,
}) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!text) {
    return null;
  }

  const handleCopyClick = async (e) => {
    // Prevent event from bubbling up to parent cards, rows, or modal backdrops
    e.preventDefault();
    e.stopPropagation();

    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const buttonTitle = copied ? 'Copied to clipboard!' : title || `Copy ${label}`;

  const defaultStyles = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 6px',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: copied ? '#16a34a' : '#6366f1',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    borderRadius: '4px',
    transition: 'color 0.15s ease, background-color 0.15s ease',
    ...style,
  };

  return (
    <button
      type="button"
      className={`copy-btn ${className}`}
      onClick={handleCopyClick}
      title={buttonTitle}
      aria-label={buttonTitle}
      style={defaultStyles}
    >
      {copied ? (
        <>
          <Check size={iconSize} aria-hidden="true" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy size={iconSize} aria-hidden="true" />
          {alwaysShowLabel && <span>Copy</span>}
        </>
      )}
    </button>
  );
};

export default CopyButton;
