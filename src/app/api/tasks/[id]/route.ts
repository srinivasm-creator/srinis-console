import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if ("description" in body) data.description = body.description || null;
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.priority === "string") data.priority = body.priority;
  if ("dueDate" in body) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (Array.isArray(body.tags)) data.tags = body.tags;
  if ("categoryId" in body) data.categoryId = body.categoryId || null;

  const task = await prisma.task.update({
    where: { id },
    data,
    include: { category: true, comments: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(task);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
