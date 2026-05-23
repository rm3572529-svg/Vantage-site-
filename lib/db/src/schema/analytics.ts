import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const downloadEventsTable = pgTable("download_events", {
  id: text("id").primaryKey(),
  linkId: text("link_id").notNull(),
  device: text("device").notNull().default("desktop"),
  country: text("country"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettingsTable = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  socialTaskEnabled: text("social_task_enabled").notNull().default("true"),
  directDownloadEnabled: text("direct_download_enabled").notNull().default("true"),
  monetizationEnabled: text("monetization_enabled").notNull().default("false"),
  youtubeLink: text("youtube_link").notNull().default("https://youtube.com"),
  instagramLink: text("instagram_link").notNull().default("https://instagram.com"),
  whatsappLink: text("whatsapp_link").notNull().default("https://wa.me"),
  adsensePublisherId: text("adsense_publisher_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDownloadEventSchema = createInsertSchema(downloadEventsTable).omit({ createdAt: true });
export type InsertDownloadEvent = z.infer<typeof insertDownloadEventSchema>;
export type DownloadEvent = typeof downloadEventsTable.$inferSelect;

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
