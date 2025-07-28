"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AILoadingScreen from "./load-screen";
import { generateInvite, uploadImages, handleApiError, APIError } from "@/lib/api-client";
import { v4 as uuidv4 } from 'uuid';\nimport { useToast } from \"@/hooks/use-toast\";

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
  
  const router = useRouter();\n  const { toast } = useToast();

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
      
      // Success! Redirect to the generated invite
      console.log('Invite generated successfully:', generateResponse);
      
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
    // Loading screen will be hidden when navigation occurs
  };

  // Color Scheme Carousel Component
  const ColorSchemeCarousel = () => {
    const schemesPerPage = 4;
    const startIndex = colorSchemeIndex * schemesPerPage;
    const visibleSchemes = colorSchemes.slice(startIndex, startIndex + schemesPerPage);
    const totalPages = Math.ceil(colorSchemes.length / schemesPerPage);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Preferred Color Scheme
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={prevColorScheme}
              disabled={totalPages <= 1}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-gray-500">
              {colorSchemeIndex + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={nextColorScheme}
              disabled={totalPages <= 1}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          Optional: Choose a color palette to guide the AI's design choices
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {visibleSchemes.map((scheme, index) => (
            <div
              key={scheme.name}
              onClick={() => handleColorSchemeSelect(scheme.name)}
              className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                formData.colorScheme === scheme.name
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Color swatches */}
              <div className="flex space-x-1 mb-2">
                {scheme.colors.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Scheme name */}
              <h4 className="font-medium text-sm text-gray-800 mb-1">{scheme.name}</h4>
              
              {/* Description */}
              <p className="text-xs text-gray-500 leading-tight">{scheme.description}</p>
              
              {/* Selected indicator */}
              {formData.colorScheme === scheme.name && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </div>
          ))}
        </div>
        
        {/* Clear selection button */}
        {formData.colorScheme && (
          <motion.button
            type="button"
            onClick={() => handleInputChange('colorScheme', '')}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            Clear selection
          </motion.button>
        )}
      </div>
    );
  };

  // File preview component
  const FilePreview = ({ file, onRemove, type = "image" }) => {
    if (!file) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative group bg-white rounded-lg border-2 border-gray-200 p-2"
      >
        <div className="aspect-video rounded bg-gray-100 overflow-hidden">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>
        <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
      </motion.div>
    );
  };

  // Form steps
  const steps = [
    { id: 1, title: "Event Details", icon: "📅" },
    { id: 2, title: "Contact & Style", icon: "🎨" },
    { id: 3, title: "Images & Assets", icon: "🖼️" },
    { id: 4, title: "Review & Generate", icon: "✨" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white bg-opacity-80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-xl">invyte AI</span>
            </motion.div>
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Create Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Perfect Invite
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fill in your event details and let our AI create a stunning, mobile-first invitation for you.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          {/* Mobile Progress - Simplified */}
          <div className="block md:hidden">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    currentStep >= 1
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {steps[0].icon}
                </div>
                <div className={`w-6 h-0.5 ${currentStep > 1 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'}`} />
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    currentStep >= 2
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {steps[1].icon}
                </div>
                <div className={`w-6 h-0.5 ${currentStep > 2 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'}`} />
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    currentStep >= 3
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {steps[2].icon}
                </div>
                <div className={`w-6 h-0.5 ${currentStep > 3 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'}`} />
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    currentStep >= 4
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {steps[3].icon}
                </div>
              </div>
            </div>
            <p className="text-center text-sm font-medium text-gray-700">
              Step {currentStep} of 4: {steps[currentStep - 1].title}
            </p>
          </div>

          {/* Desktop Progress - Full */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold mb-2 transition-all duration-300 ${
                        currentStep >= step.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className="text-xs text-center max-w-20">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Event Details */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Event Details</h2>
                
                {/* Event Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.eventTitle}
                    onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.eventTitle ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Sarah's 25th Birthday Celebration"
                  />
                  {errors.eventTitle && <p className="text-red-500 text-sm mt-1">{errors.eventTitle}</p>}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.eventDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.eventDate && <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => handleInputChange('eventTime', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.eventTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.eventTime && <p className="text-red-500 text-sm mt-1">{errors.eventTime}</p>}
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue/Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.venue ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., The Garden Restaurant, 123 Main St, City"
                  />
                  {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.eventDescription}
                    onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                      errors.eventDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe your event, the atmosphere you want to create, and any special details..."
                  />
                  {errors.eventDescription && <p className="text-red-500 text-sm mt-1">{errors.eventDescription}</p>}
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact & Style */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Contact & Style</h2>
                
                {/* RSVP Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RSVP WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.rsvpWhatsApp}
                      onChange={(e) => handleInputChange('rsvpWhatsApp', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+27 123 456 7890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RSVP Contact Number
                    </label>
                    <input
                      type="tel"
                      value={formData.rsvpContact}
                      onChange={(e) => handleInputChange('rsvpContact', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+27 123 456 7890"
                    />
                  </div>
                </div>

                {/* Style Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Theme
                    </label>
                    <select
                      value={formData.eventTheme}
                      onChange={(e) => handleInputChange('eventTheme', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select a theme...</option>
                      <option value="elegant">Elegant & Sophisticated</option>
                      <option value="fun">Fun & Playful</option>
                      <option value="minimal">Minimal & Clean</option>
                      <option value="rustic">Rustic & Natural</option>
                      <option value="luxury">Luxury & Glamorous</option>
                      <option value="vintage">Vintage & Classic</option>
                      <option value="modern">Modern & Contemporary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dress Code
                    </label>
                    <input
                      type="text"
                      value={formData.dressCode}
                      onChange={(e) => handleInputChange('dressCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Cocktail attire, Casual, Black tie"
                    />
                  </div>
                </div>

                {/* Color Scheme Carousel */}
                <ColorSchemeCarousel />
              </motion.div>
            )}

            {/* Step 3: Images & Assets */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Images & Assets</h2>
                
                {/* Hero Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Background Image
                  </label>
                  <p className="text-sm text-gray-500 mb-3">Main background image for your invitation</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('heroImage', e.target.files)}
                      className="hidden"
                      id="heroImage"
                    />
                    <label htmlFor="heroImage" className="cursor-pointer">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600">Click to upload hero image</p>
                    </label>
                  </div>
                  {formData.heroImage && (
                    <div className="mt-4">
                      <FilePreview
                        file={formData.heroImage}
                        onRemove={() => removeFile('heroImage')}
                      />
                    </div>
                  )}
                </div>

                {/* Event Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Logo
                  </label>
                  <p className="text-sm text-gray-500 mb-3">Optional logo or branding for your event</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('eventLogo', e.target.files)}
                      className="hidden"
                      id="eventLogo"
                    />
                    <label htmlFor="eventLogo" className="cursor-pointer">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600">Click to upload logo</p>
                    </label>
                  </div>
                  {formData.eventLogo && (
                    <div className="mt-4">
                      <FilePreview
                        file={formData.eventLogo}
                        onRemove={() => removeFile('eventLogo')}
                      />
                    </div>
                  )}
                </div>

                {/* Theme Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme Images
                  </label>
                  <p className="text-sm text-gray-500 mb-3">Additional images that represent your event theme</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload('themeImages', e.target.files)}
                      className="hidden"
                      id="themeImages"
                    />
                    <label htmlFor="themeImages" className="cursor-pointer">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600">Click to upload multiple images</p>
                    </label>
                  </div>
                  {formData.themeImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.themeImages.map((file, index) => (
                        <FilePreview
                          key={index}
                          file={file}
                          onRemove={() => removeFile('themeImages', index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">Review & Generate</h2>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Event Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Event:</strong> {formData.eventTitle || "Not specified"}
                    </div>
                    <div>
                      <strong>Date:</strong> {formData.eventDate || "Not specified"}
                    </div>
                    <div>
                      <strong>Time:</strong> {formData.eventTime || "Not specified"}
                    </div>
                    <div>
                      <strong>Venue:</strong> {formData.venue || "Not specified"}
                    </div>
                    <div>
                      <strong>Theme:</strong> {formData.eventTheme || "Not specified"}
                    </div>
                    <div>
                      <strong>Color Scheme:</strong> {formData.colorScheme || "Not specified"}
                    </div>
                    <div>
                      <strong>Dress Code:</strong> {formData.dressCode || "Not specified"}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <strong>Description:</strong>
                    <p className="text-gray-600 mt-1">{formData.eventDescription || "Not specified"}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <strong>Hero Image:</strong> {formData.heroImage ? "✓ Uploaded" : "Not uploaded"}
                    </div>
                    <div>
                      <strong>Logo:</strong> {formData.eventLogo ? "✓ Uploaded" : "Not uploaded"}
                    </div>
                    <div>
                      <strong>Theme Images:</strong> {formData.themeImages.length} files
                    </div>
                    <div>
                      <strong>RSVP:</strong> {formData.rsvpWhatsApp || formData.rsvpContact ? "✓ Set" : "Not set"}
                    </div>
                  </div>
                </div>

                {/* API Error Display */}
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-red-800">Error</h4>
                        <p className="text-red-700 text-sm mt-1">{apiError}</p>
                        <button
                          onClick={() => setApiError(null)}
                          className="text-red-600 hover:text-red-800 text-sm underline mt-2"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-blue-800">Ready to Generate</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Our AI will create a beautiful, mobile-first invitation based on your inputs. This usually takes 10-15 seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <motion.button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
              whileTap={{ scale: currentStep === 1 ? 1 : 0.98 }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </motion.button>

            <motion.button
              type={currentStep === 4 ? "submit" : "button"}
              onClick={currentStep === 4 ? undefined : () => setCurrentStep(Math.min(4, currentStep + 1))}
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : currentStep === 4 ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Invite
                </>
              ) : (
                "Next"
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>

      {/* AI Loading Screen */}
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