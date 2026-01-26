"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import type { UseFormReturn } from "react-hook-form";
import type { EventFormValues } from "@/lib/schemas/admin-agenda-ui";
import type { LieuClientDTO } from "@/lib/types/admin-agenda-client";

interface LieuSelectProps {
    form: UseFormReturn<EventFormValues>;
    lieux: LieuClientDTO[];
}

export function LieuSelect({ form, lieux }: LieuSelectProps) {
    return (
        <FormField
            control={form.control}
            name="lieu_id"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Lieu</FormLabel>
                    {lieux.length === 0 && (
                        <FormDescription>
                            Aucun lieu disponible. Créez des lieux dans la section <a href="/admin/lieux" className="underline">Lieux</a>.
                        </FormDescription>
                    )}
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    disabled={lieux.length === 0}
                                    className={cn(
                                        "justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value
                                        ? lieux.find((l) => Number(l.id) === field.value)?.nom
                                        : "Sélectionner un lieu (optionnel)"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Rechercher..." />
                                <CommandEmpty>Aucun lieu trouvé</CommandEmpty>
                                <CommandGroup>
                                    {lieux.map((lieu) => (
                                        <CommandItem
                                            key={String(lieu.id)}
                                            value={lieu.nom}
                                            onSelect={() => {
                                                form.setValue("lieu_id", Number(lieu.id));
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    Number(lieu.id) === field.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {lieu.nom} {lieu.ville && `(${lieu.ville})`}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
