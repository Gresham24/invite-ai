import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { BatchOperations } from "@/lib/supabase-utils"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const inviteId = uuidv4()

    // Convert FormData to the expected format
    const files: any = {}

    const heroFile = formData.get("heroImage") as File
    if (heroFile) {
      const buffer = Buffer.from(await heroFile.arrayBuffer())
      files.heroImage = [{ buffer, mimetype: heroFile.type }]
    }

    const logoFile = formData.get("eventLogo") as File
    if (logoFile) {
      const buffer = Buffer.from(await logoFile.arrayBuffer())
      files.eventLogo = [{ buffer, mimetype: logoFile.type }]
    }

    const themeFiles = formData.getAll("themeImages") as File[]
    if (themeFiles.length > 0) {
      files.themeImages = await Promise.all(
        themeFiles.map(async (file) => ({
          buffer: Buffer.from(await file.arrayBuffer()),
          mimetype: file.type,
        })),
      )
    }

    const additionalFiles = formData.getAll("additionalImages") as File[]
    if (additionalFiles.length > 0) {
      files.additionalImages = await Promise.all(
        additionalFiles.map(async (file) => ({
          buffer: Buffer.from(await file.arrayBuffer()),
          mimetype: file.type,
        })),
      )
    }

    // Use batch upload utility
    const uploadedImages = await BatchOperations.uploadInviteImages(inviteId, files)

    return NextResponse.json({
      success: true,
      inviteId,
      uploadedImages,
    })
  } catch (error) {
    console.error("Error uploading images:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload images",
      },
      { status: 500 },
    )
  }
}
