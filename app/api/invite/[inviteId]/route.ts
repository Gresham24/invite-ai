import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(request: NextRequest, { params }: { params: { inviteId: string } }) {
  try {
    const { inviteId } = params

    const result = await sql`
      SELECT id, form_data, generated_code, uploaded_images, created_at
      FROM invites
      WHERE id = ${inviteId}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invite not found",
        },
        { status: 404 },
      )
    }

    const invite = result.rows[0]

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        code: invite.generated_code,
        formData: invite.form_data,
        uploadedImages: invite.uploaded_images,
        createdAt: invite.created_at,
      },
    })
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
