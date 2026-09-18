"use client";

import { useCallback, useEffect, useState } from "react";
import type { Note } from "@/types";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const res = await fetch("/api/notes");
    setNotes(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount
    reload();
  }, [reload]);

  return { notes, loading, reload };
}
