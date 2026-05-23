import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const linksTable = pgTable("links", {
  id: text("id").primaryKey(),
  uid: text("uid").notNull(),
  originalUrl: text("original_url").notNull(),
  directUrl: text("direct_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  fileName: text("file_name").notNull().default("Unknown File"),
  fileType: text("file_type").notNull().default("file"),
  fileSize: text("file_size"),
  downloads: integer("downloads").notNull().default(0),
  reported: boolean("reported").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLinkSchema = createInsertSchema(linksTable).omit({ downloads: true, reported: true, createdAt: true });
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof linksTable.$inferSelect;
