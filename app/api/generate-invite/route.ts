import { type NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { DatabaseUtils } from "@/lib/supabase-utils"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Event type templates for better context
const eventTemplates = {
  birthday: {
    tone: "celebratory and personal",
    elements: ["countdown timer", "age milestone", "party details", "gift preferences"],
    colors: "vibrant and festive",
    animations: "confetti, floating balloons, sparkles",
  },
  wedding: {
    tone: "elegant and romantic",
    elements: ["couple names", "ceremony details", "reception info", "dress code", "registry"],
    colors: "soft and sophisticated",
    animations: "gentle fades, subtle parallax, rose petals",
  },
  corporate: {
    tone: "professional and modern",
    elements: ["agenda", "speakers", "registration", "venue details"],
    colors: "brand colors or neutral professional",
    animations: "smooth transitions, minimal effects",
  },
  babyShower: {
    tone: "warm and joyful",
    elements: ["parent names", "registry", "games", "theme"],
    colors: "soft pastels",
    animations: "gentle bounces, floating clouds, stars",
  },
  graduation: {
    tone: "proud and accomplished",
    elements: ["graduate name", "school", "degree", "celebration details"],
    colors: "school colors or classic",
    animations: "confetti, cap toss effect",
  },
}

function detectEventType(title: string, description: string): keyof typeof eventTemplates {
  const combined = `${title} ${description}`.toLowerCase()

  if (combined.includes("birthday") || combined.includes("bday")) return "birthday"
  if (combined.includes("wedding") || combined.includes("marriage")) return "wedding"
  if (combined.includes("baby") || combined.includes("shower")) return "babyShower"
  if (combined.includes("corporate") || combined.includes("conference") || combined.includes("seminar"))
    return "corporate"
  if (combined.includes("graduation") || combined.includes("graduate")) return "graduation"

  return "birthday" // default
}

function generateEnhancedPrompt(formData: any) {
  const {
    eventTitle,
    eventDate,
    eventTime,
    venue,
    dressCode,
    eventTheme,
    colorScheme,
    rsvpWhatsApp,
    rsvpContact,
    eventDescription,
    uploadedImages = {},
  } = formData

  const eventType = detectEventType(eventTitle, eventDescription)
  const stylePreference = eventTheme || "elegant"

  const eventTemplate = eventTemplates[eventType] || eventTemplates.birthday

  // Detect if this is a milestone event
  const isMilestone = eventTitle.match(/\d+/) || eventDescription.match(/\d+(st|nd|rd|th)/)
  
  // Format date for better display
  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : eventDate

  // Convert 24h time to 12h format
  const formattedTime = eventTime ? new Date(`2000-01-01T${eventTime}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) : eventTime

  const prompt = `
Create a React component for a mobile-first ${eventType} invitation landing page with a ${stylePreference} design style.

EVENT CONTEXT:
- Event Type: ${eventType} (${eventTemplate.tone})
- Title: ${eventTitle}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Venue: ${venue}
${dressCode ? `- Dress Code: ${dressCode}` : ""}
${eventTheme ? `- Theme: ${eventTheme}` : ""}
${colorScheme ? `- Color Scheme: ${colorScheme} palette` : ""}
${isMilestone ? `- Special Milestone: Yes` : ""}

DESCRIPTION:
${eventDescription}

DESIGN SPECIFICATIONS:
- Style: ${stylePreference} design with ${colorScheme ? `${colorScheme} color palette` : eventTemplate.colors} colors
${colorScheme ? `- Color Theme: Use ${colorScheme} as primary color inspiration (sophisticated ${colorScheme.toLowerCase()} tones)` : ""}
- Typography: Modern, readable fonts with proper hierarchy
- Animation Style: ${eventTemplate.animations}
- Key Elements: ${eventTemplate.elements.join(", ")}
- Layout: Card-based sections with smooth transitions

REQUIRED SECTIONS:
1. Hero Section
   - ${uploadedImages.hero ? "Use provided hero image as background" : "Create gradient or pattern background"}
   - Event title prominently displayed
   - Date and time
   - ${isMilestone ? "Highlight the milestone number" : ""}

2. Event Details Section
   - Engaging description
   - Key highlights
   - What to expect

3. Countdown Timer
   - Dynamic countdown to ${formattedDate} at ${formattedTime}
   - Elegant display with days, hours, minutes, seconds
   - Zero state message when event arrives: "The celebration has begun!"
   - Use JavaScript setInterval to update every second
   - Visual emphasis with animations

4. Venue/Location Section
   - Venue name and address
   - Directions or map integration
   - Parking information if provided

${
  dressCode
    ? `
5. Dress Code Section
   - Clear dress code instructions
   - Visual examples or color swatches if relevant
`
    : ""
}

6. RSVP Section
   - Clear call-to-action with urgency
   ${rsvpWhatsApp ? `- WhatsApp button linking to https://wa.me/${rsvpWhatsApp.replace(/[^0-9]/g, '')}?text=Hi! I'd like to RSVP for ${eventTitle} on ${formattedDate}` : ""}
   ${rsvpContact ? `- Call button linking to tel:${rsvpContact}` : ""}
   ${!rsvpWhatsApp && !rsvpContact ? `- Contact form or email RSVP option` : ""}
   - RSVP deadline prominently displayed
   - Multiple RSVP options for convenience

TECHNICAL REQUIREMENTS:
- Single self-contained React component named "InviteComponent"
- Mobile-first responsive design (test on 375px width)
- Use Tailwind CSS for styling
- Smooth scrolling between sections
- Loading animation (2-3 seconds)  
- Back to top button
- SEO-friendly structure
- Accessibility considerations (ARIA labels, semantic HTML)
- Use JSX syntax freely (< > tags are fine)
- Use React hooks (useState, useEffect) for interactivity and countdown timer
- Include inline JavaScript for countdown functionality

IMAGES TO INCORPORATE:
${uploadedImages.hero ? `- Hero background: Use the provided hero image URL as main background with overlay for readability` : "- Create an elegant gradient or pattern background that matches the color scheme"}
${uploadedImages.logo ? `- Event logo: Use the provided logo URL prominently in hero section and footer` : ""}
${uploadedImages.themeImages?.length ? `- Theme images: ${uploadedImages.themeImages.length} additional images provided - use in gallery section or as decorative elements` : ""}
${uploadedImages.additional?.length ? `- Additional images: ${uploadedImages.additional.length} more images for content enhancement` : ""}

Remember to:
1. Use modern React hooks (useState, useEffect)
2. Include all styles with Tailwind CSS classes
3. Ensure fast load times with optimized animations
4. Make it feel personal and match the event's tone
5. Test responsive design thoroughly
6. Add delightful micro-interactions
7. Include proper WhatsApp and phone links for RSVP

Generate a complete, production-ready React component that creates an unforgettable digital invitation.
Export the component as default.`

  return prompt
}

export async function POST(request: NextRequest) {
  try {
    const { inviteId, formData, uploadedImages } = await request.json()

    // Validate required fields
    if (!inviteId || !formData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Enrich form data with uploaded images
    const enrichedFormData = {
      ...formData,
      uploadedImages,
    }

    // Generate the enhanced prompt
    const prompt = generateEnhancedPrompt(enrichedFormData)

    // Generate the invite using Anthropic Claude
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const generatedCode = response.content[0].type === "text" ? response.content[0].text : ""

    // Clean up the generated code more thoroughly
    const cleanCode = generatedCode
      // Remove markdown code blocks
      .replace(/```jsx\n?/gi, "")
      .replace(/```tsx\n?/gi, "")
      .replace(/```javascript\n?/gi, "")
      .replace(/```js\n?/gi, "")
      .replace(/```react\n?/gi, "")
      .replace(/```\n?/g, "")
      // Remove any leading/trailing explanatory text
      .replace(/^.*?(?=import|const|function|class|export)/s, "")
      .replace(/^.*?(?=\/\/|\/\*|\s*const|\s*function|\s*class|\s*export)/s, "")
      // Clean up extra whitespace
      .trim()
      
    console.log('Original generated code length:', generatedCode.length)
    console.log('Cleaned code length:', cleanCode.length)
    console.log('Cleaned code preview:', cleanCode.substring(0, 500))

    // Generate complete HTML page with the JSX component embedded
    const formattedDate = enrichedFormData.eventDate ? new Date(enrichedFormData.eventDate).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }) : enrichedFormData.eventDate;

    const renderedHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${enrichedFormData.eventTitle || 'Event Invitation'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      </head>
      <body>
        <div id="invite-root"></div>
        <script type="text/babel">
          const { useState, useEffect } = React;
          
          ${cleanCode}
          
          // Render the component
          const inviteComponent = typeof InviteComponent !== 'undefined' ? InviteComponent : 
                                 typeof Component !== 'undefined' ? Component : 
                                 typeof App !== 'undefined' ? App : null;
          
          if (inviteComponent) {
            ReactDOM.render(React.createElement(inviteComponent), document.getElementById('invite-root'));
          } else {
            // Fallback HTML if component fails
            document.getElementById('invite-root').innerHTML = \`
              <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-8">
                  <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
                    <h1 class="text-2xl font-bold mb-2">${enrichedFormData.eventTitle || 'Event Invitation'}</h1>
                    <p class="text-blue-100">${formattedDate && enrichedFormData.eventTime ? `${formattedDate} at ${enrichedFormData.eventTime}` : 'Date & Time TBD'}</p>
                  </div>
                  <div class="p-6">
                    <div class="mb-4">
                      <h2 class="text-lg font-semibold text-gray-800 mb-2">Event Details</h2>
                      ${enrichedFormData.venue ? `<p class="text-gray-600 mb-2">📍 ${enrichedFormData.venue}</p>` : ''}
                      ${enrichedFormData.eventDescription ? `<p class="text-gray-700 mb-4">${enrichedFormData.eventDescription}</p>` : ''}
                      ${enrichedFormData.dressCode ? `<p class="text-gray-600 mb-2">👔 Dress Code: ${enrichedFormData.dressCode}</p>` : ''}
                    </div>
                    ${(enrichedFormData.rsvpWhatsApp || enrichedFormData.rsvpContact) ? `
                      <div class="border-t pt-4">
                        <h3 class="text-lg font-semibold text-gray-800 mb-3">RSVP</h3>
                        ${enrichedFormData.rsvpWhatsApp ? `<a href="https://wa.me/${enrichedFormData.rsvpWhatsApp.replace(/[^0-9]/g, '')}?text=Hi! I'd like to RSVP for ${enrichedFormData.eventTitle}" class="block w-full bg-green-500 text-white text-center py-2 px-4 rounded mb-2 hover:bg-green-600 transition-colors">💬 RSVP via WhatsApp</a>` : ''}
                        ${enrichedFormData.rsvpContact ? `<a href="tel:${enrichedFormData.rsvpContact}" class="block w-full bg-blue-500 text-white text-center py-2 px-4 rounded hover:bg-blue-600 transition-colors">📞 Call to RSVP</a>` : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            \`;
          }
        </script>
      </body>
      </html>
    `;

    console.log('Generated complete HTML page, length:', renderedHtml.length);

    // Prepare invite data
    const inviteData = {
      id: inviteId,
      formData: enrichedFormData,
      generatedCode: cleanCode, // Keep original code for reference
      renderedHtml: renderedHtml, // Add rendered HTML
      userEmail: formData.userEmail || null,
    }

    // Save to Supabase database
    try {
      await DatabaseUtils.saveInvite(inviteData)
    } catch (dbError) {
      console.error("Error saving to database:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save invite to database",
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      inviteId,
      inviteUrl: `/invite/${inviteId}`,
      usage: response.usage,
    })
  } catch (error) {
    console.error("Error generating invite:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate invite",
      },
      { status: 500 },
    )
  }
}
