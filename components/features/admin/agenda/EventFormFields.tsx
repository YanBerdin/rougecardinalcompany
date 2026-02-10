"use client";

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { EventFormValues } from "@/lib/schemas/admin-agenda-ui";

interface EventFormFieldsProps {
    form: UseFormReturn<EventFormValues>;
}

export function EventFormFields({ form }: EventFormFieldsProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="date_debut"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date début *</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date_fin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date fin</FormLabel>
                            <FormControl>
                                <Input
                                    type="datetime-local"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Heure début *</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Heure fin</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="scheduled">Programmé</SelectItem>
                                <SelectItem value="cancelled">Annulé</SelectItem>
                                <SelectItem value="completed">Terminé</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="ticket_url"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>URL Billetterie</FormLabel>
                        <FormControl>
                            <Input
                                type="url"
                                placeholder="https://..."
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
                    name="capacity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacité</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="1"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value ? parseInt(e.target.value) : null
                                        )
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="price_cents"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prix (€)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    // Conversion centimes → euros pour affichage
                                    value={field.value !== null && field.value !== undefined ? (field.value / 100).toFixed(2) : ""}
                                    // Conversion euros → centimes pour stockage
                                    onChange={(e) => {
                                        const euros = parseFloat(e.target.value);
                                        field.onChange(
                                            !isNaN(euros) && e.target.value ? Math.round(euros * 100) : null
                                        );
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </>
    );
}
