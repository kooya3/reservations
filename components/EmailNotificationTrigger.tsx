"use client";

import { useEffect } from "react";
import { sendConfirmationEmail, sendAdminNotificationEmail, requestNotificationPermission } from "@/lib/client-email.service";

interface EmailNotificationTriggerProps {
  appointmentData?: any;
  guestData?: any;
  trigger: 'reservation-created' | 'reservation-confirmed' | 'reservation-cancelled';
  onEmailSent?: (success: boolean) => void;
}

export function EmailNotificationTrigger({ 
  appointmentData, 
  guestData, 
  trigger, 
  onEmailSent 
}: EmailNotificationTriggerProps) {
  
  useEffect(() => {
    const sendNotifications = async () => {
      if (!appointmentData || !guestData) return;

      try {
        // Request notification permission for browser notifications
        await requestNotificationPermission();

        // Prepare email data based on trigger type
        let emailData;
        let adminEmailData;

        switch (trigger) {
          case 'reservation-created':
            emailData = {
              to_email: guestData.email,
              to_name: guestData.name,
              from_name: 'AM | PM Lounge',
              reservation_date: `${appointmentData.schedule.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}, ${appointmentData.schedule.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}`,
              party_size: appointmentData.partySize || '2 Guests',
              welcome_drink: appointmentData.primaryPhysician || 'House Special',
              special_requests: appointmentData.note || 'None',
              occasion: appointmentData.reason || 'Regular Dining',
              status: 'PENDING ⏳',
              message: "Thank you for your reservation request! We'll confirm your booking shortly and send you all the details."
            };

            adminEmailData = {
              to_email: 'reservations@ampmlounge.com',
              to_name: 'AM | PM Lounge Team',
              from_name: guestData.name,
              from_email: guestData.email,
              phone: guestData.phone,
              reservation_date: emailData.reservation_date,
              party_size: emailData.party_size,
              welcome_drink: emailData.welcome_drink,
              special_requests: emailData.special_requests,
              occasion: emailData.occasion,
              guest_notes: `New reservation request from ${guestData.name}`,
              message: "New reservation request received. Please review and confirm."
            };
            break;

          case 'reservation-confirmed':
            emailData = {
              to_email: guestData.email,
              to_name: guestData.name,
              from_name: 'AM | PM Lounge',
              reservation_date: `${appointmentData.schedule.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}, ${appointmentData.schedule.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}`,
              party_size: appointmentData.partySize || '2 Guests',
              welcome_drink: appointmentData.primaryPhysician || 'House Special',
              special_requests: appointmentData.note || 'None',
              occasion: appointmentData.reason || 'Regular Dining',
              status: 'CONFIRMED ✅',
              message: "Great news! Your reservation has been confirmed. We look forward to serving you an exceptional dining experience!"
            };
            break;

          case 'reservation-cancelled':
            emailData = {
              to_email: guestData.email,
              to_name: guestData.name,
              from_name: 'AM | PM Lounge',
              reservation_date: `${appointmentData.schedule.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}, ${appointmentData.schedule.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}`,
              party_size: appointmentData.partySize || '2 Guests',
              welcome_drink: appointmentData.primaryPhysician || 'House Special',
              special_requests: appointmentData.note || 'None',
              occasion: appointmentData.reason || 'Regular Dining',
              status: 'CANCELLED ❌',
              message: `We're sorry, but your reservation has been cancelled. ${appointmentData.cancellationReason || 'Please contact us to reschedule.'}`
            };
            break;
        }

        if (emailData) {
          console.log('📧 Triggering email notifications for:', trigger);
          
          // Send customer confirmation email
          const customerEmailSent = await sendConfirmationEmail(emailData);
          
          // Send admin notification (only for new reservations)
          let adminEmailSent = true;
          if (trigger === 'reservation-created' && adminEmailData) {
            adminEmailSent = await sendAdminNotificationEmail(adminEmailData);
          }

          // Call the callback with success status
          onEmailSent?.(customerEmailSent && adminEmailSent);

          // Show browser notification if successful
          if (customerEmailSent && 'Notification' in window && Notification.permission === 'granted') {
            const notificationTitle = trigger === 'reservation-created' 
              ? 'Reservation Request Sent! 🎉' 
              : trigger === 'reservation-confirmed'
              ? 'Reservation Confirmed! ✅'
              : 'Reservation Cancelled ❌';
              
            const notificationBody = trigger === 'reservation-created'
              ? `We've received your request for ${appointmentData.partySize} on ${appointmentData.schedule.toLocaleDateString()}. Confirmation coming soon!`
              : trigger === 'reservation-confirmed'
              ? `Your table for ${appointmentData.partySize} on ${appointmentData.schedule.toLocaleDateString()} is confirmed!`
              : `Your reservation has been cancelled. We hope to see you again soon!`;

            new Notification(notificationTitle, {
              body: notificationBody,
              icon: '/assets/icons/logo-full.svg',
              badge: '/assets/icons/logo-full.svg',
              vibrate: [200, 100, 200],
              tag: 'reservation-notification',
              requireInteraction: false,
              data: {
                reservationId: appointmentData.$id,
                trigger: trigger,
                timestamp: Date.now()
              }
            });
          }
        }
      } catch (error) {
        console.error('❌ Failed to send email notifications:', error);
        onEmailSent?.(false);
      }
    };

    sendNotifications();
  }, [appointmentData, guestData, trigger, onEmailSent]);

  // This component doesn't render anything visible
  return null;
}

export default EmailNotificationTrigger;