"use client";

import { useId, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";

const MAX_ITEMS = 20;

interface ContentArrayFieldProps {
    value: string[];
    onChange: (value: string[]) => void;
    label?: string;
    placeholder?: string;
}

export function ContentArrayField({
    value,
    onChange,
    label = "Contenu",
    placeholder = "Saisir un paragraphe...",
}: ContentArrayFieldProps) {
    const baseId = useId();
    const addButtonRef = useRef<HTMLButtonElement>(null);

    const handleChange = useCallback(
        (index: number, newText: string) => {
            const updated = [...value];
            updated[index] = newText;
            onChange(updated);
        },
        [value, onChange],
    );

    const handleAdd = useCallback(() => {
        if (value.length >= MAX_ITEMS) return;
        onChange([...value, ""]);
        // Focus the new textarea on next tick
        setTimeout(() => {
            const el = document.getElementById(`${baseId}-item-${value.length}`);
            el?.focus();
        }, 50);
    }, [value, onChange, baseId]);

    const handleRemove = useCallback(
        (index: number) => {
            const updated = value.filter((_, i) => i !== index);
            onChange(updated);
            // Return focus to add button if list becomes empty
            if (updated.length === 0) {
                setTimeout(() => addButtonRef.current?.focus(), 50);
            }
        },
        [value, onChange],
    );

    return (
        <fieldset className="space-y-6">
            <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
            </legend>
            {value.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun paragraphe. Cliquez sur « Ajouter ».</p>
            )}
            {value.map((item, index) => (
                <div key={index} className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor={`${baseId}-item-${index}`} className="sr-only">
                            {label} — paragraphe {index + 1}
                        </Label>
                        <Textarea
                            id={`${baseId}-item-${index}`}
                            value={item}
                            onChange={(e) => handleChange(index, e.target.value)}
                            placeholder={placeholder}
                            rows={3}
                            aria-label={`${label} — paragraphe ${index + 1}`}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(index)}
                        aria-label={`Supprimer le paragraphe ${index + 1}`}
                        className="mt-1 shrink-0"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAdd}
                disabled={value.length >= MAX_ITEMS}
                ref={addButtonRef}
            >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Ajouter un paragraphe
            </Button>
        </fieldset>
    );
}
