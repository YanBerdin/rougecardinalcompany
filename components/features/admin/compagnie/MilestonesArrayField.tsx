"use client";

import { useCallback } from "react";
import { useFieldArray, type Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { PresentationSectionFormValues } from "@/lib/schemas/compagnie-admin";

const MAX_ITEMS = 20;

interface MilestonesArrayFieldProps {
    control: Control<PresentationSectionFormValues>;
}

export function MilestonesArrayField({ control }: MilestonesArrayFieldProps): React.ReactElement {
    const { fields, append, remove } = useFieldArray({ control, name: "milestones" });

    const handleAdd = useCallback(() => {
        if (fields.length < MAX_ITEMS) {
            append({ year: "", label: "" });
        }
    }, [fields.length, append]);

    return (
        <div className="space-y-3">
            <Label>Jalons (milestones)</Label>
            {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                    <Input
                        placeholder="2024"
                        className="w-20"
                        aria-label={`Année du jalon ${index + 1}`}
                        {...control.register(`milestones.${index}.year`)}
                    />
                    <Input
                        placeholder="Description du jalon"
                        className="flex-1"
                        aria-label={`Description du jalon ${index + 1}`}
                        {...control.register(`milestones.${index}.label`)}
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        aria-label={`Supprimer le jalon ${index + 1}`}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            {fields.length < MAX_ITEMS && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAdd}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter un jalon
                </Button>
            )}
        </div>
    );
}
