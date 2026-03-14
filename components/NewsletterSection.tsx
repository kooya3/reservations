"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import emailjs from "@emailjs/browser";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setStatus("idle");

    try {
      // Initialize EmailJS
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "zsP1UMPiRDwHjuv1x");

      // Send newsletter subscription email
      const templateParams = {
        to_email: email,
        from_name: "AM | PM Lounge",
        user_email: email,
        message: `Welcome to AM | PM Lounge Newsletter! 

You've successfully subscribed to our exclusive dining updates. Look forward to:

🍴 Special menu announcements
🎉 Exclusive event invitations  
🎁 Member-only promotions
🍷 Wine tasting notifications
⭐ VIP reservation privileges

We're thrilled to have you as part of our culinary community!

Best regards,
AM | PM Lounge Team`,
        restaurant_name: "AM | PM Lounge",
        subscription_date: new Date().toLocaleDateString(),
      };

      const response = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_9q14lw5",
        process.env.NEXT_PUBLIC_EMAILJS_NEWSLETTER_TEMPLATE_ID || "template_49mb8bg",
        templateParams
      );

      if (response.status === 200) {
        setStatus("success");
        setMessage("🎉 Welcome aboard! Check your inbox for a special welcome gift.");
        setEmail("");
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 5000);
      }
    } catch (error) {
      console.error("Newsletter subscription failed:", error);
      setStatus("error");
      setMessage("Oops! Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent rounded-3xl border border-amber-500/20 p-8 shadow-2xl overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full mb-4 shadow-lg shadow-amber-500/30">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Stay Updated with AM | PM Lounge
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Join our exclusive newsletter for special offers, new menu announcements, and VIP event invitations
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={isLoading}
                className={`
                  w-full px-6 py-4 pr-32 
                  bg-white/5 backdrop-blur-sm
                  border ${status === "error" ? "border-red-500/50" : "border-white/10"}
                  rounded-2xl
                  text-white placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  absolute right-2 top-1/2 -translate-y-1/2
                  px-6 py-2.5
                  bg-gradient-to-r from-amber-500 to-amber-600
                  text-white font-semibold
                  rounded-xl
                  flex items-center gap-2
                  hover:from-amber-600 hover:to-amber-700
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isLoading ? "animate-pulse" : ""}
                `}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Subscribing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Subscribe</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {status !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  flex items-center gap-3 p-4 rounded-xl
                  ${status === "success" 
                    ? "bg-green-500/10 border border-green-500/20 text-green-400" 
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }
                `}
              >
                {status === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="text-sm">{message}</p>
              </motion.div>
            )}
          </form>

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "🍽️", label: "Exclusive Menus" },
              { icon: "🎉", label: "VIP Events" },
              { icon: "🎁", label: "Special Offers" },
              { icon: "🍷", label: "Wine Club" },
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="text-center"
              >
                <div className="text-2xl mb-1">{feature.icon}</div>
                <p className="text-xs text-gray-400">{feature.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center mt-6">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </motion.div>
  );
};