"use client";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useImageFieldContext } from "./ImageFieldContext";

const IMAGE_ALT_MAX_LENGTH = 125;

export function ImageFieldAltText() {
    const { meta } = useImageFieldContext();
    const { form, altTextField, altTextLabel, required } = meta;

    if (!altTextField) return null;

    return (
        <FormField
            control={form.control}
            name={altTextField}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>
                        {altTextLabel}{" "}
                        {required && <span className="text-destructive" aria-hidden="true">*</span>}
                        {required && <span className="sr-only">(requis)</span>}
                    </FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            value={(field.value as string) ?? ""}
                            maxLength={IMAGE_ALT_MAX_LENGTH}
                            placeholder="Décrivez l'image pour l'accessibilité"
                            aria-required={required}
                            aria-describedby={`alt-counter-${altTextField}`}
                        />
                    </FormControl>
                    <FormDescription id={`alt-counter-${altTextField}`}>
                        {((field.value as string) ?? "").length}/{IMAGE_ALT_MAX_LENGTH} caractères
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
