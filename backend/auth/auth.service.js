import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
const hash = (s) => createHash("sha256").update(s).digest("hex");
const access = (admin) => jwt.sign({ type: "access" }, env.JWT_ACCESS_SECRET, { subject: admin.id, expiresIn: `${env.ACCESS_TOKEN_MINUTES}m` });
async function issue(admin) { const token = randomBytes(48).toString("base64url"); await prisma.adminSession.create({ data: { adminId: admin.id, refreshTokenHash: hash(token), expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 86400000) } }); return { accessToken: access(admin), refreshToken: token, admin: { id: admin.id, email: admin.email } }; }
export async function login({ email, password }) { const admin = await prisma.admin.findUnique({ where: { email: String(email).toLowerCase() } }); if (!admin?.active || !(await argon2.verify(admin.passwordHash, password))) throw new ApiError(401, "Invalid email or password"); return issue(admin); }
export async function refresh(token) { if (!token) throw new ApiError(401, "Refresh session missing"); const session = await prisma.adminSession.findUnique({ where: { refreshTokenHash: hash(token) }, include: { admin: true } }); if (!session || session.revokedAt || session.expiresAt < new Date() || !session.admin.active) throw new ApiError(401, "Refresh session expired"); await prisma.adminSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } }); return issue(session.admin); }
export async function logout(token) { if (token) await prisma.adminSession.updateMany({ where: { refreshTokenHash: hash(token), revokedAt: null }, data: { revokedAt: new Date() } }); }
export async function changePassword(id, { currentPassword, newPassword }) { const admin = await prisma.admin.findUnique({ where: { id } }); if (!admin || !(await argon2.verify(admin.passwordHash, currentPassword))) throw new ApiError(400, "Current password is incorrect"); await prisma.$transaction([prisma.admin.update({ where: { id }, data: { passwordHash: await argon2.hash(newPassword) } }), prisma.adminSession.updateMany({ where: { adminId: id, revokedAt: null }, data: { revokedAt: new Date() } })]); }
