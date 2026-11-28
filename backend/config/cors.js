
import cors from "cors";
import { env } from "./env.js";

const cleanUrl = (url) => (url ? url.trim().replace(/\/$/, "") : "");

const allowedOrigins = [
  "http://localhost:5173",
  "https://dgoldproject-sigma.vercel.app/", " https://www.dgoldsupari.com"  // ✅ quoted, no trailing slash
].filter(Boolean);

export const corsMiddleware = cors({
  origin(origin, callback) {
    // Allow requests without an Origin header (e.g. server-to-server or curl)
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = cleanUrl(origin);

    // Allow the configured frontend
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow all Vercel deployments for this project (production and preview)
    const vercelOriginPattern =
      /^https:\/\/dgoldproject.*\.vercel\.app$/;

    if (vercelOriginPattern.test(cleanOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
});
