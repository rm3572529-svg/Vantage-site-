import { Router, type IRouter } from "express";
import healthRouter from "./health";
import linksRouter from "./links";
import usersRouter from "./users";
import analyticsRouter from "./analytics";
import adminRouter from "./admin";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/links", linksRouter);
router.use("/users", usersRouter);
router.use("/analytics", analyticsRouter);
router.use("/admin", adminRouter);
router.use("/settings", settingsRouter);

export default router;
