import { NextResponse } from "next/server";
import { fetchTeamMemberById } from "@/lib/dal/team";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";

//TODO: Refactor the route into small helpers to improve adherence to clean-code principles
export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // Require admin privileges for destructive action
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const resolved = (await params) as { id: string };
    const id = Number(resolved.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Ensure member exists and is inactive
    const member = await fetchTeamMemberById(id);
    if (!member)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (member.active) {
      return NextResponse.json(
        { error: "Member must be inactive to hard delete" },
        { status: 400 }
      );
    }

    // Critical operation : Permanent deletion (RGPD)
    const supabase = await createClient();
    const { error } = await supabase
      .from("membres_equipe")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Hard delete database error:", error);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/admin/team/[id]/hard-delete POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
