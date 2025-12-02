// types/email.d.ts
import type { resend } from "@/lib/resend";

export type ResendSendType = typeof resend.emails.send;
export type ResendParamsType = Parameters<ResendSendType>;
export type ResendParamsTypeWithConditionalFrom = [
  payload: Omit<ResendParamsType[0], "from"> & { from?: string },
  options?: ResendParamsType[1],
];
