"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import SuccessIndicator from './success-indicator';
import EnhancedLoadingSkeleton from './enhanced-loading-skeleton';

interface FormTransitionWrapperProps {
  children: React.ReactNode;
  isSubmitting?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  error?: string;
  successMessage?: string;
  onRetry?: () => void;
  submitMessage?: string;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const FormTransitionWrapper: React.FC<FormTransitionWrapperProps> = ({
  children,
  isSubmitting = false,
  isSuccess = false,
  isError = false,
  error,
  successMessage,
  onRetry,
  submitMessage = "Processing your reservation..."
}) => {
  const [formState, setFormState] = useState<FormState>('idle');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      setFormState('submitting');
      setShowSuccess(false);
    } else if (isSuccess) {
      setFormState('success');
      // Delay success indicator to show completion animation
      setTimeout(() => setShowSuccess(true), 500);
    } else if (isError) {
      setFormState('error');
      setShowSuccess(false);
    } else {
      setFormState('idle');
      setShowSuccess(false);
    }
  }, [isSubmitting, isSuccess, isError]);

  const containerVariants = {
    idle: { 
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.3 }
    },
    submitting: { 
      opacity: 0.3,
      scale: 0.98,
      filter: "blur(1px)",
      transition: { duration: 0.3 }
    },
    success: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.3, delay: 0.2 }
    },
    error: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.3 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative">
      {/* Main Form Content */}
      <motion.div
        variants={containerVariants}
        animate={formState}
        className="relative z-10"
      >
        {children}
      </motion.div>

      {/* Overlay States */}
      <AnimatePresence mode="wait">
        {formState === 'submitting' && (
          <motion.div
            key="submitting"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl"
          >
            <div className="text-center space-y-4 p-8">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Loader2 className="w-12 h-12 text-amber-500 mx-auto" />
              </motion.div>
              
              <div>
                <motion.h3 
                  className="text-white text-lg font-semibold mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {submitMessage}
                </motion.h3>
                <motion.p 
                  className="text-gray-400 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Please don't close this window...
                </motion.p>
              </div>

              {/* Animated Progress Dots */}
              <motion.div 
                className="flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-amber-500 rounded-full"
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        {formState === 'success' && showSuccess && (
          <motion.div
            key="success"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
          >
            <div className="text-center space-y-6 p-8 max-w-sm">
              {/* Success Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  delay: 0.2 
                }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-white text-xl font-bold mb-2">
                  Reservation Submitted!
                </h3>
                <p className="text-gray-400 text-sm">
                  {successMessage || "Your dining reservation has been processed successfully."}
                </p>
              </motion.div>

              {/* Success Indicator Component */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <SuccessIndicator
                  type="reservation-confirmed"
                  title="What's Next?"
                  message="You'll receive a confirmation email shortly. We can't wait to serve you!"
                />
              </motion.div>

              {/* Celebration Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {formState === 'error' && (
          <motion.div
            key="error"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
          >
            <div className="text-center space-y-6 p-8 max-w-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  delay: 0.2 
                }}
              >
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-white text-xl font-bold mb-2">
                  Submission Failed
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {error || "There was an issue processing your reservation. Please try again."}
                </p>

                {onRetry && (
                  <motion.button
                    onClick={onRetry}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </motion.button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormTransitionWrapper;