"use client";

import { Suspense } from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function PaymentFailedContent() {
  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-400 rounded-2xl border border-dark-500 p-8 text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Payment Failed
        </h1>
        
        <p className="text-slate-400 mb-8">
          Your payment could not be processed. Your reservation is still pending and you can try again or contact us for assistance.
        </p>

        {/* Common Issues */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
          <h3 className="text-blue-400 font-medium mb-2">
            Common Issues:
          </h3>
          <ul className="text-sm text-slate-300 space-y-2 text-left">
            <li>• Insufficient funds in your account</li>
            <li>• Card declined by your bank</li>
            <li>• Internet connection issues</li>
            <li>• Incorrect card details</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => window.history.back()}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Payment Again
          </Button>
          
          <Link href="/guests/new-reservation">
            <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reservation
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
            Still having trouble? We're here to help!
          </p>
          <a 
            href="mailto:support@restaurant.com" 
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            support@restaurant.com
          </a>
          <p className="text-xs text-slate-500 mt-2">
            Or call: +234 (0) 123 456 7890
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}