const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ""

// Upload images to the server
export const uploadImages = async (formData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload-images`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload images")
    }

    return await response.json()
  } catch (error) {
    console.error("Error uploading images:", error)
    throw error
  }
}

// Generate the invite
export const generateInvite = async (inviteId: string, formData: any, uploadedImages: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inviteId,
        formData,
        uploadedImages,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate invite")
    }

    return await response.json()
  } catch (error) {
    console.error("Error generating invite:", error)
    throw error
  }
}

// Get invite data
export const getInvite = async (inviteId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/invite/${inviteId}`)

    if (!response.ok) {
      throw new Error("Failed to fetch invite")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching invite:", error)
    throw error
  }
}
