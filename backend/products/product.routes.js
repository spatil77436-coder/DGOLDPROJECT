import { Router } from "express";
import { list, listAll, getOne, create, update, remove } from "./product.controller.js";
import { requireAdmin } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/", list); router.get("/admin/all", requireAdmin, listAll); router.get("/:id", getOne);
router.post("/", requireAdmin, create); router.patch("/:id", requireAdmin, update); router.delete("/:id", requireAdmin, remove);
export default router;
