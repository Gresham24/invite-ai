"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link";

const AIInviteHomePage = () => {
  const [currentExample, setCurrentExample] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Example invites to showcase
  const examples = [
    {
      title: "Elegant Birthday Celebration",
      type: "Birthday Party",
      image: "/api/placeholder/400/600",
      color: "from-pink-500 to-purple-600",
    },
    {
      title: "Sophisticated Wedding",
      type: "Wedding",
      image: "/api/placeholder/400/600",
      color: "from-amber-400 to-orange-500",
    },
    {
      title: "Corporate Event",
      type: "Business Meeting",
      image: "/api/placeholder/400/600",
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Baby Shower",
      type: "Celebration",
      image: "/api/placeholder/400/600",
      color: "from-green-400 to-teal-500",
    },
  ]

  // Cycle through examples
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % examples.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 70,
        behavior: "smooth",
      })
    }
  }

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-80 backdrop-blur-md shadow-sm">
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
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("examples")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Examples
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                  ✨ AI-Powered • Mobile-First • Beautiful
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Create Stunning
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    Event Invites{" "}
                  </span>
                  in Seconds
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                  Transform your event details into beautiful, mobile-first digital invitations using the power of AI.
                  No design skills required—just upload your images and let our AI work its magic.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              >
                <Link href="/create" passHref legacyBehavior>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Your Invite
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection("examples")}
                  className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  See Examples
                </motion.button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex items-center justify-center lg:justify-start text-sm text-gray-500"
              >
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Free to use • No sign-up required • Instant results
              </motion.div>
            </div>

            {/* Right column - Animated phone mockups */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative mx-auto w-80 h-96">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentExample}
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    {/* Phone mockup */}
                    <div className="w-full h-full bg-gray-900 rounded-3xl p-2 shadow-2xl">
                      <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                        {/* Status bar */}
                        <div className="h-6 bg-gray-100 flex items-center justify-between px-4">
                          <div className="text-xs font-semibold">9:41</div>
                          <div className="flex space-x-1">
                            <div className="w-4 h-2 bg-gray-300 rounded-sm"></div>
                            <div className="w-4 h-2 bg-gray-300 rounded-sm"></div>
                            <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                          </div>
                        </div>

                        {/* Content */}
                        <div
                          className={`h-full bg-gradient-to-br ${examples[currentExample].color} p-4 flex flex-col justify-center items-center text-white`}
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4 mx-auto flex items-center justify-center">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 2C5.588 2 2 5.588 2 10s3.588 8 8 8 8-3.588 8-8-3.588-8-8-8zM8 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm1 3a1 1 0 100 2h2a1 1 0 100-2H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2">{examples[currentExample].title}</h3>
                            <p className="text-sm opacity-90 mb-4">{examples[currentExample].type}</p>
                            <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                              <p className="text-xs">📅 August 15, 2025</p>
                              <p className="text-xs">📍 Beautiful Venue</p>
                            </div>
                            <button className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
                              RSVP
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg"
                >
                  <span className="text-xl">✨</span>
                </motion.div>
                <motion.div
                  animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-400 rounded-lg flex items-center justify-center shadow-lg"
                >
                  <span className="text-xl">🎉</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Create
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Perfect Invites
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI understands your event and creates beautiful, mobile-optimized invitations that your guests will
              love.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🤖",
                title: "AI-Powered Design",
                description:
                  "Our intelligent AI analyzes your event details and creates stunning, personalized designs automatically.",
              },
              {
                icon: "📱",
                title: "Mobile-First",
                description:
                  "Every invite is optimized for mobile devices, ensuring your guests have a perfect experience on any screen.",
              },
              {
                icon: "⚡",
                title: "Lightning Fast",
                description:
                  "Generate beautiful invitations in under 10 seconds. No more waiting hours for design revisions.",
              },
              {
                icon: "🎨",
                title: "Upload Your Images",
                description: "Add your own photos, logos, and backgrounds to make each invitation uniquely yours.",
              },
              {
                icon: "📍",
                title: "Smart Location",
                description: "Integrated Google Places API makes it easy for guests to find your venue with one tap.",
              },
              {
                icon: "💬",
                title: "Easy RSVP",
                description: "Direct WhatsApp integration allows guests to RSVP instantly with a pre-filled message.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Create Your Invite in
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                3 Simple Steps
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {"It's so easy, you'll have your perfect invitation ready before you finish your coffee."}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Fill in the Details",
                description:
                  "Tell us about your event—title, date, venue, theme. Upload your images and we'll handle the rest.",
                icon: "📝",
              },
              {
                step: "02",
                title: "AI Works Its Magic",
                description:
                  "Our AI analyzes your inputs and creates a beautiful, mobile-optimized invitation in seconds.",
                icon: "✨",
              },
              {
                step: "03",
                title: "Share & Celebrate",
                description:
                  "Get a shareable link to your stunning invitation. Your guests can RSVP instantly via WhatsApp.",
                icon: "🎉",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  {step.step}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>

                {/* Connection line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 transform translate-x-8"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {"See What's"}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Possible
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {
                "From intimate gatherings to grand celebrations, our AI creates invitations that match your event's unique personality."
              }
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {examples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div
                  className={`h-48 bg-gradient-to-br ${example.color} p-6 flex items-center justify-center text-white`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full mb-3 mx-auto flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 2C5.588 2 2 5.588 2 10s3.588 8 8 8 8-3.588 8-8-3.588-8-8-8zM8 7a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm1 3a1 1 0 100 2h2a1 1 0 100-2H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold">{example.title}</h4>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">{example.type}</p>
                  <p className="text-xs text-gray-500">Mobile-optimized • AI-generated</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Create Your Perfect Invitation?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {
                "Join thousands of event hosts who've discovered the easiest way to create stunning, mobile-first invitations."
              }
            </p>
            <Link href="/create" passHref legacyBehavior>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 15px 35px rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg flex items-center justify-center mx-auto"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {"Start Creating Now - It's Free!"}
              </motion.button>
            </Link>
            <p className="text-blue-100 text-sm mt-4">No sign-up required • Ready in seconds</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-xl">invyte AI</span>
            </div>
            <div className="text-gray-400">© 2025 invyte AI. Created with ❤️  from Cape Town.</div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg z-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AIInviteHomePage
