import { NextResponse } from "next/server";
import { fetchAllTeamMembers } from "@/lib/dal/team";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("includeInactive") === "true";

    const members = await fetchAllTeamMembers(includeInactive);

    return NextResponse.json(members);
  } catch (err) {
    console.error("api/admin/team GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
