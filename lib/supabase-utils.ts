import { createClient } from "@supabase/supabase-js"

// Initialize Supabase clients
// Public client (browser-safe). Do NOT use this for writes that must bypass RLS.
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client (server-only). Use in API routes; bypasses RLS.
// IMPORTANT: Never import this file from client components.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Storage utilities
export const StorageUtils = {
  /**
   * Upload a single file to Supabase storage
   */
  async uploadFile(fileBuffer: Buffer, filePath: string, contentType: string, bucketName = "invites"): Promise<string> {
    const { data, error } = await supabaseAdmin.storage.from(bucketName).upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    })

    if (error) throw error

    return this.getPublicUrl(filePath, bucketName)
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(filePath: string, bucketName = "invites"): string {
    const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath)

    return data.publicUrl
  },

  /**
   * Delete files from storage
   */
  async deleteFiles(filePaths: string[], bucketName = "invites"): Promise<boolean> {
    const { error } = await supabaseAdmin.storage.from(bucketName).remove(filePaths)

    if (error) throw error
    return true
  },

  /**
   * List all files in a directory
   */
  async listFiles(path: string, bucketName = "invites") {
    const { data, error } = await supabaseAdmin.storage.from(bucketName).list(path, {
      limit: 100,
      offset: 0,
    })

    if (error) throw error
    return data
  },

  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(filePath: string, expiresIn = 3600, bucketName = "invites"): Promise<string> {
    const { data, error } = await supabaseAdmin.storage.from(bucketName).createSignedUrl(filePath, expiresIn)

    if (error) throw error
    return data.signedUrl
  },
}

// Database utilities
export const DatabaseUtils = {
  /**
   * Save invite to database
   */
  async saveInvite(inviteData: any) {
    const { data, error } = await supabaseAdmin
      .from("invites")
      .insert({
        id: inviteData.id,
        form_data: inviteData.formData,
        generated_code: inviteData.generatedCode,
        user_email: inviteData.userEmail || null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get invite from database
   */
  async getInvite(inviteId: string) {
    const { data, error } = await supabaseAdmin.from("invites").select("*").eq("id", inviteId).eq("is_active", true).single()

    if (error) throw error
    return data
  },

  /**
   * Update invite view count
   */
  async incrementViewCount(inviteId: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc("increment_view_count", {
      invite_id: inviteId,
    })

    if (error) throw error
  },

  /**
   * Get user's invites
   */
  async getUserInvites(userEmail: string, limit = 10) {
    const { data, error } = await supabaseAdmin
      .from("invites")
      .select("id, form_data, created_at, view_count")
      .eq("user_email", userEmail)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  /**
   * Soft delete invite
   */
  async deleteInvite(inviteId: string): Promise<boolean> {
    const { error } = await supabaseAdmin.from("invites").update({ is_active: false }).eq("id", inviteId)

    if (error) throw error
    return true
  },

  /**
   * Get invite analytics
   */
  async getInviteAnalytics(inviteId: string) {
    const { data, error } = await supabaseAdmin.from("invites").select("view_count, created_at").eq("id", inviteId).single()

    if (error) throw error

    // Calculate days since creation
    const createdAt = new Date(data.created_at)
    const now = new Date()
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

    return {
      viewCount: data.view_count,
      createdAt: data.created_at,
      daysSinceCreation,
      averageViewsPerDay: daysSinceCreation > 0 ? data.view_count / daysSinceCreation : data.view_count,
    }
  },
}

// Batch operations
export const BatchOperations = {
  /**
   * Upload multiple images for an invite
   */
  async uploadInviteImages(inviteId: string, files: any) {
    const uploadedImages: any = {}
    const uploadPromises: Promise<void>[] = []

    // Hero image
    if (files.heroImage?.[0]) {
      uploadPromises.push(
        StorageUtils.uploadFile(files.heroImage[0].buffer, `${inviteId}/hero.jpg`, files.heroImage[0].mimetype).then(
          (url) => {
            uploadedImages.hero = url
          },
        ),
      )
    }

    // Event logo
    if (files.eventLogo?.[0]) {
      uploadPromises.push(
        StorageUtils.uploadFile(files.eventLogo[0].buffer, `${inviteId}/logo.jpg`, files.eventLogo[0].mimetype).then(
          (url) => {
            uploadedImages.logo = url
          },
        ),
      )
    }

    // Theme images
    if (files.themeImages) {
      uploadedImages.themeImages = []
      files.themeImages.forEach((file: any, index: number) => {
        uploadPromises.push(
          StorageUtils.uploadFile(file.buffer, `${inviteId}/theme-${index + 1}.jpg`, file.mimetype).then((url) => {
            uploadedImages.themeImages.push(url)
          }),
        )
      })
    }

    // Additional images
    if (files.additionalImages) {
      uploadedImages.additional = []
      files.additionalImages.forEach((file: any, index: number) => {
        uploadPromises.push(
          StorageUtils.uploadFile(file.buffer, `${inviteId}/additional-${index + 1}.jpg`, file.mimetype).then((url) => {
            uploadedImages.additional.push(url)
          }),
        )
      })
    }

    await Promise.all(uploadPromises)
    return uploadedImages
  },

  /**
   * Delete all assets for an invite
   */
  async deleteInviteAssets(inviteId: string): Promise<void> {
    // List all files
    const files = await StorageUtils.listFiles(inviteId)

    if (files.length > 0) {
      const filePaths = files.map((file) => `${inviteId}/${file.name}`)
      await StorageUtils.deleteFiles(filePaths)
    }

    // Mark invite as inactive in database
    await DatabaseUtils.deleteInvite(inviteId)
  },
}

// Cleanup utilities
export const CleanupUtils = {
  /**
   * Clean up old invites and their assets
   */
  async cleanupOldInvites(daysOld = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // Get old invites
    const { data: oldInvites, error } = await supabaseAdmin
      .from("invites")
      .select("id")
      .lt("created_at", cutoffDate.toISOString())
      .eq("is_active", true)

    if (error) throw error

    const results = {
      processed: 0,
      deleted: 0,
      errors: [] as Array<{ inviteId: string; error: string }>,
    }

    // Delete assets and mark as inactive
    for (const invite of oldInvites) {
      try {
        await BatchOperations.deleteInviteAssets(invite.id)
        results.deleted++
      } catch (error) {
        results.errors.push({
          inviteId: invite.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
      results.processed++
    }

    return results
  },
}

export default {
  // Expose the public client if anything relies on it elsewhere
  supabase: supabasePublic,
  StorageUtils,
  DatabaseUtils,
  BatchOperations,
  CleanupUtils,
}
