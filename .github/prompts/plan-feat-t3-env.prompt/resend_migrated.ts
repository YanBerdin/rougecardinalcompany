// lib/resend.ts
import { Resend } from "resend";
import { env } from "./env";

// ✅ No need for manual check - T3 Env validates at startup
// ❌ OLD: if (!process.env.RESEND_API_KEY) throw new Error(...)

export const resend = new Resend(env.RESEND_API_KEY);
