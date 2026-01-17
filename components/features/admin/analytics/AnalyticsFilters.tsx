"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AnalyticsFiltersProps } from "./types";

/**
 * Analytics Filters Component
 *
 * Date range picker for filtering analytics data
 */
export function AnalyticsFilters({
    startDate,
    endDate,
    onDateRangeChange,
    isLoading,
}: AnalyticsFiltersProps) {
    const [localStartDate, setLocalStartDate] = useState<Date>(startDate);
    const [localEndDate, setLocalEndDate] = useState<Date>(endDate);

    const handleApplyFilters = () => {
        onDateRangeChange(localStartDate, localEndDate);
    };

    const handlePresetClick = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        setLocalStartDate(start);
        setLocalEndDate(end);
        onDateRangeChange(start, end);
    };

    return (
        <div className="space-y-4">
            {/* Date Range Pickers */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn("w-full sm:w-[200px] justify-start text-left font-normal")}
                            disabled={isLoading}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(localStartDate, "dd/MM/yyyy", { locale: fr })}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={localStartDate}
                            onSelect={(date) => date && setLocalStartDate(date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <span className="text-center text-muted-foreground sm:text-left">à</span>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn("w-full sm:w-[200px] justify-start text-left font-normal")}
                            disabled={isLoading}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(localEndDate, "dd/MM/yyyy", { locale: fr })}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={localEndDate}
                            onSelect={(date) => date && setLocalEndDate(date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Button onClick={handleApplyFilters} disabled={isLoading} className="w-full sm:w-auto">
                    Appliquer
                </Button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="text-sm text-muted-foreground">Raccourcis :</span>
                <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetClick(7)}
                        disabled={isLoading}
                    >
                        7 jours
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetClick(30)}
                        disabled={isLoading}
                    >
                        30 jours
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetClick(90)}
                        disabled={isLoading}
                    >
                        90 jours
                    </Button>
                </div>
            </div>
        </div>
    );
}
