"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ options: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise((resolve) => setState({ options, resolve }));
  }, []);

  const close = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/55 p-6" onClick={() => close(false)}>
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-[15px] font-semibold">{state.options.title}</h3>
            {state.options.description && <p className="mt-2 text-[13px] text-text-muted">{state.options.description}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => close(false)}
                className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-text-muted hover:bg-surface-2 hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={() => close(true)}
                className={`rounded-lg px-3.5 py-2 text-[13px] font-medium ${
                  state.options.danger ? "bg-danger text-white hover:bg-red-600" : "bg-accent text-bg hover:brightness-110"
                }`}
              >
                {state.options.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
