import { Router } from "express";
import { db, linksTable, usersTable, downloadEventsTable } from "@workspace/db";
import { desc, count, sql } from "drizzle-orm";

const router = Router();

// GET /api/analytics/summary
router.get("/summary", async (req, res) => {
  const [{ totalLinks }] = await db.select({ totalLinks: count() }).from(linksTable);
  const [{ totalUsers }] = await db.select({ totalUsers: count() }).from(usersTable);
  const [{ totalDownloads }] = await db.select({ totalDownloads: sql<number>`coalesce(sum(${linksTable.downloads}), 0)` }).from(linksTable);

  // Today's downloads
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [{ todayDownloads }] = await db
    .select({ todayDownloads: count() })
    .from(downloadEventsTable)
    .where(sql`${downloadEventsTable.createdAt} >= ${todayStart.toISOString()}`);

  // Device breakdown
  const deviceRows = await db
    .select({ device: downloadEventsTable.device, cnt: count() })
    .from(downloadEventsTable)
    .groupBy(downloadEventsTable.device);
  const deviceBreakdown: Record<string, number> = {};
  for (const row of deviceRows) {
    deviceBreakdown[row.device] = Number(row.cnt);
  }

  // Top files
  const topFiles = await db
    .select()
    .from(linksTable)
    .orderBy(desc(linksTable.downloads))
    .limit(5);

  return res.json({
    totalLinks: Number(totalLinks),
    totalDownloads: Number(totalDownloads),
    totalUsers: Number(totalUsers),
    todayDownloads: Number(todayDownloads),
    todayVisitors: Number(todayDownloads), // approximation
    deviceBreakdown,
    topFiles,
  });
});

// GET /api/analytics/popular
router.get("/popular", async (req, res) => {
  const popular = await db
    .select()
    .from(linksTable)
    .orderBy(desc(linksTable.downloads))
    .limit(10);
  return res.json(popular);
});

export default router;
