import { prisma } from "../config/database.js"; import { ApiError } from "../utils/ApiError.js"; import { makeOrderNumber,makeTrackingToken,sha256 } from "../utils/ids.js";
const publicSelect={id:true,orderNumber:true,status:true,createdAt:true,deliveryDate:true,slot:true,productName:true,packLabel:true,grams:true,quantity:true,total:true,history:{select:{status:true,createdAt:true},orderBy:{createdAt:"asc"}}};
export async function create(input){
 const {customer,item,deliveryDate,slot,instructions}=input;
 if(!customer||!item||!deliveryDate||!slot)throw new ApiError(422,"Booking details are incomplete");
 if(!customer.name||!/^\d{10}$/.test(String(customer.phone))||!customer.area||!customer.address||!/^\d{6}$/.test(String(customer.pin)))throw new ApiError(422,"Valid customer name, 10-digit phone, address and 6-digit PIN are required");
 if(!Number.isInteger(item.qty)||item.qty<1||item.qty>999)throw new ApiError(422,"Quantity must be between 1 and 999");
 const settings=await prisma.businessSettings.findUnique({where:{id:"main"}});
 if(settings?.blockedPins.includes(String(customer.pin)))throw new ApiError(422,"Delivery is not available for this PIN code");
 if(settings && settings.extraPins.length===0 && !String(customer.pin).startsWith("560"))throw new ApiError(422,"Delivery is currently available only in supported Bengaluru PIN codes");
 if(settings && settings.extraPins.length>0 && !String(customer.pin).startsWith("560") && !settings.extraPins.includes(String(customer.pin)))throw new ApiError(422,"Delivery is not available for this PIN code");
 const token=makeTrackingToken();
 const result=await prisma.$transaction(async tx=>{
  const product=await tx.product.findUnique({where:{id:item.productId},include:{packs:true}}); const pack=product?.packs.find(p=>p.id===item.packId);
  if(!product?.available||!pack)throw new ApiError(409,"Selected product or pouch is unavailable");
  let updatedPack=pack; if(pack.trackStock){const changed=await tx.productPack.updateMany({where:{id:pack.id,stock:{gte:item.qty}},data:{stock:{decrement:item.qty}}});if(!changed.count)throw new ApiError(409,"Insufficient stock. Please refresh and try again.");updatedPack=await tx.productPack.findUnique({where:{id:pack.id}})}
  const price=pack.price; const total=price===null?null:price*item.qty;
  let retailer=await tx.retailer.findFirst({where:{phone:customer.phone,pin:customer.pin}});
  if(retailer)retailer=await tx.retailer.update({where:{id:retailer.id},data:{name:customer.name,area:customer.area,address:customer.address}});else retailer=await tx.retailer.create({data:{...customer}});
  const order=await tx.order.create({data:{orderNumber:makeOrderNumber(),trackingHash:sha256(token),retailerId:retailer.id,productId:product.id,packId:pack.id,productName:product.name,packLabel:pack.label,grams:pack.grams,unitPrice:price,quantity:item.qty,deliveryDate:new Date(`${deliveryDate}T00:00:00.000Z`),slot,instructions:instructions||null,total,paymentMethod:"COD",history:{create:{status:"pending",note:"Booking received"}}},select:publicSelect});
  if(pack.trackStock)await tx.stockLog.create({data:{productId:product.id,packId:pack.id,delta:-item.qty,balance:updatedPack.stock,note:`Order ${order.orderNumber}`}});
  return order;
 });
 return {...result,trackingToken:token};
}
export async function track(orderNumber,phone){if(!phone)throw new ApiError(400,"Phone number is required");const order=await prisma.order.findFirst({where:{orderNumber,retailer:{phone}},select:publicSelect});if(!order)throw new ApiError(404,"Order not found. Check the order ID and phone number.");return order}
export async function list(query){const page=Math.max(1,Number(query.page)||1),limit=Math.min(100,Math.max(1,Number(query.limit)||50));const where=query.status?{status:query.status}:{};const [items,total]=await prisma.$transaction([prisma.order.findMany({where,include:{retailer:true,history:{orderBy:{createdAt:"asc"}}},orderBy:{createdAt:"desc"},skip:(page-1)*limit,take:limit}),prisma.order.count({where})]);return {items,total,page,limit}}
export async function updateStatus(adminId,id,{status,note}){const allowed=["pending","confirmed","preparing","out_for_delivery","delivered","cancelled"];if(!allowed.includes(status))throw new ApiError(422,"Invalid order status");return prisma.$transaction(async tx=>{const order=await tx.order.findUnique({where:{id}});if(!order)throw new ApiError(404,"Order not found");if(order.status==="delivered"||order.status==="cancelled")throw new ApiError(409,"This order is already closed");if(status==="cancelled"&&order.status!=="cancelled"){const pack=await tx.productPack.findUnique({where:{id:order.packId}});if(pack?.trackStock)await tx.productPack.update({where:{id:pack.id},data:{stock:{increment:order.quantity}}})}const updated=await tx.order.update({where:{id},data:{status,history:{create:{status,note:note||null}}},include:{retailer:true,history:{orderBy:{createdAt:"asc"}}}});await tx.auditLog.create({data:{adminId,action:"ORDER_STATUS_UPDATED",entity:"Order",entityId:id,details:{from:order.status,to:status,note:note||null}}});return updated})}
export async function updateCod(adminId,id,codCollected){if(typeof codCollected!=="boolean")throw new ApiError(422,"codCollected must be boolean");const order=await prisma.order.findUnique({where:{id}});if(!order)throw new ApiError(404,"Order not found");const updated=await prisma.order.update({where:{id},data:{codCollected}});await prisma.auditLog.create({data:{adminId,action:"COD_COLLECTION_UPDATED",entity:"Order",entityId:id,details:{codCollected}}});return updated}
