"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

function todayYYYYMMDD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type DailyRes = { dailyTotalHours: number; byCategory: { name: string; hours: number }[] };
type WeeklyRes = { weeklyTotalHours: number; byCategory: { name: string; hours: number }[] };

export default function Dashboard() {
  const [daily, setDaily] = useState<DailyRes | null>(null);
  const [weekly, setWeekly] = useState<WeeklyRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const date = todayYYYYMMDD();
    Promise.all([
      fetch(`/api/totals/daily?date=${date}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Daily failed")))),
      fetch(`/api/totals/weekly?date=${date}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Weekly failed")))),
    ])
      .then(([dailyRes, weeklyRes]) => {
        setDaily(dailyRes);
        setWeekly(weeklyRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography sx={{ p: 2 }}>Loading totals…</Typography>;
  if (error) return <Typography color="error" sx={{ p: 2 }}>Error: {error}</Typography>;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 2 }}>
      <Card sx={{ minWidth: 200 }}>
        <CardContent>
          <Typography color="text.secondary" gutterBottom>
            Today total
          </Typography>
          <Typography variant="h4">
            {(daily?.dailyTotalHours ?? 0).toFixed(1)} h
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ minWidth: 200 }}>
        <CardContent>
          <Typography color="text.secondary" gutterBottom>
            This week total
          </Typography>
          <Typography variant="h4">
            {(weekly?.weeklyTotalHours ?? 0).toFixed(1)} h
          </Typography>
        </CardContent>
      </Card>
      {weekly?.byCategory && weekly.byCategory.length > 0 && (
        <Card sx={{ minWidth: 280, flex: "1 1 300px" }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              This week by category
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {weekly.byCategory.map(({ name, hours }) => (
                <li key={name}>
                  <Typography component="span">{name}: </Typography>
                  <Typography component="span" fontWeight="medium">
                    {hours.toFixed(1)} h
                  </Typography>
                </li>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
