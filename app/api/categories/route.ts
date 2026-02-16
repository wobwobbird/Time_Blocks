import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategoryCreateSchema } from "@/lib/schemas";

export async function GET() {
  const categories = await prisma.category.findMany();
  const total = categories.length;
  const res = NextResponse.json(categories);
  res.headers.set("Content-Range", `categories 0-${total ? total - 1 : 0}/${total}`);
  return res;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const result = CategoryCreateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const createdCategory = await prisma.category.create({
    data: { name: result.data.name },
  });

  return NextResponse.json(
    { data: createdCategory },
    { status: 201 }
  );
}
