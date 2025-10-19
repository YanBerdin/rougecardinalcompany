import { NextResponse } from "next/server";
import { setTeamMemberActive } from "@/lib/dal/team";
import { requireAdmin } from "@/lib/auth/is-admin";

export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // Require admin for toggling active flag
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // In Next.js 15 the `params` object may be a Promise-like; await it before reading properties.
    const resolvedParams = (await params) as { id: string };
    const id = Number(resolvedParams.id);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Expected application/json" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Accept boolean, 'true'/'false' strings, or 0/1 numbers.
    let active: boolean | null = null;
    if (typeof body.active === "boolean") active = body.active;
    else if (typeof body.active === "string") {
      const v = body.active.toLowerCase();
      if (v === "true") active = true;
      else if (v === "false") active = false;
    } else if (typeof body.active === "number") {
      active = body.active === 1;
    }

    if (active === null) {
      return NextResponse.json(
        { error: "Invalid payload: active must be boolean" },
        { status: 400 }
      );
    }

    const ok = await setTeamMemberActive(id, active);
    if (!ok)
      return NextResponse.json(
        { error: "Failed to update active flag" },
        { status: 500 }
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("api/admin/team/[id]/active POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
