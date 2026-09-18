"use client";

import { useEffect, useMemo, useRef } from "react";

export function useDebouncedAutosave<Args extends unknown[]>(fn: (...args: Args) => Promise<unknown>, delayMs = 600) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const state = useRef({
    timer: undefined as ReturnType<typeof setTimeout> | undefined,
    inFlight: false,
    pendingArgs: null as Args | null,
  });

  return useMemo(() => {
    const runNow = async (args: Args) => {
      if (state.current.inFlight) {
        state.current.pendingArgs = args;
        return;
      }
      state.current.inFlight = true;
      try {
        await fnRef.current(...args);
      } finally {
        state.current.inFlight = false;
        if (state.current.pendingArgs) {
          const next = state.current.pendingArgs;
          state.current.pendingArgs = null;
          runNow(next);
        }
      }
    };

    return (...args: Args) => {
      clearTimeout(state.current.timer);
      state.current.timer = setTimeout(() => runNow(args), delayMs);
    };
  }, [delayMs]);
}
