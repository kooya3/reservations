"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  X, 
  Clock, 
  User, 
  Calendar,
  Users,
  ChefHat
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface SpecialRequestsPopupProps {
  requests: string;
  guestName: string;
  date: string;
  time: string;
  partySize: string;
  occasion: string;
  welcomeDrink: string;
}

export const SpecialRequestsPopup: React.FC<SpecialRequestsPopupProps> = ({
  requests,
  guestName,
  date,
  time,
  partySize,
  occasion,
  welcomeDrink
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasRequests = requests && requests.trim() !== "" && requests.trim().toLowerCase() !== "none";
  
  // Create a preview of the requests (first 20 characters)
  const preview = hasRequests ? 
    (requests.length > 20 ? requests.substring(0, 20) + "..." : requests) : 
    "None";

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
          ${hasRequests 
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30' 
            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'
          }
        `}
        title={hasRequests ? "Click to view special requests" : "No special requests"}
      >
        <MessageSquare className="size-3" />
        <span className="truncate max-w-24">{preview}</span>
        {hasRequests && (
          <div className="size-2 bg-amber-400 rounded-full animate-pulse" />
        )}
      </button>

      {/* Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md bg-slate-900 border border-amber-500/20">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  Special Requests & Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Guest Summary */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-blue-400" />
                    <h3 className="font-medium text-white">{guestName}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-300">{date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-300">{time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-300">{partySize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-300">{welcomeDrink}</span>
                    </div>
                  </div>

                  {occasion && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Occasion:</span>
                        <span className="text-amber-400 font-medium text-sm">{occasion}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Requests */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Special Requests
                  </h4>
                  
                  {hasRequests ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {requests}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-500/10 border border-slate-500/20 rounded-lg p-3">
                      <p className="text-slate-400 text-sm italic">
                        No special requests for this reservation
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Notes */}
                {hasRequests && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-blue-400 font-medium text-xs mb-1">Kitchen Note:</p>
                        <p className="text-slate-300 text-xs">
                          Please ensure special requests are communicated to the kitchen staff and service team before guest arrival.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4">
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </motion.button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};