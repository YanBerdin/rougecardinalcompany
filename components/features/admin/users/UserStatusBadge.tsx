import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UserWithProfile } from "@/lib/dal/admin-users";

interface UserStatusBadgeProps {
    user: UserWithProfile;
}

export function UserStatusBadge({ user }: UserStatusBadgeProps) {
    if (user.email_confirmed_at) {
        return (
            <Badge variant="default" className="gap-2">
                <CheckCircle className="size-3" aria-hidden="true" />
                Vérifié
            </Badge>
        );
    }

    if (user.invited_at) {
        return (
            <Badge variant="secondary" className="gap-2">
                <Clock className="size-3" aria-hidden="true" />
                Invité
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="gap-2">
            <XCircle className="size-3" aria-hidden="true" />
            Non vérifié
        </Badge>
    );
}
