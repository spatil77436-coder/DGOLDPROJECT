import { asyncHandler } from "../utils/asyncHandler.js"; import { ok } from "../utils/ApiResponse.js"; import * as service from "./product.service.js";
export const listAll = asyncHandler(async (_req,res)=>ok(res,await service.list(true)));
export const list = asyncHandler(async (req,res)=>ok(res,await service.list(req.query.admin === "true" && req.admin)));
export const getOne = asyncHandler(async(req,res)=>ok(res,await service.getOne(req.params.id)));
export const create = asyncHandler(async(req,res)=>ok(res,await service.create(req.body),"Product created",201));
export const update = asyncHandler(async(req,res)=>ok(res,await service.update(req.params.id,req.body),"Product updated"));
export const remove = asyncHandler(async(req,res)=>{await service.remove(req.params.id);ok(res,null,"Product archived")});
