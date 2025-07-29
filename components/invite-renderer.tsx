"use client"

import React, { useState, useEffect } from "react"
import { getInvite, handleApiError, generateInvite, retryRequest } from "@/lib/api-client"

interface InviteRendererProps {
  inviteId: string
}

export default function InviteRenderer({ inviteId }: InviteRendererProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteData, setInviteData] = useState<any>(null)
  const [isResubmitting, setIsResubmitting] = useState(false)
  const [originalFormData, setOriginalFormData] = useState<any>(null)

  // Function to resubmit the invite generation
  const resubmitInviteGeneration = async () => {
    if (!originalFormData) {
      console.error("No original form data available for resubmission");
      return;
    }

    setIsResubmitting(true);
    setError(null);

    try {
      // Use the retry utility to resubmit the generation
      const response = await retryRequest(
        () => generateInvite({
          inviteId,
          formData: originalFormData.formData,
          uploadedImages: originalFormData.uploadedImages || {},
        }),
        3, // max retries
        2000 // delay between retries
      );

      // If successful, reload the page to show the new invite
      window.location.reload();
    } catch (err) {
      console.error("Error resubmitting invite generation:", err);
      setError(handleApiError(err));
    } finally {
      setIsResubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchInvite() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch the invite data from the API
        const data = await getInvite(inviteId)
        setInviteData(data)
        
        // Store the original form data for potential resubmission
        if (data.form_data) {
          setOriginalFormData({
            formData: data.form_data,
            uploadedImages: data.form_data.uploadedImages || {},
          });
        }

        // Check if we have rendered HTML or generated code
        if (!data.rendered_html && !data.generated_code) {
          throw new Error("No invitation content found");
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
            {originalFormData ? (
              <button
                onClick={resubmitInviteGeneration}
                disabled={isResubmitting}
                className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isResubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Regenerating...
                  </>
                ) : (
                  "Regenerate Invite"
                )}
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => {
                // Store the original form data in localStorage for recovery
                if (originalFormData?.formData) {
                  localStorage.setItem('invite_form_data_recovery', JSON.stringify({
                    ...originalFormData.formData,
                    timestamp: Date.now(),
                    // Don't store uploaded files, just the text data
                    heroImage: null,
                    eventLogo: null,
                    themeImages: [],
                    additionalImages: []
                  }));
                }
                window.location.href = '/create';
              }}
              className="block w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!inviteData) {
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

  // Render the invitation HTML
  return (
    <div className="invite-container">
      {/* Display the rendered HTML */}
      {inviteData.rendered_html ? (
        <iframe
          srcDoc={inviteData.rendered_html}
          className="w-full min-h-screen border-0"
          title="Event Invitation"
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        // Fallback for old invites that only have generated_code
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
              <h1 className="text-2xl font-bold mb-2">{inviteData.form_data?.eventTitle || 'Event Invitation'}</h1>
              <p className="text-blue-100">
                {inviteData.form_data?.eventDate && inviteData.form_data?.eventTime 
                  ? `${inviteData.form_data.eventDate} at ${inviteData.form_data.eventTime}` 
                  : 'Date & Time TBD'
                }
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Event Details</h2>
                {inviteData.form_data?.venue && (
                  <p className="text-gray-600 mb-2">📍 {inviteData.form_data.venue}</p>
                )}
                {inviteData.form_data?.eventDescription && (
                  <p className="text-gray-700 mb-4">{inviteData.form_data.eventDescription}</p>
                )}
                {inviteData.form_data?.dressCode && (
                  <p className="text-gray-600 mb-2">👔 Dress Code: {inviteData.form_data.dressCode}</p>
                )}
              </div>
              {(inviteData.form_data?.rsvpWhatsApp || inviteData.form_data?.rsvpContact) && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">RSVP</h3>
                  {inviteData.form_data?.rsvpWhatsApp && (
                    <a
                      href={`https://wa.me/${inviteData.form_data.rsvpWhatsApp.replace(/[^0-9]/g, '')}?text=Hi! I'd like to RSVP for ${inviteData.form_data.eventTitle}`}
                      className="block w-full bg-green-500 text-white text-center py-2 px-4 rounded mb-2 hover:bg-green-600 transition-colors"
                    >
                      💬 RSVP via WhatsApp
                    </a>
                  )}
                  {inviteData.form_data?.rsvpContact && (
                    <a
                      href={`tel:${inviteData.form_data.rsvpContact}`}
                      className="block w-full bg-blue-500 text-white text-center py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                    >
                      📞 Call to RSVP
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Floating action buttons for invite management - only show when not using iframe */}
      {!inviteData.rendered_html && (
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
      )}
    </div>
  )
}