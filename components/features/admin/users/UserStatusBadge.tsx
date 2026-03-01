import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UserWithProfile } from "@/lib/dal/admin-users";

interface UserStatusBadgeProps {
    user: UserWithProfile;
}

export function UserStatusBadge({ user }: UserStatusBadgeProps) {
    if (user.email_confirmed_at) {
        return (
            <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                Vérifié
            </Badge>
        );
    }

    if (user.invited_at) {
        return (
            <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Invité
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3" aria-hidden="true" />
            Non vérifié
        </Badge>
    );
}
