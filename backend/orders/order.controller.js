import { asyncHandler } from "../utils/asyncHandler.js"; import { ok } from "../utils/ApiResponse.js"; import * as service from "./order.service.js";
export const create=asyncHandler(async(req,res)=>ok(res,await service.create(req.body),"Booking received",201));
export const track=asyncHandler(async(req,res)=>ok(res,await service.track(req.params.orderNumber,req.query.phone)));
export const list=asyncHandler(async(req,res)=>ok(res,await service.list(req.query)));
export const updateStatus=asyncHandler(async(req,res)=>ok(res,await service.updateStatus(req.admin.id,req.params.id,req.body),"Order updated"));
export const updateCod=asyncHandler(async(req,res)=>ok(res,await service.updateCod(req.admin.id,req.params.id,req.body.codCollected),"COD collection updated"));
