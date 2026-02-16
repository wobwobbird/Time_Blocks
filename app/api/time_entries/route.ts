import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TimeEntryCreateSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const categoryIdParam = searchParams.get("categoryId");

  const where: { date?: { gte: Date; lt: Date }; categoryId?: number } = {};

  if (dateParam) {
    const dateStr = dateParam;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: "Invalid date format, use YYYY-MM-DD" },
        { status: 400 }
      );
    }
    const start = new Date(dateStr + "T00:00:00.000Z");
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    where.date = { gte: start, lt: end };
  }

  if (categoryIdParam !== null && categoryIdParam !== "") {
    const categoryId = parseInt(categoryIdParam, 10);
    if (Number.isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid categoryId" },
        { status: 400 }
      );
    }
    where.categoryId = categoryId;
  }

  const entries = await prisma.timeEntry.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const data = entries.map((entry) => ({
    ...entry,
    categoryName: entry.category.name,
  }));

  const total = data.length;
  const res = NextResponse.json(data);
  res.headers.set("Content-Range", `time_entries 0-${total ? total - 1 : 0}/${total}`);
  return res;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const { date, category: categoryName, categoryId, durationHours, note } = raw;

  let category: { id: number; name: string } | null = null;

  if (categoryId !== undefined && categoryId !== null) {
    const id = typeof categoryId === "number" ? categoryId : parseInt(String(categoryId), 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }
    category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found: " + categoryId },
        { status: 404 }
      );
    }
  } else if (categoryName !== undefined && categoryName !== null && String(categoryName).trim()) {
    category = await prisma.category.findFirst({
      where: { name: String(categoryName).trim() },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found: " + categoryName },
        { status: 404 }
      );
    }
  }

  if (!category) {
    return NextResponse.json(
      { error: "Provide category or categoryId" },
      { status: 400 }
    );
  }

  const toValidate = {
    date: date ?? "",
    category: category.name,
    durationHours,
    note: note ?? "",
  };

  const result = TimeEntryCreateSchema.safeParse(toValidate);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const dateObj = new Date(result.data.date + "T00:00:00.000Z");

  const createdEntry = await prisma.timeEntry.create({
    data: {
      date: dateObj,
      categoryId: category.id,
      durationHours: result.data.durationHours,
      note: result.data.note,
    },
  });

  return NextResponse.json({ data: createdEntry }, { status: 201 });
}
