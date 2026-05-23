import { Router } from "express";
import { db, linksTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { AdminUpdateRoleBody, AdminDeleteLinkParams, AdminUpdateRoleParams } from "@workspace/api-zod";

const router = Router();

// GET /api/admin/users
router.get("/users", async (req, res) => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  return res.json(users);
});

// GET /api/admin/links
router.get("/links", async (req, res) => {
  const links = await db.select().from(linksTable).orderBy(desc(linksTable.createdAt));
  return res.json(links);
});

// DELETE /api/admin/links/:id
router.delete("/links/:id", async (req, res) => {
  const { id } = req.params;
  await db.delete(linksTable).where(eq(linksTable.id, id));
  return res.status(204).send();
});

// PATCH /api/admin/users/:uid/role
router.patch("/users/:uid/role", async (req, res) => {
  const { uid } = req.params;
  const parsed = AdminUpdateRoleBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const [updated] = await db
    .update(usersTable)
    .set({ role: parsed.data.role })
    .where(eq(usersTable.uid, uid))
    .returning();
  if (!updated) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(updated);
});

export default router;
