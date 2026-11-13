import {Router} from "express";import {requireAdmin} from "../middleware/auth.middleware.js";import {list} from "./audit.controller.js";const r=Router();r.get("/",requireAdmin,list);export default r;
