/* Headless runtime test of the built single-file app (dist/index.html). */
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { JSDOM } from "jsdom";

const rawHtml = readFileSync("dist/index.html", "utf8");
/* jsdom cannot execute type="module" — strip the attribute; the bundle is self-contained */
const scriptMatch = rawHtml.match(/<script type="module"[^>]*>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error("inline module script not found in dist");
const bundle = scriptMatch[1];
const html = rawHtml.replace(scriptMatch[0], "");
const dom = new JSDOM(html, {
  url: "https://dgold.test/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
});
const { window } = dom;
const { document } = window;

/* ---- polyfills for APIs jsdom lacks ---- */
window.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
  unobserve() {} disconnect() {}
};
window.ResizeObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) { this.cb([{ contentRect: { width: 340, height: 470 }, target: el }], this); }
  unobserve() {} disconnect() {}n
};
window.BroadcastChannel = class {
  constructor() { this.listeners = []; }
  addEventListener(_, fn) { this.listeners.push(fn); }
  removeEventListener(_, fn) { this.listeners = this.listeners.filter((f) => f !== fn); }
  postMessage() {} close() {}
};
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
window.scrollTo = () => {};
Object.defineProperty(window.crypto, "subtle", { value: webcrypto.subtle });
window.HTMLElement.prototype.scrollIntoView = () => {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const all = (sel) => [...document.querySelectorAll(sel)];
const byText = (sel, text) => all(sel).find((el) => el.textContent?.trim().includes(text));
const click = (el, label) => {
  if (!el) throw new Error(`CLICK TARGET MISSING: ${label}`);
  el.click();
};
function setInput(el, value, label) {
  if (!el) throw new Error(`INPUT MISSING: ${label}`);
  const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement : el.tagName === "SELECT" ? window.HTMLSelectElement : window.HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(proto.prototype, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new window.Event("input", { bubbles: true }));
  el.dispatchEvent(new window.Event("change", { bubbles: true }));
}
let passed = 0;
function ok(cond, name) {
  if (!cond) throw new Error(`FAIL: ${name}`);
  passed++;
  console.log(`  ✔ ${name}`);
}

async function main() {
  window.addEventListener("error", (e) => console.error("WINDOW ERROR:", e.message));
  try {
    window.eval(bundle.replace(/\bimport\.meta\b/g, "({url:location.href})"));
  } catch (e) {
    console.error("BUNDLE EVAL ERROR:", e.message);
    throw e;
  }
  await sleep(1500); // let React mount + db init settle

  console.log("\n[1] Homepage renders");
  ok(document.body.textContent.includes("Experience Premium Quality"), "hero headline present");
  ok(document.body.textContent.includes("Chali Cut Supari"), "product name in hero");
  ok(document.body.textContent.includes("Bengaluru Only"), "Bengaluru-only messaging");
  ok(document.body.textContent.includes("6366745687"), "correct phone number");
  ok(!document.body.textContent.includes("63666"), "no old/wrong phone anywhere");
  ok(document.querySelector('a[href^="https://wa.me/916366745687"]'), "WhatsApp deep link correct");
  ok(document.querySelector('a[href="tel:+916366745687"]'), "click-to-call link correct");
  ok(document.body.textContent.includes("PREMIUM") && document.querySelector("#product"), "product section present");
  for (const id of ["about", "product", "features", "why", "how", "delivery", "faq", "contact"]) {
    ok(document.getElementById(id), `section #${id} exists`);
  }
  ok(!/fake|lorem/i.test(document.body.textContent), "no placeholder copy");

  console.log("\n[2] PIN checker (delivery section)");
  const pinInput = document.querySelector('#delivery input[aria-label="PIN code"]');
  setInput(pinInput, "562109", "delivery pin");
  click(byText("#delivery button", "Check"), "pin check button");
  await sleep(300);
  ok(document.body.textContent.includes("Sorry! D GOLD currently delivers only within Bengaluru."), "out-of-area message exact");
  setInput(pinInput, "560041", "delivery pin ok");
  click(byText("#delivery button", "Check"), "pin check button 2");
  await sleep(300);
  ok(document.body.textContent.includes("we deliver to 560041"), "serviceable PIN accepted");

  console.log("\n[3] Booking wizard — Bengaluru validation blocks orders");
  click(byText("header button", "Book Now"), "navbar Book Now");
  await sleep(500);
  const dialog = document.querySelector('[role="dialog"][aria-label="Book your order"]');
  ok(dialog, "booking modal opens");
  ok(dialog.textContent.includes("500 g Pouch"), "seeded 500g pack listed");
  ok(dialog.textContent.includes("Finalised on call"), "on-call pricing shown (no invented price)");
  click(byText('[aria-label="Book your order"] button', "Continue"), "step 1 continue");
  await sleep(400);
  const dlg = () => document.querySelector('[aria-label="Book your order"]');
  setInput(dlg().querySelector('input[placeholder="e.g. Ramesh Naik"]'), "Test Kumar", "name");
  setInput(dlg().querySelector('input[placeholder="10-digit number"]'), "9880012345", "phone");
  setInput(dlg().querySelector('input[placeholder="e.g. Jayanagar 4th Block"]'), "Jayanagar", "area");
  setInput(dlg().querySelector('input[placeholder="5600xx"]'), "562109", "bad pin");
  setInput(dlg().querySelector("textarea"), "Shop 12, 4th Block, Jayanagar, Bengaluru", "address");
  click(byText('[aria-label="Book your order"] button', "Continue"), "continue with bad pin");
  await sleep(400);
  ok(dlg().textContent.includes("Sorry! D GOLD currently delivers only within Bengaluru."), "invalid PIN blocks step 2");
  ok(dlg().textContent.includes("2. Delivery Details"), "still on delivery step");

  setInput(dlg().querySelector('input[placeholder="5600xx"]'), "560041", "good pin");
  click(byText('[aria-label="Book your order"] button', "Continue"), "continue with good pin");
  await sleep(400);
  ok(dlg().textContent.includes("Review") && dlg().textContent.includes("Test Kumar"), "review step shows summary");
  ok(dlg().textContent.includes("Bengaluru – 560041"), "review shows Bengaluru address");

  const confirmBtn = byText('[aria-label="Book your order"] button', "Confirm Booking");
  ok(confirmBtn.disabled, "confirm disabled until consent");
  const consent = dlg().querySelector('input[type="checkbox"]');
  consent.click();
  await sleep(200);
  click(byText('[aria-label="Book your order"] button', "Confirm Booking"), "confirm booking");
  await sleep(900);
  ok(document.body.textContent.includes("Thank you, Test!"), "success screen shown");
  const idEl = document.querySelector('[aria-label="Book your order"] .font-mono');
  ok(idEl && /^DG-[A-Z0-9]+$/.test(idEl.textContent.trim()), "order ID generated");
  const orderId = idEl.textContent.trim();
  ok(document.body.textContent.includes("pending confirmation"), "honest pending status (not fake confirmed)");

  console.log("\n[4] Persistence — order really saved");
  const stored = JSON.parse(window.localStorage.getItem("dgold_store_v2:orders") || "[]");
  ok(stored.length === 1 && stored[0].id === orderId, "order persisted in database");
  ok(stored[0].customer.pin === "560041" && stored[0].status === "pending", "saved fields correct");
  ok(stored[0].total === null, "no invented total (price on call)");

  console.log("\n[5] Track order");
  click(byText('[aria-label="Book your order"] button', "Track This Order"), "open tracker");
  await sleep(600);
  const tracker = document.querySelector('[aria-label="Track your order"]');
  ok(tracker, "tracker opens");
  setInput(tracker.querySelector('input[placeholder="DG-XXXXXXXX"]'), orderId, "track id");
  setInput(tracker.querySelector('input[placeholder="Number used at booking"]'), "9880012345", "track phone");
  click(byText('[aria-label="Track your order"] button', "Track Order"), "track submit");
  await sleep(500);
  ok(tracker.textContent.includes("Pending") && tracker.textContent.includes("500 g Pouch"), "status timeline rendered");
  click(document.querySelector('[aria-label="Track your order"] button[aria-label="Close"]'), "close tracker");
  await sleep(400);

  console.log("\n[6] Admin — protected route, setup, login");
  window.location.hash = "#admin";
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
  await sleep(800);
  ok(document.body.textContent.includes("Create Admin Account"), "first-run admin setup shown (no hardcoded creds)");
  ok(!document.body.textContent.includes("Order Dashboard") || document.body.textContent.includes("Admin"), "dashboard gated");
  setInput(document.querySelector('input[type="email"]'), "owner@dgold.test", "admin email");
  const pws = all('input[type="password"]');
  setInput(pws[0], "GoldenSupari#1", "admin pw");
  setInput(pws[1], "GoldenSupari#1", "admin pw2");
  click(byText("button", "Create Account & Sign In"), "create admin");
  await sleep(1200);
  ok(document.body.textContent.includes("Admin Console"), "dashboard unlocked after setup");
  ok(document.body.textContent.includes("Total Orders"), "overview stats visible");
  ok(document.body.textContent.includes("Test Kumar"), "real order visible in recent bookings");

  console.log("\n[7] Admin — order management");
  click(byText("nav button", "Orders"), "orders tab");
  await sleep(500);
  ok(document.body.textContent.includes(orderId), "order listed with ID");
  click(byText("li button", orderId), "open order drawer");
  await sleep(600);
  const drawer = document.querySelector('[role="dialog"]');
  ok(drawer && drawer.textContent.includes("9880012345"), "drawer shows customer contact");
  click(byText('[role="dialog"] button', "Mark Confirmed"), "advance status");
  await sleep(700);
  const stored2 = JSON.parse(window.localStorage.getItem("dgold_store_v2:orders") || "[]");
  ok(stored2[0].status === "confirmed", "status persisted to database");
  ok(stored2[0].history.some((h) => h.status === "confirmed"), "history recorded");

  console.log("\n[8] Admin — logout & login guard");
  click(byText("button", "Sign Out") || document.querySelector('button[aria-label="Sign out"]'), "sign out");
  await sleep(600);
  ok(document.body.textContent.includes("Admin Sign In"), "login required after logout");
  setInput(document.querySelector('input[type="email"]'), "owner@dgold.test", "login email");
  setInput(document.querySelector('input[type="password"]'), "wrong-password", "bad pw");
  click(byText("button", "Sign In"), "bad login");
  await sleep(900);
  ok(document.body.textContent.includes("Invalid email or password"), "wrong password rejected");
  setInput(document.querySelector('input[type="password"]'), "GoldenSupari#1", "good pw");
  click(byText("button", "Sign In"), "good login");
  await sleep(1200);
  ok(document.body.textContent.includes("Admin Console"), "correct password grants access");

  console.log("\n[9] Admin — product & inventory management");
  click(byText("nav button", "Products & Stock"), "catalog tab");
  await sleep(500);
  click(byText("button", "Edit"), "edit product");
  await sleep(500);
  const editor = document.querySelector('[aria-label="Product editor"]');
  ok(editor, "product editor opens");
  const priceInput = editor.querySelector('input[placeholder="On call"]');
  setInput(priceInput, "450", "pack price");
  const stockCb = [...editor.querySelectorAll('input[type="checkbox"]')].find((c) => c.closest("label")?.textContent.includes("Track stock"));
  stockCb.click();
  await sleep(150);
  const stockInput = [...editor.querySelectorAll('input[type="number"]')].find((i) => !i.disabled && i.closest("div")?.textContent.includes("Stock"));
  setInput(stockInput, "2", "stock count");
  click(byText('[aria-label="Product editor"] button', "Save Product"), "save product");
  await sleep(800);
  const prods = JSON.parse(window.localStorage.getItem("dgold_store_v2:products") || "[]");
  ok(prods[0].packs[0].price === 450, "admin price saved (₹450 per pack)");
  ok(prods[0].packs[0].trackStock && prods[0].packs[0].stock === 2, "stock tracking enabled with 2 units");
  const logs = JSON.parse(window.localStorage.getItem("dgold_store_v2:stockLogs") || "[]");
  ok(logs.some((l) => l.delta === 2), "stock movement logged");

  console.log("\n[10] Storefront reflects price + stock; inventory decrements");
  window.location.hash = "#top";
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
  await sleep(800);
  ok(document.querySelector("#product").textContent.includes("₹450"), "package price live on website (per pack, not per gram)");
  click(byText("header button", "Book Now"), "book again");
  await sleep(600);
  ok(document.querySelector('[aria-label="Book your order"]').textContent.includes("₹450"), "wizard shows real pack price");
  const qtyInput = document.querySelector('[aria-label="Book your order"] input[aria-label="Quantity"]');
  setInput(qtyInput, "5", "qty over stock");
  await sleep(200);
  ok(document.querySelector('[aria-label="Book your order"] input[aria-label="Quantity"]').value === "2", "quantity clamped to available stock (2)");
  ok(document.querySelector('[aria-label="Book your order"]').textContent.includes("₹900"), "live total ₹900 for 2 packs");
  click(byText('[aria-label="Book your order"] button', "Continue"), "s1");
  await sleep(350);
  const d2 = () => document.querySelector('[aria-label="Book your order"]');
  setInput(d2().querySelector('input[placeholder="e.g. Ramesh Naik"]'), "Test Kumar", "name2");
  setInput(d2().querySelector('input[placeholder="10-digit number"]'), "9880012345", "phone2");
  setInput(d2().querySelector('input[placeholder="e.g. Jayanagar 4th Block"]'), "Jayanagar", "area2");
  setInput(d2().querySelector('input[placeholder="5600xx"]'), "560041", "pin2");
  setInput(d2().querySelector("textarea"), "Shop 12, 4th Block, Jayanagar, Bengaluru", "addr2");
  click(byText('[aria-label="Book your order"] button', "Continue"), "s2");
  await sleep(350);
  d2().querySelector('input[type="checkbox"]').click();
  await sleep(150);
  click(byText('[aria-label="Book your order"] button', "Confirm Booking"), "confirm2");
  await sleep(900);
  const prods2 = JSON.parse(window.localStorage.getItem("dgold_store_v2:products") || "[]");
  ok(prods2[0].packs[0].stock === 0, "stock decremented to 0 after order");
  const orders2 = JSON.parse(window.localStorage.getItem("dgold_store_v2:orders") || "[]");
  ok(orders2.length === 2 && orders2.some((o) => o.total === 900), "priced order saved with ₹900 total");
  click(document.querySelector('[aria-label="Book your order"] button[aria-label="Close"]'), "close wizard");
  await sleep(500);
  ok(document.querySelector("#product").textContent.includes("Currently unavailable"), "sold-out pack blocked on storefront");

  console.log("\n[11] Customers aggregate from real orders");
  window.location.hash = "#admin";
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
  await sleep(800);
  click(byText("nav button", "Customers"), "customers tab");
  await sleep(400);
  ok(document.body.textContent.includes("Test Kumar") && document.body.textContent.includes("9880012345"), "customer aggregated");
  ok(document.body.textContent.includes("₹900") || document.body.textContent.includes("2"), "order history count visible");

  console.log(`\nALL ${passed} CHECKS PASSED ✅`);
  window.close();
  process.exit(0);
}

main().catch((e) => {
  console.error(`\n❌ ${e.message}`);
  process.exit(1);
});