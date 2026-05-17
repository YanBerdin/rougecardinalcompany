"use client";

import { useEffect, useState } from "react";
import { FooterConfigForm } from "./FooterConfigForm";
import type { FooterConfigViewProps } from "./types";

export function FooterConfigView({ initialConfig }: FooterConfigViewProps) {
    const [config, setConfig] = useState(initialConfig);

    // Sync local state when props change (after router.refresh())
    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig]);

    return (
        <div className="space-y-6">
            <FooterConfigForm initialConfig={config} />
        </div>
    );
}
