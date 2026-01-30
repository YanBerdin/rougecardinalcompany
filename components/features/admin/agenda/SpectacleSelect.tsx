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
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import type { UseFormReturn } from "react-hook-form";
import type { EventFormValues } from "@/lib/schemas/admin-agenda-ui";
import type { SpectacleClientDTO } from "@/lib/types/admin-agenda-client";

interface SpectacleSelectProps {
    form: UseFormReturn<EventFormValues>;
    spectacles: SpectacleClientDTO[];
}

export function SpectacleSelect({ form, spectacles }: SpectacleSelectProps) {
    return (
        <FormField
            control={form.control}
            name="spectacle_id"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Spectacle *</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value
                                        ? spectacles.find((s) => Number(s.id) === field.value)
                                            ?.title
                                        : "Sélectionner un spectacle"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Rechercher..." />
                                <CommandEmpty>Aucun spectacle trouvé</CommandEmpty>
                                <CommandGroup>
                                    {spectacles.map((spectacle) => (
                                        <CommandItem
                                            key={String(spectacle.id)}
                                            value={spectacle.title}
                                            onSelect={() => {
                                                form.setValue("spectacle_id", Number(spectacle.id));
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    Number(spectacle.id) === field.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {spectacle.title}
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
