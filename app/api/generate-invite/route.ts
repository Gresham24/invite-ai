import { type NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { sql } from "@vercel/postgres"

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

// Style complexity templates
const styleTemplates = {
  minimalist: {
    description: "Clean lines, lots of whitespace, subtle animations",
    sections: ["hero", "details", "rsvp"],
    fontStyle: "modern sans-serif",
    animations: "subtle fade-ins and smooth scrolls",
  },
  elegant: {
    description: "Sophisticated typography, refined color palette, graceful animations",
    sections: ["hero", "story", "details", "venue", "dress code", "rsvp"],
    fontStyle: "serif for headings, sans-serif for body",
    animations: "elegant reveals, parallax effects",
  },
  playful: {
    description: "Fun animations, bright colors, interactive elements",
    sections: ["hero", "countdown", "details", "activities", "rsvp"],
    fontStyle: "rounded, friendly fonts",
    animations: "bouncy effects, floating elements, confetti",
  },
  modern: {
    description: "Bold typography, geometric shapes, dynamic transitions",
    sections: ["hero", "about", "schedule", "location", "rsvp"],
    fontStyle: "bold sans-serif, high contrast",
    animations: "slide transitions, morphing shapes",
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
  const styleTemplate = styleTemplates[stylePreference as keyof typeof styleTemplates] || styleTemplates.elegant

  // Detect if this is a milestone event
  const isMilestone = eventTitle.match(/\d+/) || eventDescription.match(/\d+(st|nd|rd|th)/)

  const prompt = `
Create a React component for a mobile-first ${eventType} invitation landing page with a ${stylePreference} design style.

EVENT CONTEXT:
- Event Type: ${eventType} (${eventTemplate.tone})
- Title: ${eventTitle}
- Date: ${eventDate}
- Time: ${eventTime}
- Venue: ${venue}
${dressCode ? `- Dress Code: ${dressCode}` : ""}
${eventTheme ? `- Theme: ${eventTheme}` : ""}
${colorScheme ? `- Color Scheme: ${colorScheme}` : ""}
${isMilestone ? `- Special Milestone: Yes` : ""}

DESCRIPTION:
${eventDescription}

DESIGN SPECIFICATIONS:
- Style: ${styleTemplate.description}
- Color Palette: ${eventTemplate.colors} ${eventTheme ? `with ${eventTheme} theme elements` : ""}
- Typography: ${styleTemplate.fontStyle}
- Animation Style: ${styleTemplate.animations}
- Key Elements: ${eventTemplate.elements.join(", ")}

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
   - Dynamic countdown to event date/time
   - ${stylePreference === "playful" ? "Fun animated numbers" : "Elegant display"}
   - Zero state message when event arrives

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
   - Clear call-to-action
   ${rsvpWhatsApp ? `- WhatsApp button with pre-filled message to ${rsvpWhatsApp}` : ""}
   ${rsvpContact ? `- Call button for ${rsvpContact}` : ""}
   - RSVP deadline prominently displayed

TECHNICAL REQUIREMENTS:
- Single self-contained React component named "InviteComponent"
- Mobile-first responsive design (test on 375px width)
- Use Tailwind CSS for styling
- Smooth scrolling between sections
- Loading animation (2-3 seconds)
- Back to top button
- SEO-friendly structure
- Accessibility considerations (ARIA labels, semantic HTML)
- Use React hooks (useState, useEffect) for interactivity

IMAGES TO INCORPORATE:
${uploadedImages.hero ? "- Hero background: Use the provided hero image URL" : ""}
${uploadedImages.logo ? "- Event logo: Use the provided logo URL (place in hero and footer)" : ""}
${uploadedImages.themeImages?.length ? `- Theme images: ${uploadedImages.themeImages.length} additional images provided` : ""}

SPECIAL FEATURES FOR ${eventType.toUpperCase()}:
${
  eventType === "birthday"
    ? `
- Age-specific decorations (balloons, confetti)
- Birthday countdown with cake animation
- Special message section for birthday person
`
    : ""
}
${
  eventType === "wedding"
    ? `
- Romantic animations (hearts, rose petals)
- Wedding party section
- Registry/gift information
- Hashtag for social media
`
    : ""
}

ANIMATION SPECIFICATIONS:
${
  stylePreference === "playful"
    ? `
- Confetti on load
- Bouncing elements
- Hover effects on all interactive elements
- Fun scroll animations
`
    : stylePreference === "elegant"
      ? `
- Subtle fade-ins
- Smooth parallax scrolling
- Elegant hover states
- Graceful transitions
`
      : `
- Clean transitions
- Professional animations
- Minimal but effective motion
`
}

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

    // Clean up the generated code
    const cleanCode = generatedCode
      .replace(/```jsx\n?/g, "")
      .replace(/```tsx\n?/g, "")
      .replace(/```javascript\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    // Store the invite data in the database
    await sql`
      INSERT INTO invites (id, form_data, generated_code, uploaded_images, created_at)
      VALUES (${inviteId}, ${JSON.stringify(enrichedFormData)}, ${cleanCode}, ${JSON.stringify(uploadedImages)}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        form_data = ${JSON.stringify(enrichedFormData)},
        generated_code = ${cleanCode},
        uploaded_images = ${JSON.stringify(uploadedImages)},
        updated_at = NOW()
    `

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
