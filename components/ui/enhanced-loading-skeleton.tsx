"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface EnhancedLoadingSkeletonProps {
  variant?: 'register' | 'form' | 'profile' | 'minimal';
  showProgress?: boolean;
  customMessage?: string;
}

const EnhancedLoadingSkeleton: React.FC<EnhancedLoadingSkeletonProps> = ({
  variant = 'register',
  showProgress = false,
  customMessage
}) => {
  const shimmerVariants = {
    animate: {
      x: ['-100%', '100%'],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut'
      }
    }
  };

  const pulseVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut'
      }
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-white text-sm">{customMessage || 'Loading...'}</span>
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="space-y-6 p-6">
        {/* Form fields skeleton */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            {/* Label skeleton */}
            <motion.div 
              className="h-4 bg-gray-700/50 rounded w-24"
              variants={pulseVariants}
              animate="animate"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
            {/* Input skeleton */}
            <div className="relative h-12 bg-gray-700/30 rounded-lg border border-gray-600/30 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                variants={shimmerVariants}
                animate="animate"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            </div>
          </div>
        ))}
        
        {/* Button skeleton */}
        <div className="pt-4">
          <div className="relative h-12 bg-amber-500/20 rounded-lg overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"
              variants={shimmerVariants}
              animate="animate"
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="space-y-6 p-6">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <motion.div 
            className="w-16 h-16 bg-gray-700/50 rounded-full"
            variants={pulseVariants}
            animate="animate"
          />
          <div className="space-y-2 flex-1">
            <motion.div 
              className="h-6 bg-gray-700/50 rounded w-3/4"
              variants={pulseVariants}
              animate="animate"
              style={{ animationDelay: '0.1s' }}
            />
            <motion.div 
              className="h-4 bg-gray-700/30 rounded w-1/2"
              variants={pulseVariants}
              animate="animate"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
        
        {/* Profile details */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <motion.div 
              className="h-4 bg-gray-700/40 rounded w-1/3"
              variants={pulseVariants}
              animate="animate"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            />
            <motion.div 
              className="h-4 bg-gray-700/40 rounded w-1/2"
              variants={pulseVariants}
              animate="animate"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Default 'register' variant
  return (
    <div className="space-y-6 p-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <motion.div 
            className="h-8 bg-gray-700/50 rounded w-48"
            variants={pulseVariants}
            animate="animate"
          />
          <motion.div 
            className="h-4 bg-gray-700/30 rounded w-64"
            variants={pulseVariants}
            animate="animate"
            style={{ animationDelay: '0.1s' }}
          />
        </div>
        <motion.div 
          className="w-32 h-8 bg-green-500/20 rounded-full"
          variants={pulseVariants}
          animate="animate"
          style={{ animationDelay: '0.2s' }}
        />
      </div>

      {/* Status indicator skeleton */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-5 h-5 bg-green-500/40 rounded-full"
            variants={pulseVariants}
            animate="animate"
          />
          <motion.div 
            className="h-4 bg-green-500/30 rounded w-3/4"
            variants={pulseVariants}
            animate="animate"
            style={{ animationDelay: '0.1s' }}
          />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <motion.div 
              className="h-4 bg-gray-700/50 rounded w-24"
              variants={pulseVariants}
              animate="animate"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
            <div className="relative h-12 bg-gray-700/30 rounded-lg border border-gray-600/30 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                variants={shimmerVariants}
                animate="animate"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Loading profile...</span>
            <span className="text-amber-400">75%</span>
          </div>
          <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
              initial={{ width: '0%' }}
              animate={{ width: '75%' }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Button skeleton */}
      <div className="pt-6">
        <div className="relative h-12 bg-amber-500/20 rounded-lg overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"
            variants={shimmerVariants}
            animate="animate"
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoadingSkeleton;