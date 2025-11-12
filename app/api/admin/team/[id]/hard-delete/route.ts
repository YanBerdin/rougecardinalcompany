import { NextResponse } from "next/server";
import { hardDeleteTeamMember } from "@/lib/dal/team";
import { requireAdmin } from "@/lib/auth/is-admin";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    
    const { id: idString } = await context.params;
    const id = parseTeamMemberId(idString);
    
    if (!id) {
      return NextResponse.json(
        { error: "Invalid team member ID" },
        { status: 400 }
      );
    }

    const result = await hardDeleteTeamMember(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Failed to delete team member" },
        { status: result.status ?? 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[API] Hard delete error:", error);
    
    if (isAuthError(error)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helpers
// ============================================================================

function parseTeamMemberId(id: string): number | null {
  const parsed = Number(id);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function isAuthError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("Forbidden");
}
