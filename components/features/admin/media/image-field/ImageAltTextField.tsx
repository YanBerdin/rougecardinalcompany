"use client";

import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const IMAGE_ALT_MAX_LENGTH = 125;

interface ImageAltTextFieldProps<TForm extends FieldValues> {
    form: UseFormReturn<TForm>;
    altTextField: Path<TForm>;
    altTextLabel?: string;
    required?: boolean;
}

export function ImageAltTextField<TForm extends FieldValues>({
    form,
    altTextField,
    altTextLabel = "Alt Text (Accessibilité)",
    required = false,
}: ImageAltTextFieldProps<TForm>) {
    return (
        <FormField
            control={form.control}
            name={altTextField}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>
                        {altTextLabel}{" "}
                        {required && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <FormControl>
                        <Input
                            {...field}
                            value={(field.value as string) ?? ""}
                            maxLength={IMAGE_ALT_MAX_LENGTH}
                            placeholder="Décrivez l'image pour l'accessibilité"
                        />
                    </FormControl>
                    <FormDescription>
                        {((field.value as string) ?? "").length}/{IMAGE_ALT_MAX_LENGTH} caractères
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
