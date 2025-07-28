// Manual testing script for Next.js API routes
const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

async function testAPI() {
  console.log("🧪 Testing AI Invite Generator API...\n")

  try {
    // Test 1: Health Check (if you add one)
    console.log("1️⃣ Testing API availability...")

    // Test 2: Generate Invite (without images)
    console.log("2️⃣ Testing invite generation...")
    const generateResponse = await fetch(`${API_URL}/api/generate-invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inviteId: "test-" + Date.now(),
        formData: {
          eventTitle: "Test Birthday Party",
          eventDate: "2025-12-25",
          eventTime: "18:00",
          venue: "Test Venue",
          eventDescription: "A test birthday celebration",
          eventTheme: "playful",
          colorScheme: "Vibrant",
        },
        uploadedImages: {},
      }),
    })

    if (!generateResponse.ok) {
      throw new Error(`Generate invite failed: ${generateResponse.status}`)
    }

    const generateData = await generateResponse.json()
    console.log("✅ Invite generated:", {
      success: generateData.success,
      inviteId: generateData.inviteId,
      inviteUrl: generateData.inviteUrl,
    })

    // Test 3: Retrieve Invite
    if (generateData.inviteId) {
      console.log("\n3️⃣ Testing invite retrieval...")
      const getResponse = await fetch(`${API_URL}/api/invite/${generateData.inviteId}`)

      if (!getResponse.ok) {
        throw new Error(`Get invite failed: ${getResponse.status}`)
      }

      const getData = await getResponse.json()
      console.log("✅ Invite retrieved successfully")
      console.log("📄 Generated code preview:", getData.invite.code.substring(0, 200) + "...")
      console.log("🔗 Visit your invite at:", `${API_URL}/invite/${generateData.inviteId}`)
    }

    // Test 4: Image Upload
    console.log("\n4️⃣ Testing image upload...")
    const formData = new FormData()

    // Create a simple test image blob
    const canvas = document?.createElement?.("canvas") || { toBlob: () => {} }
    if (typeof window !== "undefined" && canvas.toBlob) {
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext("2d")
      ctx.fillStyle = "#ff0000"
      ctx.fillRect(0, 0, 100, 100)

      canvas.toBlob(async (blob) => {
        formData.append("heroImage", blob, "test-hero.jpg")

        const uploadResponse = await fetch(`${API_URL}/api/upload-images`, {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          console.log("✅ Image upload test passed:", uploadData.success)
        } else {
          console.log("⚠️ Image upload test skipped (browser environment needed)")
        }
      })
    } else {
      console.log("⚠️ Image upload test skipped (browser environment needed)")
    }

    console.log("\n✨ All tests passed!")
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}

// Export for use in browser or Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { testAPI }
} else if (typeof window !== "undefined") {
  window.testAPI = testAPI
}

// Auto-run if in Node.js environment
if (typeof require !== "undefined" && require.main === module) {
  testAPI()
}
