# Staging Notes for Deployment

## Files Moved to Staging Directory

The following features have been temporarily moved to `/staging/` to allow for clean deployment:

### Payment & POS System
- `/app/api/payment/` - Payment API routes
- `/app/payment/` - Payment callback pages  
- `/app/pos/` - Point of Sale interface
- `/app/kitchen/` - Kitchen display system
- `/app/staff/` - Staff management interface

### Components
- `/components/pos/` - All POS-related components
- `/components/auth/` - Authentication components
- `/components/admin/` - Admin management components

### Backend Actions
- `/lib/actions/pos-*.actions.ts` - POS backend actions
- `/lib/actions/staff.actions.ts` - Staff management actions
- `/lib/actions/payment.actions.ts` - Extended payment actions (POS version)

### Types & Hooks
- `/types/pos.types.ts` - POS type definitions
- `/hooks/` - Custom hooks directory

## Temporary Changes for Build Success

### Admin Page
- Commented out `AdminDashboard` import and usage
- Added placeholder message for admin features

### Table Columns
- Commented out `ReservationActions` import
- Replaced action buttons with placeholder text

### Guest Registration
- Commented out `usePagePerformance` hook import

## To Restore After Deployment

1. Move all files from `/staging/` back to their original locations
2. Uncomment the disabled imports and components
3. Test the full POS and admin functionality

## Current Working Features for Production

- Guest reservation system
- Analytics and reporting
- Email notifications
- Basic reservation management
- Payment processing (reservation deposits only)

## Features in Development (Staged)

- Full POS system with order management
- Kitchen display system with real-time tracking
- Staff authentication and management
- Advanced admin dashboard
- Integrated dining payments
- Table management system