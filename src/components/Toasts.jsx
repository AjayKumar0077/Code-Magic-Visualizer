import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    const item = { id, ...toast };
    setToasts((t) => [...t, item]);
    const ttl = toast.ttl ?? 3000;
    if (ttl > 0) setTimeout(() => remove(id), ttl);
    return id;
  }, [remove]);

  const api = useMemo(() => ({ push, remove }), [push, remove]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`px-4 py-2 rounded shadow border ${t.type === 'error' ? 'bg-red-600/90 border-red-500 text-white' : t.type === 'success' ? 'bg-green-600/90 border-green-500 text-white' : 'bg-gray-800/90 border-gray-700 text-white'}`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToasts() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToasts must be used within ToastProvider');
  return ctx;
}
