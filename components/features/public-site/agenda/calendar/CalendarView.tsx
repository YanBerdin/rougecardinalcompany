"use client";

import { CalendarNav } from "./CalendarNav";
import { CalendarMonth } from "./CalendarMonth";

export function CalendarView(): React.JSX.Element {
    return (
        <div>
            <CalendarNav />
            <CalendarMonth />
        </div>
    );
}
