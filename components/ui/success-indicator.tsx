"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Star, Crown } from 'lucide-react';

interface SuccessIndicatorProps {
  type?: 'profile-ready' | 'form-submitted' | 'reservation-confirmed' | 'welcome-back';
  title?: string;
  message?: string;
  userDetails?: {
    name?: string;
    reservationCount?: number;
    isVip?: boolean;
  };
}

const SuccessIndicator: React.FC<SuccessIndicatorProps> = ({
  type = 'profile-ready',
  title,
  message,
  userDetails
}) => {
  const getIcon = () => {
    switch (type) {
      case 'profile-ready':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'form-submitted':
        return <Sparkles className="w-8 h-8 text-amber-500" />;
      case 'reservation-confirmed':
        return <Star className="w-8 h-8 text-yellow-500" />;
      case 'welcome-back':
        return userDetails?.isVip ? 
          <Crown className="w-8 h-8 text-purple-500" /> : 
          <CheckCircle className="w-8 h-8 text-green-500" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'profile-ready':
        return {
          bg: 'from-green-500/10 to-emerald-500/10',
          border: 'border-green-500/20',
          text: 'text-green-400',
          glow: 'shadow-green-500/20'
        };
      case 'form-submitted':
        return {
          bg: 'from-amber-500/10 to-orange-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          glow: 'shadow-amber-500/20'
        };
      case 'reservation-confirmed':
        return {
          bg: 'from-yellow-500/10 to-amber-500/10',
          border: 'border-yellow-500/20',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-500/20'
        };
      case 'welcome-back':
        return userDetails?.isVip ? {
          bg: 'from-purple-500/10 to-indigo-500/10',
          border: 'border-purple-500/20',
          text: 'text-purple-400',
          glow: 'shadow-purple-500/20'
        } : {
          bg: 'from-blue-500/10 to-cyan-500/10',
          border: 'border-blue-500/20',
          text: 'text-blue-400',
          glow: 'shadow-blue-500/20'
        };
      default:
        return {
          bg: 'from-green-500/10 to-emerald-500/10',
          border: 'border-green-500/20',
          text: 'text-green-400',
          glow: 'shadow-green-500/20'
        };
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'profile-ready':
        return 'Profile Ready';
      case 'form-submitted':
        return 'Information Submitted';
      case 'reservation-confirmed':
        return 'Reservation Confirmed';
      case 'welcome-back':
        return userDetails?.isVip ? 'Welcome Back, VIP!' : `Welcome Back, ${userDetails?.name || 'Guest'}!`;
      default:
        return 'Success';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'profile-ready':
        return 'Your dining profile has been loaded successfully.';
      case 'form-submitted':
        return 'Your reservation details have been submitted.';
      case 'reservation-confirmed':
        return 'Your table has been reserved. We look forward to serving you!';
      case 'welcome-back':
        return userDetails?.reservationCount && userDetails.reservationCount > 0 
          ? `You have ${userDetails.reservationCount} previous dining experience${userDetails.reservationCount > 1 ? 's' : ''} with us.`
          : 'Thank you for choosing our dining experience again.';
      default:
        return 'Operation completed successfully.';
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.1
      }}
      className={`bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-xl p-4 shadow-lg ${colors.glow}`}
    >
      <div className="flex items-center gap-3">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            delay: 0.3
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
            {getIcon()}
          </motion.div>
        </motion.div>

        {/* Content */}
        <div className="flex-1">
          <motion.h4 
            className={`${colors.text} font-semibold text-sm mb-1`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {title || getDefaultTitle()}
          </motion.h4>
          <motion.p 
            className="text-gray-400 text-xs leading-relaxed"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {message || getDefaultMessage()}
          </motion.p>

          {/* VIP Badge */}
          {type === 'welcome-back' && userDetails?.isVip && (
            <motion.div
              className="mt-2 inline-flex items-center gap-1 bg-purple-500/20 border border-purple-500/30 rounded-full px-2 py-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            >
              <Crown className="w-3 h-3 text-purple-400" />
              <span className="text-purple-300 text-xs font-medium">VIP Member</span>
            </motion.div>
          )}
        </div>

        {/* Floating Particles */}
        {type === 'reservation-confirmed' && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400/60 rounded-full"
                style={{
                  top: `${20 + i * 20}%`,
                  right: `${15 + i * 10}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.6, 1, 0.6],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Success Progress Bar */}
      {(type === 'profile-ready' || type === 'form-submitted') && (
        <motion.div
          className="mt-3 h-1 bg-gray-700/50 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.div
            className={`h-full bg-gradient-to-r ${type === 'profile-ready' ? 'from-green-500 to-emerald-500' : 'from-amber-500 to-orange-500'}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 1.5,
              delay: 0.8,
              ease: "easeOut"
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default SuccessIndicator;