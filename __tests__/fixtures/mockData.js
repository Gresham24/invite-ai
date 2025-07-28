export const mockFormData = {
  simple: {
    eventTitle: "Sarah's 30th Birthday",
    eventDate: "2025-08-15",
    eventTime: "19:00",
    venue: "Sunset Rooftop Bar, 123 Ocean Drive, Miami Beach, FL",
    dressCode: "Cocktail Attire",
    eventTheme: "elegant",
    colorScheme: "Tropical Paradise",
    rsvpWhatsApp: "+1234567890",
    eventDescription:
      "Join us for an unforgettable evening celebrating Sarah's milestone birthday with cocktails, dinner, and dancing under the stars.",
  },
  advanced: {
    eventTitle: "Emma & James Wedding",
    eventDate: "2025-06-20",
    eventTime: "16:00",
    venue: "Rosewood Estate, 456 Garden Way, Napa Valley, CA",
    dressCode: "Black Tie",
    eventTheme: "elegant",
    colorScheme: "Classic Romance",
    rsvpWhatsApp: "+0987654321",
    rsvpContact: "+1122334455",
    eventDescription:
      "We joyfully invite you to celebrate our wedding day. Join us for an elegant evening of love, laughter, and happily ever after.",
  },
  birthday: {
    eventTitle: "Jake's 25th Birthday Bash",
    eventDate: "2025-09-10",
    eventTime: "20:00",
    venue: "Downtown Loft, 789 Party Street, New York, NY",
    dressCode: "Casual Fun",
    eventTheme: "playful",
    colorScheme: "Vibrant",
    rsvpWhatsApp: "+1555123456",
    eventDescription:
      "Come celebrate Jake turning 25 with music, dancing, and great friends! It's going to be an epic night.",
  },
  corporate: {
    eventTitle: "Annual Tech Conference 2025",
    eventDate: "2025-10-15",
    eventTime: "09:00",
    venue: "Convention Center, 456 Business Ave, San Francisco, CA",
    dressCode: "Business Professional",
    eventTheme: "modern",
    colorScheme: "Professional",
    rsvpContact: "+1555987654",
    eventDescription:
      "Join industry leaders for a day of innovation, networking, and insights into the future of technology.",
  },
}

export const mockImageFiles = {
  hero: {
    name: "hero-image.jpg",
    type: "image/jpeg",
    size: 1024000,
  },
  logo: {
    name: "event-logo.png",
    type: "image/png",
    size: 512000,
  },
  theme: [
    {
      name: "theme-1.jpg",
      type: "image/jpeg",
      size: 800000,
    },
    {
      name: "theme-2.jpg",
      type: "image/jpeg",
      size: 750000,
    },
  ],
}

export const mockUploadedImages = {
  hero: "https://res.cloudinary.com/test/image/upload/v1234567890/invites/test-id/hero/hero.jpg",
  logo: "https://res.cloudinary.com/test/image/upload/v1234567890/invites/test-id/logo/logo.png",
  themeImages: [
    "https://res.cloudinary.com/test/image/upload/v1234567890/invites/test-id/theme/theme-1.jpg",
    "https://res.cloudinary.com/test/image/upload/v1234567890/invites/test-id/theme/theme-2.jpg",
  ],
}
