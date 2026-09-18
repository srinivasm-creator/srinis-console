import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

const PALETTE = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#f97316", "#71717a"];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const color = body.color || PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const category = await prisma.category.create({ data: { name, color } });
  return NextResponse.json(category, { status: 201 });
}
