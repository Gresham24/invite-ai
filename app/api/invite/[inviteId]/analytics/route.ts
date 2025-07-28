import { type NextRequest, NextResponse } from "next/server"
import { DatabaseUtils } from "@/lib/supabase-utils"

export async function GET(request: NextRequest, { params }: { params: { inviteId: string } }) {
  try {
    const { inviteId } = params
    const analytics = await DatabaseUtils.getInviteAnalytics(inviteId)

    return NextResponse.json({
      success: true,
      analytics,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics",
      },
      { status: 500 },
    )
  }
}
