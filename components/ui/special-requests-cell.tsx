"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, FileText, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SpecialRequestsCellProps {
  note: string | undefined;
  guestName: string;
  maxLength?: number;
}

export const SpecialRequestsCell: React.FC<SpecialRequestsCellProps> = ({
  note,
  guestName,
  maxLength = 50
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Extract special requests from note field (removing party size info)
  const extractSpecialRequests = (noteText: string | undefined): string => {
    if (!noteText) return "";
    const cleaned = noteText.replace(/Party Size: [^|]*\|?\s*/, '').trim();
    return cleaned || "";
  };

  const specialRequests = extractSpecialRequests(note);
  const hasRequests = specialRequests && specialRequests.length > 0;

  if (!hasRequests) {
    return (
      <div className="flex items-center justify-center w-full">
        <span className="text-[10px] text-slate-500 italic">None</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg"
            title={`Special requests: ${specialRequests.length > 30 ? specialRequests.substring(0, 30) + "..." : specialRequests}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {specialRequests.length > 100 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </Button>
        </DialogTrigger>
        
        {/* Quick Preview Tooltip */}
        <AnimatePresence>
          {isHovered && specialRequests.length <= 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-[100] top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-w-[280px] pointer-events-none"
            >
              <div className="text-[10px] text-slate-400 mb-1">Special Requests:</div>
              <div className="text-xs text-white leading-relaxed">{specialRequests}</div>
              <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-800 border-l border-t border-slate-600 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
          
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-slate-900 border border-amber-500/20">
          <DialogHeader className="border-b border-slate-700 pb-4">
            <DialogTitle className="text-amber-500 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Special Requests Details
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Request details from {guestName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-4 space-y-4">
            {/* Special requests content */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    specialRequests.length > 200 ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                  <span className="text-amber-400 font-medium text-sm">Request Details:</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(specialRequests)}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-amber-400"
                  title="Copy to clipboard"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-white leading-relaxed whitespace-pre-wrap text-sm">
                {specialRequests}
              </p>
            </div>

            {/* Kitchen note */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 font-medium text-xs mb-1">Kitchen Notice:</p>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Ensure all special requests are communicated to kitchen and service staff prior to guest arrival.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};