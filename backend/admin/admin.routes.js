import { Router } from "express";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { dashboard } from "./admin.controller.js";
const r = Router();
r.use(requireAdmin);
r.get("/dashboard", dashboard);
export default r;
