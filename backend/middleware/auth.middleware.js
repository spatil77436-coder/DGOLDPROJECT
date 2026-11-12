import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";

export async function requireAdmin(req, _res, next) {
  try {
    const token = req.cookies?.dg_access || req.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) throw new ApiError(401, "Admin authentication required");
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.type !== "access" || !payload.sub) throw new ApiError(401, "Invalid access token");
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, active: true } });
    if (!admin?.active) throw new ApiError(401, "Admin account is unavailable");
    req.admin = admin;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired session"));
  }
}
