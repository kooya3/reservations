"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyPayment } from "@/lib/actions/payment.actions";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "failed">("loading");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");

  useEffect(() => {
    const verifyPaymentTransaction = async () => {
      if (!reference && !trxref) {
        setVerificationStatus("failed");
        setError("No payment reference provided");
        return;
      }

      const paymentRef = reference || trxref;

      try {
        console.log("🔍 Verifying payment:", paymentRef);
        
        const result = await verifyPayment(paymentRef!);
        
        if (result.success && result.data.status === "success") {
          setVerificationStatus("success");
          setPaymentData(result.data);
          console.log("✅ Payment verification successful");
        } else {
          setVerificationStatus("failed");
          setError(result.error || "Payment verification failed");
          console.error("❌ Payment verification failed:", result.error);
        }
      } catch (error) {
        console.error("❌ Payment verification error:", error);
        setVerificationStatus("failed");
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      }
    };

    verifyPaymentTransaction();
  }, [reference, trxref]);

  const handleContinue = () => {
    // Redirect based on payment type
    if (paymentData?.metadata?.reservationId) {
      router.push(`/reservations/${paymentData.metadata.reservationId}/success`);
    } else if (paymentData?.metadata?.orderId) {
      router.push(`/orders/${paymentData.metadata.orderId}/success`);
    } else {
      router.push("/");
    }
  };

  const handleRetry = () => {
    router.back();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const LoadingView = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <Clock className="w-6 h-6 text-amber-500 absolute inset-0 m-auto" />
      </div>
      <h2 className="text-xl font-semibold text-white">Verifying Payment</h2>
      <p className="text-slate-400 text-center max-w-md">
        Please wait while we verify your payment with our payment processor...
      </p>
    </div>
  );

  const SuccessView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h2>
        <p className="text-slate-300">Your payment has been processed successfully.</p>
      </div>

      {paymentData && (
        <Card className="bg-slate-800/50 border-slate-700 text-left">
          <CardHeader>
            <CardTitle className="text-white text-lg">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Reference:</span>
              <span className="text-white font-mono">{paymentData.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount:</span>
              <span className="text-white">{formatCurrency(paymentData.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Method:</span>
              <span className="text-white capitalize">{paymentData.channel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-green-400 font-medium">Completed</span>
            </div>
            {paymentData.customer && (
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="text-white">{paymentData.customer.email}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Date:</span>
              <span className="text-white">
                {new Date(paymentData.paid_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleContinue}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Continue
        </Button>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </motion.div>
  );

  const FailedView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
        <XCircle className="w-10 h-10 text-red-400" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Payment Failed</h2>
        <p className="text-slate-300">We couldn't process your payment.</p>
        {error && (
          <p className="text-sm text-slate-400 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleRetry}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Back to Home
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <CardContent className="p-8">
            {verificationStatus === "loading" && <LoadingView />}
            {verificationStatus === "success" && <SuccessView />}
            {verificationStatus === "failed" && <FailedView />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}