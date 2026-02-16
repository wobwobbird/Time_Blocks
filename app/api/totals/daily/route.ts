import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json(
      { error: "Invalid or missing date, use YYYY-MM-DD" },
      { status: 400 }
    );
  }

  const start = new Date(dateParam + "T00:00:00.000Z");
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const entries = await prisma.timeEntry.findMany({
    where: { date: { gte: start, lt: end } },
    include: { category: true },
  });

  const dailyTotalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);

  const byCategoryMap = new Map<string, number>();
  for (const e of entries) {
    const name = e.category.name;
    byCategoryMap.set(name, (byCategoryMap.get(name) ?? 0) + e.durationHours);
  }
  const byCategory = [...byCategoryMap.entries()].map(([name, hours]) => ({
    name,
    hours,
  }));

  return NextResponse.json({
    dailyTotalHours,
    byCategory,
  });
}
