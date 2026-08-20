/**
 * Robust copy-to-clipboard utility with legacy fallback support.
 * Works across secure HTTPS contexts, localhost, and non-secure environments.
 *
 * @param {string} text - The text string to copy.
 * @returns {Promise<boolean>} Resolves to true if copying succeeded, false otherwise.
 */
export const copyToClipboard = async (text) => {
  if (!text || typeof text !== 'string') {
    if (text !== undefined && text !== null) {
      text = String(text);
    } else {
      return false;
    }
  }

  const cleanText = text.trim();
  if (!cleanText) return false;

  // 1. Primary Method: Modern Asynchronous Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(cleanText);
      return true;
    } catch (err) {
      console.warn('[Clipboard] Modern API writeText failed, attempting execCommand fallback:', err.message);
    }
  }

  // 2. Fallback Method: Hidden Textarea with document.execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = cleanText;
    
    // Position offscreen so it's invisible and does not trigger viewport scroll
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    textArea.setAttribute('aria-hidden', 'true');
    
    document.body.appendChild(textArea);
    textArea.focus({ preventScroll: true });
    textArea.select();
    
    // Execute legacy copy
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (fallbackErr) {
    console.error('[Clipboard] Both modern and fallback copy mechanisms failed:', fallbackErr);
    return false;
  }
};
