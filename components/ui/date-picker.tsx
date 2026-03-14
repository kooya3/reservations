"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxDate?: Date
  minDate?: Date
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  maxDate,
  minDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileTap={{ scale: 0.995 }}
          className={cn(
            "flex rounded-md border border-slate-600 bg-slate-800 relative overflow-hidden",
            isOpen && "border-amber-500",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <Button
            variant="ghost" 
            className={cn(
              "w-full justify-start text-left font-normal h-auto p-3 hover:bg-transparent",
              !date && "text-gray-400",
              disabled && "cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <motion.div
              className="mr-2"
              animate={{
                rotate: isOpen ? [0, -10, 10, -10, 0] : 0,
                scale: isOpen ? 1.1 : 1,
              }}
              transition={{
                duration: 0.5,
              }}
            >
              <CalendarIcon className="h-4 w-4 text-amber-500" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex-1 text-white"
            >
              {date ? format(date, "PPP") : placeholder}
            </motion.span>
          </Button>
          
          {/* Focus indicator */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"
            initial={{ width: "0%" }}
            animate={{ width: isOpen ? "100%" : "0%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0 bg-slate-900 border-slate-600" 
        align="start"
      >
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  onDateChange?.(selectedDate)
                  setIsOpen(false)
                }}
                disabled={(date) => {
                  if (minDate && date < minDate) return true
                  if (maxDate && date > maxDate) return true
                  return false
                }}
                initialFocus
                className="bg-slate-900"
                classNames={{
                  day_selected: "bg-amber-500 text-white hover:bg-amber-600 focus:bg-amber-600",
                  day_today: "bg-amber-500/20 text-amber-500 font-semibold",
                  day: "text-white hover:bg-slate-700 focus:bg-slate-700",
                  head_cell: "text-gray-400",
                  caption: "text-white",
                  nav_button: "text-white hover:bg-slate-700",
                  nav_button_previous: "text-white hover:bg-slate-700",
                  nav_button_next: "text-white hover:bg-slate-700",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}