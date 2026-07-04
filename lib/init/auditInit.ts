import "server-only";
import { initHttpAudit } from "@/lib/monitor/httpAudit";

let initialized = false;

export function initAudit() {
  if (initialized) return;
  initialized = true;

  initHttpAudit();

  console.log("🧠 HTTP Audit Layer Active");
}