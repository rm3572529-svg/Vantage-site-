import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

async function getOrCreateSettings() {
  const [existing] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.id, 1));
  if (existing) return existing;
  const [created] = await db
    .insert(siteSettingsTable)
    .values({
      id: 1,
      socialTaskEnabled: "true",
      directDownloadEnabled: "true",
      monetizationEnabled: "false",
      youtubeLink: "https://youtube.com",
      instagramLink: "https://instagram.com",
      whatsappLink: "https://wa.me",
      adsensePublisherId: null,
    })
    .returning();
  return created;
}

function serializeSettings(s: typeof siteSettingsTable.$inferSelect) {
  return {
    ...s,
    socialTaskEnabled: s.socialTaskEnabled === "true",
    directDownloadEnabled: s.directDownloadEnabled === "true",
    monetizationEnabled: s.monetizationEnabled === "true",
  };
}

// GET /api/settings
router.get("/", async (req, res) => {
  const settings = await getOrCreateSettings();
  return res.json(serializeSettings(settings));
});

// PATCH /api/settings
router.patch("/", async (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const current = await getOrCreateSettings();
  const updates: Record<string, string | null> = {};

  if (parsed.data.socialTaskEnabled !== undefined)
    updates.socialTaskEnabled = parsed.data.socialTaskEnabled ? "true" : "false";
  if (parsed.data.directDownloadEnabled !== undefined)
    updates.directDownloadEnabled = parsed.data.directDownloadEnabled ? "true" : "false";
  if (parsed.data.monetizationEnabled !== undefined)
    updates.monetizationEnabled = parsed.data.monetizationEnabled ? "true" : "false";
  if (parsed.data.youtubeLink !== undefined) updates.youtubeLink = parsed.data.youtubeLink;
  if (parsed.data.instagramLink !== undefined) updates.instagramLink = parsed.data.instagramLink;
  if (parsed.data.whatsappLink !== undefined) updates.whatsappLink = parsed.data.whatsappLink;
  if (parsed.data.adsensePublisherId !== undefined)
    updates.adsensePublisherId = parsed.data.adsensePublisherId;

  const [updated] = await db
    .update(siteSettingsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(siteSettingsTable.id, 1))
    .returning();

  return res.json(serializeSettings(updated));
});

export default router;
