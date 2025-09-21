import { useEffect, useCallback } from 'react';

interface UseKeyboardPreventionOptions {
  preventEnterSubmit?: boolean;
  preventEscape?: boolean;
  preventTab?: boolean;
  preventF5?: boolean;
  preventCtrlS?: boolean;
  preventCtrlEnter?: boolean;
  onKeyDown?: (e: KeyboardEvent) => void;
}

/**
 * Custom hook to prevent unwanted keyboard actions globally
 * @param options Configuration options for keyboard prevention
 */
export const useKeyboardPrevention = (options: UseKeyboardPreventionOptions = {}) => {
  const {
    preventEnterSubmit = true,
    preventEscape = false,
    preventTab = false,
    preventF5 = false,
    preventCtrlS = true,
    preventCtrlEnter = true,
    onKeyDown
  } = options;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    
    if (preventEnterSubmit && e.key === 'Enter') {
      const target = e.target as HTMLElement;
      
      
      if (target.tagName === 'TEXTAREA') {
        return;
      }
      
      
      if (target.tagName === 'BUTTON' || 
          target.getAttribute('role') === 'button' ||
          target.closest('[role="button"]')) {
        return;
      }
      
      
      if (target.tagName === 'INPUT' || target.closest('form')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    
    if (preventEscape && e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }

    
    if (preventTab && e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
    }

    
    if (preventF5 && e.key === 'F5') {
      e.preventDefault();
      e.stopPropagation();
    }

    
    if (preventCtrlS && e.ctrlKey && e.key === 's') {
      e.preventDefault();
      e.stopPropagation();
    }

    
    if (preventCtrlEnter && e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }

    
    if (onKeyDown) {
      onKeyDown(e);
    }
  }, [preventEnterSubmit, preventEscape, preventTab, preventF5, preventCtrlS, preventCtrlEnter, onKeyDown]);

  useEffect(() => {
    
    document.addEventListener('keydown', handleKeyDown, true);
    
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);
};

/**
 * Utility function to prevent form submission on Enter key
 * @param e Keyboard event
 */
export const preventEnterSubmit = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === 'Enter') {
    const target = e.target as HTMLElement;
    
    
    if (target.tagName === 'TEXTAREA') {
      return;
    }
    
    
    if (target.tagName === 'BUTTON' || 
        target.getAttribute('role') === 'button' ||
        target.closest('[role="button"]')) {
      return;
    }
    
    
    if (target.tagName === 'INPUT' || target.closest('form')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
};

/**
 * Utility function to prevent specific keys
 * @param e Keyboard event
 * @param keys Array of keys to prevent
 */
export const preventKeys = (e: React.KeyboardEvent<HTMLElement>, keys: string[]) => {
  if (keys.includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
  }
}; 