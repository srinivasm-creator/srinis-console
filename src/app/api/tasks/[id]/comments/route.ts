import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { text, taskId: id },
  });

  return NextResponse.json(comment, { status: 201 });
}
