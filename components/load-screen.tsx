import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AILoadingScreen = ({ 
  eventTitle = "Your Event", 
  userImage = null,
  isVisible = true,
  progress = 0,
  onComplete = () => {} 
}) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [internalProgress, setInternalProgress] = useState(0);
  const [dots, setDots] = useState("");

  // Loading messages that cycle through
  const loadingMessages = [
    "Analyzing your event details",
    "Generating design elements", 
    "Creating responsive layouts",
    "Optimizing for mobile devices",
    "Adding interactive animations",
    "Finalizing your invitation"
  ];

  // Cycle through loading messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  // Use external progress or internal animation
  useEffect(() => {
    if (progress > 0) {
      // Use external progress
      setInternalProgress(progress);
      if (progress >= 100) {
        setTimeout(() => onComplete(), 1000);
      }
    } else {
      // Animate progress bar internally
      const progressInterval = setInterval(() => {
        setInternalProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => onComplete(), 1000);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
      
      return () => clearInterval(progressInterval);
    }
  }, [progress, onComplete]);

  // Animate dots for loading text
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 z-50 flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: 0 
              }}
              animate={{ 
                y: -100,
                opacity: [0, 0.5, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
            />
          ))}
        </div>

        <div className="z-10 flex flex-col items-center text-center px-4 max-w-md mx-auto">
          {/* Main loader animation */}
          <motion.div
            className="relative mb-8"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          >
            {/* Outer spinning ring */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 relative">
              <motion.div
                className="absolute inset-0 border-3 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Inner spinning ring */}
              <motion.div
                className="absolute inset-3 border-2 border-purple-400 border-b-transparent rounded-full"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Core element */}
              <div className="absolute inset-0 flex items-center justify-center">
                {userImage ? (
                  <img
                    src={userImage}
                    alt="User"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                  >
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Title and branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Creating Your Invitation
            </h1>
            <p className="text-blue-300 text-lg">
              for {eventTitle}
            </p>
          </motion.div>

          {/* AI Status Messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-6 h-12 flex items-center justify-center"
          >
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-gray-300 text-sm sm:text-base tracking-wide"
            >
              {loadingMessages[currentMessage]}{dots}
            </motion.p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="w-full max-w-xs mb-4"
          >
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>AI Generation</span>
              <span>{Math.round(internalProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(internalProgress, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex items-center bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-600"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 mr-2"
            >
              <svg
                className="w-full h-full text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
              </svg>
            </motion.div>
            <span className="text-sm text-gray-300 font-medium">
              Powered by AI
            </span>
          </motion.div>

          {/* Subtle help text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="text-xs text-gray-500 mt-6 leading-relaxed"
          >
            Please wait while we craft your perfect invitation.
            <br />
            This usually takes 10-15 seconds.
          </motion.p>
        </div>

        {/* Corner decorations */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-10 right-10 w-16 h-16 border border-blue-500 border-opacity-30 rounded-full"
        />
        
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-10 left-10 w-12 h-12 border border-purple-400 border-opacity-30 rounded-full"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export { AILoadingScreen };
export default AILoadingScreen;