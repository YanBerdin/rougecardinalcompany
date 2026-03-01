import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ToggleCard } from "./ToggleCard";
import type { ToggleSectionProps } from "./types";

export function ToggleSection({
    config,
    toggles,
    updatingKey,
    onToggle,
}: ToggleSectionProps): React.JSX.Element {
    const headingId = `section-heading-${config.id}`;

    return (
        <section aria-labelledby={headingId}>
            <Card>
                <CardHeader>
                    <CardTitle id={headingId}>{config.title}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {toggles.map((toggle) => (
                        <ToggleCard
                            key={toggle.key}
                            toggle={toggle}
                            onToggle={onToggle}
                            isUpdating={updatingKey === toggle.key}
                        />
                    ))}
                </CardContent>
            </Card>
        </section>
    );
}
