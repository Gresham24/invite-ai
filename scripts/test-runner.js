#!/usr/bin/env node

import { spawn } from "child_process"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log("🚀 Running AI Invite Generator Tests\n")

// Run Jest tests
console.log("📋 Running unit tests...")
const jestProcess = spawn("npx", ["jest", "--verbose"], {
  cwd: join(__dirname, ".."),
  stdio: "inherit",
})

jestProcess.on("close", (code) => {
  if (code === 0) {
    console.log("\n✅ Unit tests passed!")

    // Run manual tests
    console.log("\n🔧 Running manual API tests...")
    const manualTestProcess = spawn("node", ["scripts/manual-test.js"], {
      cwd: join(__dirname, ".."),
      stdio: "inherit",
    })

    manualTestProcess.on("close", (manualCode) => {
      if (manualCode === 0) {
        console.log("\n🎉 All tests completed successfully!")
      } else {
        console.log("\n⚠️ Manual tests had issues")
        process.exit(1)
      }
    })
  } else {
    console.log("\n❌ Unit tests failed")
    process.exit(1)
  }
})
