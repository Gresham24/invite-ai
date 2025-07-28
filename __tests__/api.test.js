import { createMocks } from "node-mocks-http"
import { POST as uploadImagesHandler } from "../app/api/upload-images/route"
import { POST as generateInviteHandler } from "../app/api/generate-invite/route"
import { GET as getInviteHandler } from "../app/api/invite/[inviteId]/route"
import jest from "jest" // Declare the jest variable

// Mock Cloudinary
jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        const mockResult = {
          secure_url: `https://res.cloudinary.com/test/image/upload/v1234567890/test-image.jpg`,
          public_id: options.public_id,
        }
        callback(null, mockResult)
        return {
          end: jest.fn(),
        }
      }),
    },
  },
}))

// Mock Anthropic
jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [
          {
            type: "text",
            text: `
import React, { useState, useEffect } from 'react';

const InviteComponent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Test Birthday Party</h1>
        <div className="text-center">
          <p className="text-xl mb-4">December 25, 2025 at 6:00 PM</p>
          <p className="text-lg mb-8">Test Venue</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold">
            RSVP Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteComponent;
          `,
          },
        ],
        usage: {
          input_tokens: 100,
          output_tokens: 200,
        },
      }),
    },
  }))
})

// Mock Vercel Postgres
jest.mock("@vercel/postgres", () => ({
  sql: jest.fn().mockImplementation((strings, ...values) => {
    const query = strings.join("?")

    if (query.includes("INSERT INTO invites")) {
      return Promise.resolve({ rows: [] })
    }

    if (query.includes("SELECT") && query.includes("FROM invites")) {
      const inviteId = values[0]
      if (inviteId === "non-existent-id") {
        return Promise.resolve({ rows: [] })
      }
      return Promise.resolve({
        rows: [
          {
            id: inviteId,
            form_data: {
              eventTitle: "Test Event",
              eventDate: "2025-12-25",
              eventTime: "18:00",
              venue: "Test Venue",
              eventDescription: "Test description",
            },
            generated_code: "const InviteComponent = () => <div>Test Invite</div>; export default InviteComponent;",
            uploaded_images: {},
            created_at: new Date().toISOString(),
          },
        ],
      })
    }

    return Promise.resolve({ rows: [] })
  }),
}))

describe("AI Invite Generator API", () => {
  let inviteId

  describe("Image Upload", () => {
    test("POST /api/upload-images should handle image uploads", async () => {
      const formData = new FormData()
      const mockFile = new File(["test content"], "test-hero.jpg", { type: "image/jpeg" })
      formData.append("heroImage", mockFile)

      const { req } = createMocks({
        method: "POST",
        body: formData,
      })

      // Mock formData method
      req.formData = jest.fn().mockResolvedValue(formData)

      const response = await uploadImagesHandler(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inviteId).toBeDefined()
      expect(data.uploadedImages).toBeDefined()

      inviteId = data.inviteId
    })

    test("POST /api/upload-images should handle missing images", async () => {
      const formData = new FormData()

      const { req } = createMocks({
        method: "POST",
        body: formData,
      })

      req.formData = jest.fn().mockResolvedValue(formData)

      const response = await uploadImagesHandler(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inviteId).toBeDefined()
    })
  })

  describe("Invite Generation", () => {
    test("POST /api/generate-invite should generate an invite", async () => {
      const requestBody = {
        inviteId: inviteId || "test-invite-id",
        formData: {
          eventTitle: "Test Birthday Party",
          eventDate: "2025-12-25",
          eventTime: "18:00",
          venue: "Test Venue",
          eventDescription: "A test birthday celebration",
        },
        uploadedImages: {},
      }

      const { req } = createMocks({
        method: "POST",
        body: requestBody,
      })

      req.json = jest.fn().mockResolvedValue(requestBody)

      const response = await generateInviteHandler(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inviteId).toBeDefined()
      expect(data.inviteUrl).toBeDefined()
    })

    test("POST /api/generate-invite should handle errors gracefully", async () => {
      const { req } = createMocks({
        method: "POST",
        body: {},
      })

      req.json = jest.fn().mockRejectedValue(new Error("Invalid request"))

      const response = await generateInviteHandler(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })

  describe("Invite Retrieval", () => {
    test("GET /api/invite/:inviteId should return invite data", async () => {
      const { req } = createMocks({
        method: "GET",
      })

      const params = { inviteId: "test-123" }
      const response = await getInviteHandler(req, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.invite).toBeDefined()
      expect(data.invite.id).toBe("test-123")
      expect(data.invite.code).toBeDefined()
    })

    test("GET /api/invite/:inviteId should return 404 for non-existent invite", async () => {
      const { req } = createMocks({
        method: "GET",
      })

      const params = { inviteId: "non-existent-id" }
      const response = await getInviteHandler(req, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe("Invite not found")
    })
  })
})
