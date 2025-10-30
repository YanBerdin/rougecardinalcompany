"use client";

import React from "react";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";

interface AdminAuthRowProps {
  hasEnvVars: boolean;
}

export default function AdminAuthRow({ hasEnvVars }: AdminAuthRowProps) {
  return <div>{!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}</div>;
}
