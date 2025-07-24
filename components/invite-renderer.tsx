"use client"

import React, { useState, useEffect } from "react"

interface InviteRendererProps {
  inviteData: {
    id: string
    code: string
    formData: any
    uploadedImages: any
    createdAt: string
  }
}

// Function to dynamically create component from code string
const createComponentFromCode = (code: string) => {
  try {
    // Create a function that returns the component
    const componentFunction = new Function(
      "React",
      `
      const { useState, useEffect } = React;
      ${code}
      return InviteComponent || App || Component;
    `,
    )

    // Execute the function to get the component
    return componentFunction(React)
  } catch (error) {
    console.error("Error creating component:", error)
    return null
  }
}

export default function InviteRenderer({ inviteData }: InviteRendererProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [InviteComponent, setInviteComponent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    try {
      if (inviteData.code) {
        // Create component from the generated code
        const DynamicComponent = createComponentFromCode(inviteData.code)

        if (DynamicComponent) {
          setInviteComponent(() => DynamicComponent)
        } else {
          throw new Error("Failed to render invite")
        }
      } else {
        throw new Error("Invalid invite data")
      }
    } catch (err) {
      console.error("Error loading invite:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [inviteData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your invite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  if (!InviteComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <p className="text-gray-600">Unable to load invite. Please try again later.</p>
        </div>
      </div>
    )
  }

  // Render the dynamically loaded component
  return <InviteComponent />
}
