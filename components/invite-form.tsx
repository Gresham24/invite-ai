"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AILoadingScreen from "./load-screen";
import { generateInvite, uploadImages, handleApiError, APIError } from "@/lib/api-client";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

const AIInviteForm = () => {
  const [formData, setFormData] = useState({
    eventTitle: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    dressCode: "",
    eventTheme: "",
    colorScheme: "",
    rsvpWhatsApp: "",
    rsvpContact: "",
    eventDescription: "",
    themeImages: [],
    loaderImage: null,
    heroImage: null,
    additionalImages: [],
    eventLogo: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState({});
  const [colorSchemeIndex, setColorSchemeIndex] = useState(0);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const router = useRouter();
  const { toast } = useToast();

  // Color schemes data
  const colorSchemes = [
    {
      name: "Elegant",
      colors: ["#1a1a1a", "#4a4a4a", "#e5e5e5"],
      description: "Sophisticated black, gray, and white"
    },
    {
      name: "Vibrant",
      colors: ["#ef4444", "#3b82f6", "#f97316"],
      description: "Bold reds, blues, and oranges"
    },
    {
      name: "Pastel",
      colors: ["#fce7f3", "#bbf7d0", "#bfdbfe"],
      description: "Soft pinks, greens, and blues"
    },
    {
      name: "Natural",
      colors: ["#16a34a", "#a3a3a3", "#92400e"],
      description: "Earth tones and natural greens"
    },
    {
      name: "Romantic",
      colors: ["#ec4899", "#f472b6", "#fbb6ce"],
      description: "Warm pinks and roses"
    },
    {
      name: "Royal",
      colors: ["#7c3aed", "#fbbf24", "#1e40af"],
      description: "Majestic purples and golds"
    },
    {
      name: "Sunset",
      colors: ["#f97316", "#fbbf24", "#fb923c"],
      description: "Warm oranges and yellows"
    },
    {
      name: "Ocean",
      colors: ["#0ea5e9", "#06b6d4", "#67e8f9"],
      description: "Cool blues and teals"
    },
    {
      name: "Monochrome",
      colors: ["#000000", "#6b7280", "#ffffff"],
      description: "Classic black and white"
    },
    {
      name: "Autumn",
      colors: ["#dc2626", "#f59e0b", "#92400e"],
      description: "Warm autumn colors"
    }
  ];

  // Handle color scheme selection
  const handleColorSchemeSelect = (schemeName) => {
    if (formData.colorScheme === schemeName) {
      // Unselect if already selected
      handleInputChange('colorScheme', '');
    } else {
      handleInputChange('colorScheme', schemeName);
    }
  };

  // Carousel navigation
  const nextColorScheme = () => {
    setColorSchemeIndex((prev) => (prev + 1) % Math.ceil(colorSchemes.length / 4));
  };

  const prevColorScheme = () => {
    setColorSchemeIndex((prev) => (prev - 1 + Math.ceil(colorSchemes.length / 4)) % Math.ceil(colorSchemes.length / 4));
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Handle file uploads
  const handleFileUpload = (field, files) => {
    if (field === 'themeImages' || field === 'additionalImages') {
      const fileArray = Array.from(files);
      setFormData(prev => ({ ...prev, [field]: [...prev[field], ...fileArray] }));
    } else {
      setFormData(prev => ({ ...prev, [field]: files[0] }));
    }
  };

  // Remove uploaded file
  const removeFile = (field, index = null) => {
    if (index !== null) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.eventTitle.trim()) newErrors.eventTitle = "Event title is required";
    if (!formData.eventDate) newErrors.eventDate = "Event date is required";
    if (!formData.eventTime) newErrors.eventTime = "Event time is required";
    if (!formData.venue.trim()) newErrors.venue = "Venue is required";
    if (!formData.eventDescription.trim()) newErrors.eventDescription = "Event description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setShowLoadingScreen(true);
    setApiError(null);

    try {
      // Generate unique invite ID
      const inviteId = uuidv4();
      
      // Step 1: Upload images first if any exist
      let uploadedImages = {};
      
      const filesToUpload = {
        heroImage: formData.heroImage ? [formData.heroImage] : undefined,
        eventLogo: formData.eventLogo ? [formData.eventLogo] : undefined,
        themeImages: formData.themeImages.length > 0 ? formData.themeImages : undefined,
        additionalImages: formData.additionalImages.length > 0 ? formData.additionalImages : undefined,
      };
      
      // Check if there are any files to upload
      const hasFilesToUpload = Object.values(filesToUpload).some(files => files && files.length > 0);
      
      if (hasFilesToUpload) {
        console.log('Uploading images...');
        setUploadProgress(25);
        
        const uploadResponse = await uploadImages(inviteId, filesToUpload);
        uploadedImages = uploadResponse.uploadedImages;
        setUploadProgress(50);
      }
      
      // Step 2: Generate the invite
      console.log('Generating invite...');
      setUploadProgress(75);
      
      const generateResponse = await generateInvite({
        inviteId,
        formData: {
          eventTitle: formData.eventTitle,
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          venue: formData.venue,
          dressCode: formData.dressCode,
          eventTheme: formData.eventTheme,
          colorScheme: formData.colorScheme,
          rsvpWhatsApp: formData.rsvpWhatsApp,
          rsvpContact: formData.rsvpContact,
          eventDescription: formData.eventDescription,
          userEmail: 'user@example.com', // TODO: Get from auth context
        },
        uploadedImages,
      });
      
      setUploadProgress(100);
      
      // Success! Show success toast and redirect
      console.log('Invite generated successfully:', generateResponse);
      toast({
        title: "Success!",
        description: "Your invitation has been generated successfully.",
        duration: 3000,
      });
      
      // Wait a moment for the loading screen to complete
      setTimeout(() => {
        router.push(generateResponse.inviteUrl);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating invite:', error);
      setApiError(handleApiError(error));
      setShowLoadingScreen(false);
      setIsSubmitting(false);
    }
  };
  // Handle loading completion
  const handleLoadingComplete = () => {
    // This will be handled by the submission flow now
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Create Your Invite</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Event Title *</label>
            <input
              type="text"
              value={formData.eventTitle}
              onChange={(e) => handleInputChange('eventTitle', e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter event title"
            />
            {errors.eventTitle && <p className="text-red-500 text-sm mt-1">{errors.eventTitle}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Date *</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              {errors.eventDate && <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Event Time *</label>
              <input
                type="time"
                value={formData.eventTime}
                onChange={(e) => handleInputChange('eventTime', e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              {errors.eventTime && <p className="text-red-500 text-sm mt-1">{errors.eventTime}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Venue *</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => handleInputChange('venue', e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter venue location"
            />
            {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.eventDescription}
              onChange={(e) => handleInputChange('eventDescription', e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Describe your event"
            />
            {errors.eventDescription && <p className="text-red-500 text-sm mt-1">{errors.eventDescription}</p>}
          </div>
          
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{apiError}</p>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-red-600 underline text-sm mt-2"
              >
                Dismiss
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Generating...' : 'Generate Invite'}
          </button>
        </form>
      </div>
      
      <AILoadingScreen
        eventTitle={formData.eventTitle || "Your Event"}
        isVisible={showLoadingScreen}
        onComplete={handleLoadingComplete}
        progress={uploadProgress}
      />
    </div>
  );
};

export default AIInviteForm;
EOF < /dev/null