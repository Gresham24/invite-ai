import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { v4 as uuidv4 } from "uuid"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const inviteId = uuidv4()
    const uploadedImages: Record<string, string | string[]> = {}

    // Helper function to upload to Cloudinary
    const uploadToCloudinary = async (file: File, folder: string, publicId: string) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `invites/${inviteId}/${folder}`,
              public_id: publicId,
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            },
          )
          .end(buffer)
      })
    }

    // Upload hero image
    const heroFile = formData.get("heroImage") as File
    if (heroFile) {
      const result = (await uploadToCloudinary(heroFile, "hero", "hero")) as any
      uploadedImages.hero = result.secure_url
    }

    // Upload event logo
    const logoFile = formData.get("eventLogo") as File
    if (logoFile) {
      const result = (await uploadToCloudinary(logoFile, "logo", "logo")) as any
      uploadedImages.logo = result.secure_url
    }

    // Upload theme images
    const themeFiles = formData.getAll("themeImages") as File[]
    if (themeFiles.length > 0) {
      uploadedImages.themeImages = []
      for (let i = 0; i < themeFiles.length; i++) {
        const result = (await uploadToCloudinary(themeFiles[i], "theme", `theme-${i + 1}`)) as any
        ;(uploadedImages.themeImages as string[]).push(result.secure_url)
      }
    }

    // Upload additional images
    const additionalFiles = formData.getAll("additionalImages") as File[]
    if (additionalFiles.length > 0) {
      uploadedImages.additional = []
      for (let i = 0; i < additionalFiles.length; i++) {
        const result = (await uploadToCloudinary(additionalFiles[i], "additional", `additional-${i + 1}`)) as any
        ;(uploadedImages.additional as string[]).push(result.secure_url)
      }
    }

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
        error: "Failed to upload images",
      },
      { status: 500 },
    )
  }
}
