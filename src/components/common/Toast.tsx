import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from './Icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Trigger device vibration if available for native feel
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(type === 'error' ? [50, 50, 50] : 30);
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: '18px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="tp-toast"
            style={{
              borderColor:
                t.type === 'success'
                  ? 'rgba(0, 229, 153, 0.4)'
                  : t.type === 'error'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'rgba(56, 189, 248, 0.4)',
              pointerEvents: 'auto',
            }}
          >
            {t.type === 'success' && <CheckCircle2 size={18} color="#00E599" />}
            {t.type === 'error' && <AlertCircle size={18} color="#EF4444" />}
            {t.type === 'info' && <Info size={18} color="#38BDF8" />}
            <span>{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', marginLeft: '6px' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
