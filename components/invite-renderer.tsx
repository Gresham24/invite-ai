"use client"

import React, { useState, useEffect } from "react"
import { getInvite, handleApiError } from "@/lib/api-client"

interface InviteRendererProps {
  inviteId: string
}

// Function to safely create component from code string
const createComponentFromCode = (code: string) => {
  try {
    // Basic validation - check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout\s*\(/,
      /setInterval\s*\(/,
      /document\./,
      /window\./,
      /global\./,
      /process\./,
      /require\s*\(/,
      /import\s*\(/,
      /__dirname/,
      /__filename/,
    ];
    
    const hasDangerousCode = dangerousPatterns.some(pattern => pattern.test(code));
    if (hasDangerousCode) {
      console.warn('Generated code contains potentially dangerous patterns');
      throw new Error('Generated code failed security validation');
    }
    
    // Limit code length
    if (code.length > 50000) {
      throw new Error('Generated code is too large');
    }
    
    // Create a safer function that returns the component
    const componentFunction = new Function(
      "React",
      `
      "use strict";
      const { useState, useEffect } = React;
      try {
        ${code}
        return InviteComponent || App || Component || null;
      } catch (error) {
        console.error('Error in generated component:', error);
        return null;
      }
    `,
    );

    // Execute the function to get the component
    const Component = componentFunction(React);
    
    if (!Component) {
      throw new Error('No valid component exported from generated code');
    }
    
    return Component;
  } catch (error) {
    console.error("Error creating component:", error);
    return null;
  }
};

export default function InviteRenderer({ inviteId }: InviteRendererProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [InviteComponent, setInviteComponent] = useState<React.ComponentType | null>(null)
  const [inviteData, setInviteData] = useState<any>(null)

  useEffect(() => {
    async function fetchInvite() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch the invite data from the API
        const data = await getInvite(inviteId)
        setInviteData(data)
        
        if (data.generated_code) {
          // Create component from the generated code with error boundary
          const DynamicComponent = createComponentFromCode(data.generated_code);

          if (DynamicComponent) {
            // Wrap component with error boundary
            const SafeComponent = () => {
              try {
                return React.createElement(DynamicComponent);
              } catch (error) {
                console.error('Runtime error in generated component:', error);
                return React.createElement('div', {
                  className: 'min-h-screen flex items-center justify-center bg-gray-50'
                }, React.createElement('div', {
                  className: 'text-center p-8 bg-white rounded-lg shadow-lg max-w-md'
                }, [
                  React.createElement('h2', {
                    key: 'title',
                    className: 'text-xl font-semibold text-red-600 mb-4'
                  }, 'Invite Rendering Error'),
                  React.createElement('p', {
                    key: 'message',
                    className: 'text-gray-600 mb-4'
                  }, 'There was an error displaying this invitation. Please try refreshing the page.'),
                  React.createElement('button', {
                    key: 'refresh',
                    onClick: () => window.location.reload(),
                    className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                  }, 'Refresh Page')
                ]));
              }
            };
            
            setInviteComponent(() => SafeComponent);
          } else {
            throw new Error("Failed to render invite component");
          }
        } else {
          throw new Error("No generated code found for this invite");
        }
      } catch (err) {
        console.error("Error fetching invite:", err)
        setError(handleApiError(err))
      } finally {
        setLoading(false)
      }
    }

    if (inviteId) {
      fetchInvite()
    } else {
      setError("Invalid invite ID")
      setLoading(false)
    }
  }, [inviteId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading your invite...</h2>
          <p className="text-gray-600">Please wait while we fetch your invitation</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to load invite</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="block w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!InviteComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Invite Not Available</h2>
          <p className="text-gray-600 mb-6">This invitation could not be loaded. It may have been removed or is no longer available.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create New Invite
          </a>
        </div>
      </div>
    )
  }

  // Render the dynamically loaded component with error boundary
  return (
    <div className="invite-container">
      <InviteComponent />
      
      {/* Floating action buttons for invite management */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
        <button
          onClick={() => window.navigator.share && window.navigator.share({
            title: inviteData?.form_data?.eventTitle || 'Event Invitation',
            text: 'You\'re invited to join us!',
            url: window.location.href
          })}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Share this invite"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
        
        <button
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
              // Could show a toast notification here
              alert('Invite link copied to clipboard!');
            });
          }}
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Copy invite link"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
