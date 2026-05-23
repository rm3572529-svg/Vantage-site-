import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  GetUserParams,
  UpdateUserParams,
  UpdateUserBody,
  CompleteTaskParams,
  CompleteTaskBody,
} from "@workspace/api-zod";

const router = Router();

// GET /api/users/:uid
router.get("/:uid", async (req, res) => {
  const { uid } = req.params;
  let [user] = await db.select().from(usersTable).where(eq(usersTable.uid, uid));
  if (!user) {
    // Check if any admin exists — if not, make this the first admin
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"));
    const isFirstAdmin = count === 0;

    [user] = await db
      .insert(usersTable)
      .values({
        uid,
        email: "",
        displayName: null,
        photoURL: null,
        role: isFirstAdmin ? "admin" : "user",
        linksUsed: 0,
        linksLimit: isFirstAdmin ? 9999 : 25,
        tasksCompleted: [],
      })
      .returning();
  }
  return res.json(user);
});

// PATCH /api/users/:uid
router.patch("/:uid", async (req, res) => {
  const { uid } = req.params;
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.uid, uid))
    .returning();
  if (!updated) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(updated);
});

// POST /api/users/:uid/complete-task
router.post("/:uid/complete-task", async (req, res) => {
  const { uid } = req.params;
  const parsed = CompleteTaskBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.uid, uid));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const task = parsed.data.task;
  if (user.tasksCompleted.includes(task)) {
    return res.json(user); // Already completed
  }

  const newTasks = [...user.tasksCompleted, task];
  // All 3 tasks complete → grant +50 links
  const bonusLinks = newTasks.length === 3 ? 50 : 0;

  const [updated] = await db
    .update(usersTable)
    .set({
      tasksCompleted: newTasks,
      linksLimit: user.linksLimit + bonusLinks,
    })
    .where(eq(usersTable.uid, uid))
    .returning();

  return res.json(updated);
});

export default router;
