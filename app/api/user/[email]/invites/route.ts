import { type NextRequest, NextResponse } from "next/server"
import { DatabaseUtils } from "@/lib/supabase-utils"

export async function GET(request: NextRequest, { params }: { params: { email: string } }) {
  try {
    const { email } = params
    const invites = await DatabaseUtils.getUserInvites(email)

    return NextResponse.json({
      success: true,
      invites: invites.map((invite) => ({
        id: invite.id,
        title: invite.form_data.eventTitle,
        date: invite.form_data.eventDate,
        createdAt: invite.created_at,
        viewCount: invite.view_count,
      })),
    })
  } catch (error) {
    console.error("Error fetching user invites:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch invites",
      },
      { status: 500 },
    )
  }
}
