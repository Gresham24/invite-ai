import { type NextRequest, NextResponse } from "next/server"
import { DatabaseUtils } from "@/lib/supabase-utils"

export async function GET(request: NextRequest, { params }: { params: { inviteId: string } }) {
  try {
    const { inviteId } = params

    const dbData = await DatabaseUtils.getInvite(inviteId)

    if (!dbData) {
      return NextResponse.json(
        {
          success: false,
          error: "Invite not found",
        },
        { status: 404 },
      )
    }


    // Increment view count asynchronously
    DatabaseUtils.incrementViewCount(inviteId).catch(console.error)

    return NextResponse.json(dbData)
  } catch (error) {
    console.error("Error fetching invite:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch invite",
      },
      { status: 500 },
    )
  }
}
