export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DONE: "Done",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Comment = {
  id: string;
  text: string;
  taskId: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
  categoryId: string | null;
  category: Category | null;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Stats = {
  open: number;
  done: number;
  overdue: number;
  total: number;
};
