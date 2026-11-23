
import cors from "cors";
import { env } from "./env.js";

const allowedOrigins = [
  env.FRONTEND_URL,
  "https://dgoldproject-c46uiwipq-sagarrohit.vercel.app",
];

export const corsMiddleware = cors({
  origin(origin, callback) {
    // Allow requests without an Origin header
    if (!origin) {
      return callback(null, true);
    }

    // Allow the configured frontend
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments
    const vercelOriginPattern =
      /^https:\/\/dgoldproject-[a-z0-9-]+-sagarrohit\.vercel\.app$/;

    if (vercelOriginPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
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
