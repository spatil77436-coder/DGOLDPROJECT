import app from "./app.js";import {env} from "./config/env.js";import {connectDatabase,prisma} from "./config/database.js";
await connectDatabase();const server=app.listen(env.PORT,()=>console.log(`D GOLD API running on port ${env.PORT}`));
async function shutdown(signal){console.log(`${signal} received; shutting down`);server.close(async()=>{await prisma.$disconnect();process.exit(0)})}process.on("SIGINT",()=>shutdown("SIGINT"));process.on("SIGTERM",()=>shutdown("SIGTERM"));
