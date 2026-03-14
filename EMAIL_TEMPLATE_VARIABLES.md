# Email Template Variables Reference

This document lists all available variables for the EmailJS email templates used in the AM | PM Lounge reservation system.

## Basic Variables (Required)

### Recipient Information
- `{{to_name}}` - Guest's full name
- `{{to_email}}` - Guest's email address
- `{{from_name}}` - Restaurant name (AM | PM Lounge)

### Reservation Details
- `{{reservation_date}}` - Full formatted date (e.g., "Friday, November 29, 2025")
- `{{time}}` - Formatted time (e.g., "1:00 PM")
- `{{party_size}}` - Number of guests (e.g., "2 Guests")
- `{{location}}` - Restaurant location ("Northern Bypass, Thome - Kiambu Road")
- `{{welcome_drink}}` - Selected welcome drink (e.g., "🍍 Tropical Storm")
- `{{special_requests}}` - Guest's special requests or "None"
- `{{occasion}}` - Dining occasion (e.g., "Anniversary 💑")

### Status & Messaging
- `{{status}}` - Reservation status ("CONFIRMED ✅" or "CANCELLED ❌")
- `{{message}}` - Personalized confirmation/cancellation message

## Enhanced Variables (Professional Features)

### Restaurant Branding
- `{{restaurant_name}}` - AM | PM Lounge
- `{{restaurant_tagline}}` - Premium Restaurant & Bar Experience
- `{{booking_id}}` - Unique booking reference (e.g., "BE04001A")

### Contact Information
- `{{phone}}` - Restaurant phone number (+254 700-116-100)
- `{{email_contact}}` - Reservations email (reservations@ampmlounge.com)
- `{{website}}` - Restaurant website (www.ampmlounge.com)

### Guest Information
- `{{dress_code}}` - Smart Casual
- `{{parking}}` - Complimentary Valet Parking Available
- `{{cancellation_policy}}` - Free cancellation up to 2 hours before reservation time

### Social Media
- `{{social_facebook}}` - facebook.com/ampmlounge
- `{{social_instagram}}` - @ampmlounge
- `{{social_twitter}}` - @ampmlounge

### Additional Variables
- `{{current_year}}` - Current year (e.g., 2025)

## Sample Email Template Structure

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{restaurant_name}} - Reservation {{status}}</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: #1a1a1a; color: #f59e0b; padding: 20px; text-align: center;">
            <h1>{{restaurant_name}}</h1>
            <p style="margin: 0; opacity: 0.9;">{{restaurant_tagline}}</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1a1a1a;">Dear {{to_name}},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">{{message}}</p>

            <!-- Reservation Details -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1a1a1a; margin-top: 0;">📋 Reservation Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
                        <td style="padding: 8px 0;">{{booking_id}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                        <td style="padding: 8px 0;">{{reservation_date}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Time:</td>
                        <td style="padding: 8px 0;">{{time}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Party Size:</td>
                        <td style="padding: 8px 0;">{{party_size}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Welcome Drink:</td>
                        <td style="padding: 8px 0;">{{welcome_drink}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Occasion:</td>
                        <td style="padding: 8px 0;">{{occasion}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Special Requests:</td>
                        <td style="padding: 8px 0;">{{special_requests}}</td>
                    </tr>
                </table>
            </div>

            <!-- Restaurant Information -->
            <div style="margin: 20px 0;">
                <h3 style="color: #1a1a1a;">📍 Location & Contact</h3>
                <p style="margin: 5px 0;">{{location}}</p>
                <p style="margin: 5px 0;">📞 {{phone}}</p>
                <p style="margin: 5px 0;">✉️ {{email_contact}}</p>
                <p style="margin: 5px 0;">👔 Dress Code: {{dress_code}}</p>
                <p style="margin: 5px 0;">🅿️ {{parking}}</p>
                <p style="margin: 5px 0; font-style: italic;">{{cancellation_policy}}</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #1a1a1a; color: #9ca3af; padding: 20px; text-align: center;">
            <p style="margin: 10px 0;">Follow us: 
                <a href="{{social_facebook}}" style="color: #f59e0b;">Facebook</a> | 
                <a href="{{social_instagram}}" style="color: #f59e0b;">Instagram</a> | 
                <a href="{{social_twitter}}" style="color: #f59e0b;">Twitter</a>
            </p>
            <p style="margin: 10px 0;">Visit us at <a href="{{website}}" style="color: #f59e0b;">{{website}}</a></p>
            <p style="margin: 10px 0; font-size: 12px;">© {{current_year}} {{restaurant_name}}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

## Implementation Notes

1. **EmailJS Configuration**: Update your EmailJS templates to use these variables
2. **Variable Fallbacks**: The system provides default values for all optional variables
3. **Data Extraction**: Special requests are automatically cleaned of party size information
4. **Booking ID Generation**: Unique IDs are generated from the appointment database ID
5. **Time Formatting**: All times are formatted in 12-hour format with AM/PM
6. **Date Formatting**: Dates include full day names and are human-readable

## Next Steps

1. Update your EmailJS template with the provided HTML structure
2. Test with different reservation scenarios
3. Customize styling to match brand guidelines
4. Add any additional restaurant-specific information as needed