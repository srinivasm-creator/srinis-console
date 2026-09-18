export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  priority: Priority;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
};
