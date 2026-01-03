"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
    from?: Date;
    to?: Date;
    onSelect: (range: DateRange | undefined) => void;
    className?: string;
}

export function DateRangePicker({ from, to, onSelect, className }: DateRangePickerProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !from && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {from ? (
                            to ? (
                                <>
                                    {format(from, "dd MMM yyyy", { locale: fr })} -{" "}
                                    {format(to, "dd MMM yyyy", { locale: fr })}
                                </>
                            ) : (
                                format(from, "dd MMM yyyy", { locale: fr })
                            )
                        ) : (
                            <span>Sélectionner une période</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={from}
                        selected={{ from, to }}
                        onSelect={onSelect}
                        numberOfMonths={2}
                        locale={fr}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
