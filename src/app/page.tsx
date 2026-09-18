import { prisma } from "@/lib/prisma";
import TaskBoard from "@/components/TaskBoard";
import type { Task } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await prisma.task.findMany({
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });

  const tasks: Task[] = rows.map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    priority: t.priority,
    completed: t.completed,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <main className="flex-1 px-4 py-10 sm:py-16">
      <TaskBoard initialTasks={tasks} />
    </main>
  );
}
