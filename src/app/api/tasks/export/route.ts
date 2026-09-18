import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/types";
import type { TaskStatus, Priority } from "@/types";

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const header = ["Title", "Status", "Priority", "Category", "Due date", "Tags", "Description"];
  const rows = tasks.map((t) =>
    [
      t.title,
      STATUS_LABEL[t.status as TaskStatus],
      PRIORITY_LABEL[t.priority as Priority],
      t.category?.name ?? "",
      t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "",
      t.tags.join(", "),
      t.description ?? "",
    ]
      .map(csvCell)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="tasks.csv"`,
    },
  });
}
