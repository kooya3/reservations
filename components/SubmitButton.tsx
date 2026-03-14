"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

interface ButtonProps {
  isLoading: boolean;
  className?: string;
  children: React.ReactNode;
  loadingText?: string;
  successText?: string;
  showSuccess?: boolean;
}

const SubmitButton = ({ 
  isLoading, 
  className, 
  children, 
  loadingText = "Processing...",
  successText = "Success!",
  showSuccess = false
}: ButtonProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (showSuccess && !isLoading) {
      setIsSuccess(true);
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, isLoading]);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        type="submit"
        disabled={isLoading || isSuccess}
        className={`${className ?? "shad-primary-btn w-full"} relative overflow-hidden transition-all duration-300 ${
          isLoading ? "cursor-wait" : ""
        } ${isSuccess ? "bg-green-600 hover:bg-green-600" : ""}`}
        onClick={handleClick}
      >
        {/* Ripple Effect */}
        <AnimatePresence>
          {isClicked && (
            <motion.span
              className="absolute inset-0 bg-white/20"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ borderRadius: "50%" }}
            />
          )}
        </AnimatePresence>

        {/* Button Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Loader2 className="w-5 h-5" />
              </motion.div>
              <span className="font-medium">{loadingText}</span>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex gap-1"
              >
                <span className="w-1 h-1 bg-current rounded-full" />
                <span className="w-1 h-1 bg-current rounded-full" />
                <span className="w-1 h-1 bg-current rounded-full" />
              </motion.div>
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 20
              }}
              className="flex items-center justify-center gap-2"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                  delay: 0.1
                }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
              <span className="font-medium">{successText}</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                  delay: 0.2
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shimmer Effect on Hover */}
        <motion.div
          className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{ transform: "translateX(-100%)" }}
          whileHover={{ transform: "translateX(100%)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Loading Progress Bar */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
};

export default SubmitButton;