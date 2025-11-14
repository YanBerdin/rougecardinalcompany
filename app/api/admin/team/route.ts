import { NextResponse } from "next/server";
import { fetchAllTeamMembers } from "@/lib/dal/team";
import { HttpStatus, ApiResponse } from "@/lib/api/helpers";

/**
 * 
 * @param request 
 * @returns
 * Fetch all team members, with optional inclusion of inactive members
 * Query parameter:
 * - includeInactive (boolean): If true, includes inactive members in the response
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("includeInactive") === "true";

    const members = await fetchAllTeamMembers(includeInactive);

    // Return array directly for backward compatibility with client
    return NextResponse.json(members);
  } catch (err) {
    console.error("api/admin/team GET error:", err);
    return ApiResponse.error("Internal error", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
