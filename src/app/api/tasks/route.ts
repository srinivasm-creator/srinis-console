import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: { category: true, comments: { orderBy: { createdAt: "asc" } } },
    orderBy: [{ createdAt: "desc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: body.description || null,
      priority: body.priority ?? "MEDIUM",
      status: body.status ?? "TODO",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      categoryId: body.categoryId || null,
    },
    include: { category: true, comments: true },
  });

  return NextResponse.json(task, { status: 201 });
}
