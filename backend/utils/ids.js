import crypto from "node:crypto";
export const makeOrderNumber = () => `DG-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
export const makeTrackingToken = () => crypto.randomBytes(24).toString("base64url");
export const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
