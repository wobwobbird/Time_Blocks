"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

function todayYYYYMMDD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function last7Days(): string[] {
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}

type DailyRes = { dailyTotalHours: number; byCategory: { name: string; hours: number }[] };
type WeeklyRes = { weeklyTotalHours: number; byCategory: { name: string; hours: number }[] };
type TimeEntry = {
  id: number;
  date: string;
  categoryId: number;
  durationHours: number;
  note: string;
  createdAt: string;
  categoryName?: string;
};

export default function Dashboard() {
  const [daily, setDaily] = useState<DailyRes | null>(null);
  const [weekly, setWeekly] = useState<WeeklyRes | null>(null);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const date = todayYYYYMMDD();
    const days = last7Days();
    Promise.all([
      fetch(`/api/totals/daily?date=${date}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Daily failed")))),
      fetch(`/api/totals/weekly?date=${date}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Weekly failed")))),
      ...days.map((d) =>
        fetch(`/api/time_entries?date=${d}`).then((r) => (r.ok ? r.json() : []))
      ),
    ])
      .then(([dailyRes, weeklyRes, ...dayArrays]) => {
        setDaily(dailyRes);
        setWeekly(weeklyRes);
        const flat = (dayArrays as TimeEntry[][]).flat();
        const byId = new Map(flat.map((e) => [e.id, e]));
        const merged = [...byId.values()].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentEntries(merged);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography sx={{ p: 2 }}>Loading totals…</Typography>;
  if (error) return <Typography color="error" sx={{ p: 2 }}>Error: {error}</Typography>;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const last7ByCategory = (() => {
    const map = new Map<string, number>();
    for (const e of recentEntries) {
      const name = e.categoryName ?? String(e.categoryId);
      map.set(name, (map.get(name) ?? 0) + e.durationHours);
    }
    return [...map.entries()].map(([name, hours]) => ({ name, hours })).sort((a, b) => b.hours - a.hours);
  })();

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
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
        {last7ByCategory.length > 0 && (
          <Card sx={{ minWidth: 280, flex: "1 1 300px" }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Last 7 days by category
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {last7ByCategory.map(({ name, hours }) => (
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

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography color="text.secondary" gutterBottom variant="h6">
            Time entries – last 7 days
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Hours</TableCell>
                  <TableCell>Note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No entries in the last 7 days
                    </TableCell>
                  </TableRow>
                ) : (
                  recentEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.categoryName ?? entry.categoryId}</TableCell>
                      <TableCell align="right">{entry.durationHours.toFixed(1)}</TableCell>
                      <TableCell>{entry.note}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
