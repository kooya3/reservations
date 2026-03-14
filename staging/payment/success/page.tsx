"use client";

import { Suspense } from 'react';
import { CheckCircle, Calendar, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function PaymentSuccessContent() {
  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-400 rounded-2xl border border-dark-500 p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Payment Successful!
        </h1>
        
        <p className="text-slate-400 mb-8">
          Your table reservation has been confirmed. You'll receive a confirmation email with all the details shortly.
        </p>

        {/* Next Steps */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8">
          <h3 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            What's Next?
          </h3>
          <ul className="text-sm text-slate-300 space-y-2 text-left">
            <li>• Check your email for reservation confirmation</li>
            <li>• Arrive 15 minutes before your reservation time</li>
            <li>• Present your confirmation code at the restaurant</li>
            <li>• Enjoy your dining experience!</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/guests/new-reservation">
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Make Another Reservation
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2">
            Need help? Contact us at
          </p>
          <a 
            href="mailto:reservations@restaurant.com" 
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            reservations@restaurant.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}