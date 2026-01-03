/*
"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TestToastButton() {
    const testSuccess = () => {
        console.log("[Test] Calling toast.success");
        toast.success("Toast de test réussi !", {
            description: "Ceci est une notification de succès",
            duration: 5000,
        });
    };

    const testError = () => {
        console.log("[Test] Calling toast.error");
        toast.error("Toast d'erreur de test", {
            description: "Ceci est une notification d'erreur",
            duration: 5000,
        });
    };

    const testInfo = () => {
        console.log("[Test] Calling toast.info");
        toast.info("Toast d'information", {
            description: "Ceci est une notification d'information",
            duration: 5000,
        });
    };

    return (
        <div className="fixed bottom-4 left-4 z-[10000] flex gap-2 p-4 bg-white/90 backdrop-blur rounded-lg shadow-lg border">
            <Button onClick={testSuccess} variant="default" size="sm">
                Test Success
            </Button>
            <Button onClick={testError} variant="destructive" size="sm">
                Test Error
            </Button>
            <Button onClick={testInfo} variant="secondary" size="sm">
                Test Info
            </Button>
        </div>
    );
}
*/