import { Router } from "express";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { list, movements, adjust } from "./inventory.controller.js";
const r = Router();
r.use(requireAdmin);
r.get("/", list);
r.get("/movements", movements);
r.post("/adjust", adjust);
export default r;
