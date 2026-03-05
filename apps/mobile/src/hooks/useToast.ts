import { useState, useCallback, useRef } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'error' | 'success' | 'info';
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ visible: false, message: '', type: 'error' });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState({ visible: true, message, type });
    timeoutRef.current = setTimeout(() => setState(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState(prev => ({ ...prev, visible: false }));
  }, []);

  return { showToast, toastProps: { ...state, onDismiss: hideToast } };
}
