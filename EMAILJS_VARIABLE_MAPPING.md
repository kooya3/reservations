# EmailJS Variable Mapping Guide

## Required Template Variables for EmailJS

Based on your EmailJS templates, you need to use these EXACT variable names in your templates:

### For Reservation Template (New & Confirmation)

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `{{to_email}}` | Recipient email | elyeestatua@gmail.com |
| `{{to_name}}` | Guest name | Elyees Waweru Tatua |
| `{{date}}` | Reservation date | Sep 18, 2025 |
| `{{time}}` | Reservation time | 12:53 AM |
| `{{party_size}}` | Number of guests | 4 Guests |
| `{{location}}` | Restaurant location | Northern Bypass, Thome |
| `{{message}}` | Custom message | Your reservation has been confirmed |
| `{{from_name}}` | Restaurant name | AM \| PM Lounge |

### Variables Currently Being Sent (Need Update)

We're currently sending these variables that need to be mapped:
- `reservation_date` → Should be split into `{{date}}` and `{{time}}`
- `welcome_drink` → Not in your template
- `occasion` → Not in your template
- `special_requests` → Should be `{{message}}`

## How to Fix Your EmailJS Template

### Option 1: Update Your EmailJS Template
Add these variables to your EmailJS template:
```
Date: {{date}}
Time: {{time}}
Party Size: {{party_size}}
Location: {{location}}
Special Requests: {{special_requests}}
Welcome Drink: {{welcome_drink}}
Occasion: {{occasion}}
```

### Option 2: Update the Code
We'll update the code to match your current template variables.