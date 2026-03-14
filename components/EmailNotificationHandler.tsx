"use client";

import { useEffect } from "react";
import emailjs from "@emailjs/browser";

interface EmailNotificationHandlerProps {
  shouldSend: boolean;
  emailData: {
    to_email: string;
    to_name: string;
    from_name: string;
    reservation_date: string;
    party_size: string;
    welcome_drink: string;
    special_requests: string;
    occasion: string;
    status: string;
    message: string;
  } | null;
  onSent?: () => void;
  onError?: (error: any) => void;
}

export const EmailNotificationHandler = ({
  shouldSend,
  emailData,
  onSent,
  onError,
}: EmailNotificationHandlerProps) => {
  useEffect(() => {
    if (shouldSend && emailData) {
      sendEmail();
    }
  }, [shouldSend, emailData]);

  const sendEmail = async () => {
    try {
      // Initialize EmailJS
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "zsP1UMPiRDwHjuv1x");
      
      console.log("Sending confirmation email to:", emailData?.to_email);
      console.log("Email data:", emailData);

      // Send the confirmation email
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_9q14lw5",
        process.env.NEXT_PUBLIC_EMAILJS_CONFIRMATION_TEMPLATE_ID || "template_oxo9v3d",
        emailData!
      );

      console.log("EmailJS Response:", result);
      
      if (result.status === 200) {
        console.log("✅ Email sent successfully to", emailData?.to_email);
        onSent?.();
        
        // Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Email Sent! 📧", {
            body: `Confirmation email sent to ${emailData?.to_email}`,
            icon: "/assets/icons/logo-full.svg",
          });
        }
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      onError?.(error);
    }
  };

  return null; // This is a utility component, no UI
};

export default EmailNotificationHandler;