import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({ select: { status: true, dueDate: true } });

  const now = new Date();
  const done = tasks.filter((t) => t.status === "DONE").length;
  const open = tasks.length - done;
  const overdue = tasks.filter(
    (t) => t.status !== "DONE" && t.dueDate && t.dueDate < now
  ).length;

  return NextResponse.json({ open, done, overdue, total: tasks.length });
}
