"use client";

import { useEffect, useState, useCallback, createContext, useContext } from "react";
import { Check, X, Warning } from "@phosphor-icons/react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <ToastMessage key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastMessage({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <Check weight="bold" className="text-green-400" />,
    error: <Warning weight="bold" className="text-red-400" />,
    info: <Check weight="bold" className="text-nag-orange" />,
  };

  const borders = {
    success: "border-green-800",
    error: "border-red-800",
    info: "border-nag-orange/50",
  };

  return (
    <div
      className={`bg-zinc-900 border ${borders[item.type]} rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg animate-[float-up_0.3s_ease-out]`}
    >
      {icons[item.type]}
      <span className="text-sm font-medium text-white flex-1">
        {item.message}
      </span>
      <button
        onClick={onDismiss}
        className="text-zinc-500 hover:text-white transition-colors"
      >
        <X weight="bold" className="text-sm" />
      </button>
    </div>
  );
}
