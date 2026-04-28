import { fetchTeamMembers } from "@/lib/dal/compagnie";
import { fetchDisplayToggle } from "@/lib/dal/site-config";
import { FALLBACK_MEMBER_IMAGE } from "@/components/features/public-site/compagnie/constants";
import type { TeamMember } from "@/lib/schemas/compagnie";
import { HomeTeamView } from "./HomeTeamView";

const HOME_TEAM_LIMIT = 8;

export async function HomeTeamContainer() {
    const toggleResult = await fetchDisplayToggle("display_toggle_home_team");

    // Default to enabled: only hide if toggle is explicitly set to false
    const isExplicitlyDisabled =
        toggleResult.success &&
        toggleResult.data !== null &&
        toggleResult.data.value?.enabled === false;

    if (isExplicitlyDisabled) {
        return null;
    }

    const membersResult = await fetchTeamMembers(HOME_TEAM_LIMIT);

    if (!membersResult.success) {
        console.error("Failed to fetch team members:", membersResult.error);
        return null;
    }
    if (membersResult.data.length === 0) {
        return null;
    }

    const members: TeamMember[] = membersResult.data.map((m) => ({
        name: m.name,
        role: m.role,
        description: m.description,
        image: m.image_url ?? FALLBACK_MEMBER_IMAGE,
    }));

    return <HomeTeamView members={members} />;
}
