import cron from "node-cron"
import { performCleanup } from "./cleanup.js"

/**
 * Cron job service for scheduled cleanup
 * Run this as a separate service or integrate into your main server
 */

// Schedule cleanup to run daily at 3 AM
const schedule = process.env.CLEANUP_SCHEDULE || "0 3 * * *"

console.log("🕒 Starting cron service...")
console.log(`📅 Cleanup scheduled: ${schedule}`)

// Validate cron expression
if (!cron.validate(schedule)) {
  console.error("❌ Invalid cron expression:", schedule)
  process.exit(1)
}

// Schedule the cleanup task
const task = cron.schedule(
  schedule,
  async () => {
    console.log("\n🔄 Running scheduled cleanup...")
    try {
      await performCleanup()
    } catch (error) {
      console.error("❌ Scheduled cleanup failed:", error)
    }
  },
  {
    scheduled: true,
    timezone: process.env.TZ || "UTC",
  },
)

// Start the cron job
task.start()

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⏹️  Stopping cron service...")
  task.stop()
  process.exit(0)
})

// Keep the process running
console.log("✅ Cron service is running. Press Ctrl+C to stop.")
