"use client";

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { LieuFormValues } from "@/lib/schemas/admin-lieux";

interface LieuFormFieldsProps {
    form: UseFormReturn<LieuFormValues>;
}

export function LieuFormFields({ form }: LieuFormFieldsProps) {
    return (
        <>
            <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                            <Input placeholder="Théâtre de la Ville" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="adresse"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="123 rue de la République"
                                {...field}
                                value={field.value ?? ""}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="ville"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ville</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Paris"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="code_postal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Code postal</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="75001"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="pays"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pays</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="capacite"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Capacité</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min="1"
                                placeholder="200"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                    field.onChange(e.target.value ? parseInt(e.target.value) : null)
                                }
                            />
                        </FormControl>
                        <FormDescription>Nombre de places assises</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.000001"
                                    placeholder="48.8566"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value ? parseFloat(e.target.value) : null
                                        )
                                    }
                                />
                            </FormControl>
                            <FormDescription>Coordonnées GPS (optionnel)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.000001"
                                    placeholder="2.3522"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value ? parseFloat(e.target.value) : null
                                        )
                                    }
                                />
                            </FormControl>
                            <FormDescription>Coordonnées GPS (optionnel)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </>
    );
}
