"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, Task } from "@/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [tasksRes, categoriesRes] = await Promise.all([
      fetch("/api/tasks"),
      fetch("/api/categories"),
    ]);
    setTasks(await tasksRes.json());
    setCategories(await categoriesRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount
    reload();
  }, [reload]);

  return { tasks, categories, loading, reload };
}
