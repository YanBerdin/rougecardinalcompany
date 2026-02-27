"use client";

import { CalendarIcon, X } from "lucide-react";
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
    const hasSelection = from !== undefined;

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "h-9 w-full justify-start gap-2 px-3 text-left text-sm font-normal",
                            "border-input bg-background hover:bg-accent/40 hover:border-primary/50",
                            "transition-colors duration-150",
                            hasSelection
                                ? "border-primary/40 text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">
                            {from ? (
                                to ? (
                                    <>
                                        {format(from, "dd MMM yyyy", { locale: fr })}
                                        <span className="mx-1 text-muted-foreground">→</span>
                                        {format(to, "dd MMM yyyy", { locale: fr })}
                                    </>
                                ) : (
                                    format(from, "dd MMM yyyy", { locale: fr })
                                )
                            ) : (
                                "Sélectionner une période"
                            )}
                        </span>
                        {hasSelection && (
                            <span
                                role="button"
                                aria-label="Effacer la sélection"
                                title="Effacer la sélection"
                                tabIndex={0}
                                className="ml-auto shrink-0 rounded-sm p-0.5 text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(undefined);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onSelect(undefined);
                                    }
                                }}
                            >
                                <X className="h-3 w-3" aria-hidden />
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className={cn(
                        "w-auto p-0",
                        "rounded-lg border border-border/80 shadow-lg",
                        "bg-popover text-popover-foreground"
                    )}
                    align="start"
                    sideOffset={6}
                >
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={from ?? new Date()}
                        selected={{ from, to }}
                        onSelect={onSelect}
                        numberOfMonths={2}
                        locale={fr}
                        className="[--cell-size:2.25rem] p-4"
                        classNames={{
                            months: "flex flex-col sm:flex-row gap-0 sm:divide-x sm:divide-border/60",
                            month: "flex flex-col gap-3 px-1 sm:first:pr-5 sm:last:pl-5",
                            month_caption: "flex h-9 items-center justify-center px-8",
                            caption_label: "text-sm font-semibold text-foreground",
                            weekday: "text-muted-foreground/70 text-[0.75rem] font-medium",
                            range_start: "rounded-l-md bg-primary/15 dark:bg-primary/20",
                            range_end: "rounded-r-md bg-primary/15 dark:bg-primary/20",
                            range_middle: "rounded-none bg-primary/10 dark:bg-primary/15",
                            today: "bg-accent/60 text-accent-foreground rounded-md font-medium data-[selected=true]:rounded-none",
                        }}
                    />
                    {hasSelection && (
                        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5">
                            <span className="text-xs text-muted-foreground">
                                {from && to
                                    ? `${Math.ceil((to.getTime() - from.getTime()) / 86_400_000)} jours`
                                    : "Sélectionnez une date de fin"}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => onSelect(undefined)}
                            >
                                Réinitialiser
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}
