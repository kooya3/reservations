"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  Calculator,
  Clock,
  Users,
  Calendar,
  Sparkles
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { calculatePaymentEstimate, initializePayment } from "@/lib/actions/payment.actions";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationData: {
    id: string;
    guestName: string;
    guestEmail: string;
    partySize: number;
    occasion: string;
    reservationDateTime: string;
  };
  onPaymentSuccess: (paymentData: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  reservationData,
  onPaymentSuccess
}) => {
  const [step, setStep] = useState<'calculate' | 'processing' | 'success' | 'error'>('calculate');
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate payment estimate when modal opens
  useEffect(() => {
    if (isOpen && reservationData) {
      calculateEstimate();
    }
  }, [isOpen, reservationData]);

  const calculateEstimate = async () => {
    setLoading(true);
    try {
      const result = await calculatePaymentEstimate({
        partySize: reservationData.partySize,
        occasion: reservationData.occasion,
        reservationDateTime: reservationData.reservationDateTime
      });

      if (result.success) {
        setEstimate(result.data);
      } else {
        setError(result.error || "Failed to calculate payment estimate");
      }
    } catch (err) {
      setError("Unable to calculate payment estimate");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!estimate) return;
    
    setStep('processing');
    setLoading(true);

    try {
      const result = await initializePayment({
        email: reservationData.guestEmail,
        amount: estimate.depositAmount,
        reservationId: reservationData.id,
        customerName: reservationData.guestName,
        partySize: reservationData.partySize,
        reservationDate: reservationData.reservationDateTime,
        occasion: reservationData.occasion
      });

      if (result.success) {
        // Redirect to Paystack payment page
        window.open(result.data.authorization_url, '_blank');
        
        // For demo purposes, show success after 3 seconds
        // In production, this would be handled by webhook verification
        setTimeout(() => {
          setStep('success');
          onPaymentSuccess({
            reference: result.data.reference,
            amount: estimate.depositAmount,
            status: 'success'
          });
        }, 3000);
      } else {
        setError(result.error || "Failed to initialize payment");
        setStep('error');
      }
    } catch (err) {
      setError("Unable to process payment");
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border border-amber-500/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Secure Table Reservation
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'calculate' && (
            <motion.div
              key="calculate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 py-4"
            >
              {/* Reservation Summary */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Reservation Details
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Guest:</span>
                    <span className="text-white font-medium">{reservationData.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-white">{formatDateTime(reservationData.reservationDateTime).date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="text-white">{formatDateTime(reservationData.reservationDateTime).time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Party Size:</span>
                    <span className="text-white flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {reservationData.partySize} guests
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Occasion:</span>
                    <span className="text-amber-400">{reservationData.occasion}</span>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="ml-2 text-slate-400">Calculating estimate...</span>
                </div>
              ) : estimate ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <h4 className="text-amber-400 font-medium mb-4 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Payment Breakdown
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Estimated Total:</span>
                      <span className="text-white">{formatCurrency(estimate.totalEstimate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">
                        Deposit Required ({estimate.depositPercentage}%):
                      </span>
                      <span className="text-amber-400 font-bold text-lg">
                        {formatCurrency(estimate.depositAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Pay at Restaurant:</span>
                      <span className="text-slate-400">{formatCurrency(estimate.remainingAmount)}</span>
                    </div>
                    
                    {/* Pricing Details */}
                    <div className="pt-3 border-t border-white/10">
                      <div className="text-xs text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Base Price (per person):</span>
                          <span>{formatCurrency(estimate.breakdown.basePrice)}</span>
                        </div>
                        {estimate.breakdown.isPeakTime && (
                          <div className="flex justify-between text-amber-300">
                            <span>🌟 Peak Time Premium (7-10 PM):</span>
                            <span>+30%</span>
                          </div>
                        )}
                        {estimate.breakdown.isLunchTime && (
                          <div className="flex justify-between text-blue-300">
                            <span>🍽️ Lunch Premium (12-2 PM):</span>
                            <span>+10%</span>
                          </div>
                        )}
                        {estimate.breakdown.occasion !== 'Regular Dining' && (
                          <div className="flex justify-between text-purple-300">
                            <span>✨ Special Occasion:</span>
                            <span>+Premium</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              ) : null}

              {/* Security Note */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <div className="text-xs text-slate-300">
                    <p className="text-blue-400 font-medium mb-1">Secure Payment</p>
                    <p>Your payment is processed securely through Paystack. We only collect the deposit amount to confirm your reservation.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayNow}
                  disabled={!estimate || loading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {estimate ? formatCurrency(estimate.depositAmount) : 'Deposit'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Processing Payment</h3>
              <p className="text-slate-400 text-sm">
                Please complete your payment in the new tab that opened. 
                This window will update automatically.
              </p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Payment Successful!</h3>
              <p className="text-slate-400 text-sm mb-6">
                Your table reservation has been confirmed. You'll receive a confirmation email shortly.
              </p>
              <Button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Payment Failed</h3>
              <p className="text-slate-400 text-sm mb-6">
                {error || "Something went wrong with your payment. Please try again."}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('calculate')}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};