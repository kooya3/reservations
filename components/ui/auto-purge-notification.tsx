"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';

interface AutoPurgeNotificationProps {
  isVisible: boolean;
  status: 'purging' | 'success' | 'error' | 'clean';
  message?: string;
  itemsCleared?: number;
  onClose?: () => void;
}

const AutoPurgeNotification: React.FC<AutoPurgeNotificationProps> = ({
  isVisible,
  status,
  message,
  itemsCleared = 0,
  onClose
}) => {
  const getIcon = () => {
    switch (status) {
      case 'purging':
        return <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'clean':
        return <Database className="w-5 h-5 text-blue-500" />;
      default:
        return <Database className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'purging':
        return 'Clearing previous data...';
      case 'success':
        return itemsCleared > 0 
          ? `Database cleared! ${itemsCleared} items removed for fresh start.`
          : 'Database ready for fresh registration!';
      case 'error':
        return message || 'Error clearing database. Please try again.';
      case 'clean':
        return 'Database is clean and ready for new registrations.';
      default:
        return 'Preparing database...';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'purging':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'clean':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <motion.div
            className={`${getBgColor()} backdrop-blur-md rounded-xl border px-6 py-4 shadow-xl max-w-md`}
            whileHover={{ scale: 1.02 }}
            layout
          >
            <div className="flex items-center gap-3">
              {getIcon()}
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  {getStatusText()}
                </p>
                {status === 'purging' && (
                  <p className="text-gray-400 text-xs mt-1">
                    This ensures a clean start for your reservation...
                  </p>
                )}
              </div>
              {onClose && status !== 'purging' && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close notification"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Progress bar for purging status */}
            {status === 'purging' && (
              <motion.div
                className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-amber-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AutoPurgeNotification;