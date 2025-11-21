import { NextRequest, NextResponse } from "next/server";
import { inviteUser } from "@/lib/dal/admin-users";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await inviteUser(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Invitation envoyée avec succès"
    });
  } catch (error) {
    console.error("[API] Invite user error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}