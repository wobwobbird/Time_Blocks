import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TimeEntryCreateSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = TimeEntryCreateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const category = await prisma.category.findFirst({
    where: { name: result.data.category },
  });
  if (!category) {
    return NextResponse.json(
      { error: "Category not found: " + result.data.category },
      { status: 404 }
    );
  }

  const date = new Date(result.data.date + "T00:00:00.000Z");
  const startOfDay = date;
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const createdEntry = await prisma.timeEntry.create({
    data: {
      date: startOfDay,
      categoryId: category.id,
      durationHours: result.data.durationHours,
      note: result.data.note,
    },
  });

  const aggregate = await prisma.timeEntry.aggregate({
    where: {
      date: { gte: startOfDay, lt: endOfDay },
    },
    _sum: { durationHours: true },
  });
  const dailyTotalHours = aggregate._sum.durationHours ?? 0;

  return NextResponse.json(
    { data: createdEntry, dailyTotalHours },
    { status: 201 }
  );
}
