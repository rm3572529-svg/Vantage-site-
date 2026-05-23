import { Router } from "express";
import { db, linksTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod/v4";
import {
  GetLinksQueryParams,
  CreateLinkBody,
  GetLinkParams,
  DeleteLinkParams,
  RecordDownloadParams,
  RecordDownloadBody,
  ReportLinkParams,
  ReportLinkBody,
} from "@workspace/api-zod";
import { downloadEventsTable } from "@workspace/db";

const router = Router();

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function extractGoogleDriveId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function detectFileType(url: string): { fileName: string; fileType: string } {
  const id = extractGoogleDriveId(url);
  return {
    fileName: id ? `File-${id.substring(0, 8)}` : "Unknown File",
    fileType: "file",
  };
}

// GET /api/links?uid=...
router.get("/", async (req, res) => {
  const parsed = GetLinksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "uid is required" });
  }
  const links = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.uid, parsed.data.uid))
    .orderBy(desc(linksTable.createdAt));
  return res.json(links);
});

// POST /api/links
router.post("/", async (req, res) => {
  const parsed = CreateLinkBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { uid, originalUrl, customSlug } = parsed.data;

  // Check user link limit
  const [user] = await db.select().from(usersTable).where(eq(usersTable.uid, uid));
  if (user && user.linksUsed >= user.linksLimit) {
    return res.status(403).json({ error: "Link limit reached. Complete social tasks to unlock more." });
  }

  const fileId = extractGoogleDriveId(originalUrl);
  if (!fileId) {
    return res.status(400).json({ error: "Invalid Google Drive URL" });
  }

  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const shortCode = customSlug || Math.random().toString(36).substring(2, 10);
  const { fileName, fileType } = detectFileType(originalUrl);

  const [link] = await db
    .insert(linksTable)
    .values({
      id: generateId(),
      uid,
      originalUrl,
      directUrl,
      shortCode,
      fileName,
      fileType,
    })
    .returning();

  // Increment user link count
  if (user) {
    await db
      .update(usersTable)
      .set({ linksUsed: user.linksUsed + 1 })
      .where(eq(usersTable.uid, uid));
  }

  return res.status(201).json(link);
});

// GET /api/links/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  // Try by shortCode first, then by id
  let [link] = await db.select().from(linksTable).where(eq(linksTable.shortCode, id));
  if (!link) {
    [link] = await db.select().from(linksTable).where(eq(linksTable.id, id));
  }
  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }
  return res.json(link);
});

// DELETE /api/links/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const [link] = await db.select().from(linksTable).where(eq(linksTable.id, id));
  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }
  // Decrement user link count
  const [user] = await db.select().from(usersTable).where(eq(usersTable.uid, link.uid));
  if (user && user.linksUsed > 0) {
    await db.update(usersTable).set({ linksUsed: user.linksUsed - 1 }).where(eq(usersTable.uid, link.uid));
  }
  await db.delete(linksTable).where(eq(linksTable.id, id));
  return res.status(204).send();
});

// POST /api/links/:id/download
router.post("/:id/download", async (req, res) => {
  const { id } = req.params;
  const parsed = RecordDownloadBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  // Find by shortCode or id
  let [link] = await db.select().from(linksTable).where(eq(linksTable.shortCode, id));
  if (!link) {
    [link] = await db.select().from(linksTable).where(eq(linksTable.id, id));
  }
  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }

  // Record download event
  await db.insert(downloadEventsTable).values({
    id: generateId(),
    linkId: link.id,
    device: parsed.data.device,
    country: parsed.data.country ?? null,
  });

  // Increment downloads
  const [updated] = await db
    .update(linksTable)
    .set({ downloads: link.downloads + 1 })
    .where(eq(linksTable.id, link.id))
    .returning();

  return res.json(updated);
});

// POST /api/links/:id/report
router.post("/:id/report", async (req, res) => {
  const { id } = req.params;
  const parsed = ReportLinkBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  let [link] = await db.select().from(linksTable).where(eq(linksTable.shortCode, id));
  if (!link) {
    [link] = await db.select().from(linksTable).where(eq(linksTable.id, id));
  }
  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }
  await db.update(linksTable).set({ reported: true }).where(eq(linksTable.id, link.id));
  return res.json({ success: true });
});

export default router;
