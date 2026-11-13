import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/ApiResponse.js";
import * as s from "./inventory.service.js";
export const list = asyncHandler(async (_q, res) => ok(res, await s.list()));
export const movements = asyncHandler(async (req, res) =>
  ok(res, await s.movements(req.query)),
);
export const adjust = asyncHandler(async (req, res) =>
  ok(res, await s.adjust(req.admin.id, req.body), "Stock adjusted"),
);
