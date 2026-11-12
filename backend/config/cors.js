import cors from "cors";
import { env } from "./env.js";

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || origin === env.FRONTEND_URL) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
});
