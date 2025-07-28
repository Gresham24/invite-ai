import { CleanupUtils } from "../lib/supabase-utils.js"
import dotenv from "dotenv"

dotenv.config()

/**
 * Cleanup script to remove old invites and their assets
 * Can be run manually or via cron job
 */
async function performCleanup() {
  console.log("🧹 Starting cleanup process...")
  console.log(`📅 Date: ${new Date().toISOString()}`)

  try {
    // Cleanup invites older than 30 days by default
    const daysOld = Number.parseInt(process.env.CLEANUP_DAYS_OLD || "30")

    console.log(`🗑️  Cleaning up invites older than ${daysOld} days...`)

    const results = await CleanupUtils.cleanupOldInvites(daysOld)

    console.log("\n✅ Cleanup complete!")
    console.log(`📊 Results:`)
    console.log(`   - Processed: ${results.processed} invites`)
    console.log(`   - Deleted: ${results.deleted} invites`)
    console.log(`   - Errors: ${results.errors.length}`)

    if (results.errors.length > 0) {
      console.log("\n⚠️  Errors encountered:")
      results.errors.forEach((err) => {
        console.log(`   - Invite ${err.inviteId}: ${err.error}`)
      })
    }

    // Log to file if LOG_FILE is set
    if (process.env.LOG_FILE) {
      const fs = await import("fs/promises")
      const logEntry = {
        timestamp: new Date().toISOString(),
        results,
        daysOld,
      }

      await fs.appendFile(process.env.LOG_FILE, JSON.stringify(logEntry) + "\n")
    }
  } catch (error) {
    console.error("❌ Cleanup failed:", error)
    process.exit(1)
  }
}

// Run cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  performCleanup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { performCleanup }
