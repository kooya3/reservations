import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'zsP1UMPiRDwHjuv1x');

interface ReservationNotification {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string;
  time: string;
  partySize: number;
  tablePreference?: string;
  specialRequests?: string;
  occasion?: string;
}

export const NotificationService = {
  /**
   * Send reservation confirmation to guest
   */
  async sendGuestConfirmation(data: ReservationNotification): Promise<boolean> {
    try {
      const templateParams = {
        to_email: data.guestEmail,
        to_name: data.guestName,
        from_name: data.guestName,
        from_email: data.guestEmail,
        phone: data.guestPhone,
        date: data.date,
        time: data.time,
        guests: data.partySize.toString(),
        table_preference: data.tablePreference || 'Any available',
        special_requests: data.specialRequests || 'None',
        occasion: data.occasion || 'Dining'
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_9q14lw5',
        process.env.NEXT_PUBLIC_EMAILJS_CONFIRMATION_TEMPLATE_ID || 'template_oxo9v3d',
        templateParams
      );

      console.log('Guest confirmation sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send guest confirmation:', error);
      return false;
    }
  },

  /**
   * Send reservation notification to restaurant
   */
  async sendRestaurantNotification(data: ReservationNotification): Promise<boolean> {
    try {
      const templateParams = {
        to_name: 'AM | PM Lounge',
        from_name: data.guestName,
        from_email: data.guestEmail,
        phone: data.guestPhone,
        date: data.date,
        time: data.time,
        guests: data.partySize.toString(),
        table_preference: data.tablePreference || 'Any available',
        special_requests: data.specialRequests || 'None',
        occasion: data.occasion || 'Regular dining',
        reply_to: data.guestEmail
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_9q14lw5',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_reservation',
        templateParams
      );

      console.log('Restaurant notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send restaurant notification:', error);
      return false;
    }
  },

  /**
   * Send both notifications
   */
  async sendReservationNotifications(data: ReservationNotification): Promise<{
    guestSent: boolean;
    restaurantSent: boolean;
  }> {
    const [guestSent, restaurantSent] = await Promise.all([
      this.sendGuestConfirmation(data),
      this.sendRestaurantNotification(data)
    ]);

    // Also send browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      // eslint-disable-next-line no-new
      new Notification('Reservation Confirmed! 🎉', {
        body: `Your table for ${data.partySize} on ${data.date} at ${data.time} has been confirmed at AM | PM Lounge!`,
        icon: '/assets/icons/logo-full.svg',
        badge: '/assets/icons/logo-full.svg',
        vibrate: [200, 100, 200],
        tag: 'reservation-confirmation',
        requireInteraction: false,
        data: {
          reservationId: Date.now(),
          dateTime: `${data.date} ${data.time}`
        }
      });
    }

    return { guestSent, restaurantSent };
  },

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  },

  /**
   * Send SMS notification via Africa's Talking (optional)
   */
  async sendSMSNotification(phone: string, message: string): Promise<boolean> {
    // This would integrate with Africa's Talking API if configured
    // For now, we'll just log it
    console.log(`SMS would be sent to ${phone}: ${message}`);
    return true;
  },

  /**
   * Send WhatsApp notification (optional - requires Twilio or similar)
   */
  async sendWhatsAppNotification(phone: string, message: string): Promise<boolean> {
    // This would integrate with WhatsApp Business API
    // For now, we'll just log it
    console.log(`WhatsApp message would be sent to ${phone}: ${message}`);
    return true;
  }
};