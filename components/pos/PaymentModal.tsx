"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { initializePaystackTransaction, verifyPaystackTransaction } from "@/lib/actions/paystack.actions";
import PaystackPop from "@paystack/inline-js";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    email: string;
    orderId: string;
    onSuccess: (reference: string, tableNumber: number, guestCount: number) => void;
}

export function PaymentModal({ isOpen, onClose, amount, email, orderId, onSuccess }: PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tableNumber, setTableNumber] = useState(1);
    const [guestCount, setGuestCount] = useState(1);

    const handlePayment = async () => {
        try {
            if (tableNumber < 1 || guestCount < 1) {
                setError("Please enter valid table and guest numbers");
                return;
            }

            setIsProcessing(true);
            setError(null);

            // Step 1: Initialize transaction on server
            const initResult = await initializePaystackTransaction({
                email,
                amount,
                orderId,
                metadata: {
                    orderType: "pos",
                    timestamp: new Date().toISOString(),
                    tableNumber,
                    guestCount
                }
            });

            if (!initResult.success || !initResult.access_code) {
                throw new Error(initResult.error || "Failed to initialize payment");
            }

            // Step 2: Open Paystack Popup
            // @ts-ignore - PaystackPop types not available
            const popup = new PaystackPop();
            popup.resumeTransaction(initResult.access_code, {
                onSuccess: async (transaction: any) => {
                    // Step 3: Verify transaction on server
                    const verifyResult = await verifyPaystackTransaction(transaction.reference);

                    if (!verifyResult.success || verifyResult.data?.status !== "success") {
                        setError("Payment verification failed. Please contact support.");
                        setIsProcessing(false);
                        return;
                    }

                    // Step 4: Verify amount matches
                    if (verifyResult.data.amount !== amount) {
                        setError("Payment amount mismatch. Please contact support.");
                        setIsProcessing(false);
                        return;
                    }

                    // Step 5: Success - deliver value
                    onSuccess(transaction.reference, tableNumber, guestCount);
                    setIsProcessing(false);
                },
                onCancel: () => {
                    setError("Payment cancelled");
                    setIsProcessing(false);
                },
                onError: (error: any) => {
                    setError(error.message || "Payment failed");
                    setIsProcessing(false);
                }
            });

        } catch (err) {
            console.error("Payment error:", err);
            setError(err instanceof Error ? err.message : "Payment failed");
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-neutral-900 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Payment</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-neutral-400 mb-1 block">Table Number</label>
                            <input
                                type="number"
                                min="1"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(parseInt(e.target.value) || 0)}
                                className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-neutral-400 mb-1 block">Guest Count</label>
                            <input
                                type="number"
                                min="1"
                                value={guestCount}
                                onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                                className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-neutral-400">Total Amount to Pay</p>
                        <p className="text-4xl font-bold text-emerald-400">
                            {formatCurrency(amount)}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white h-12 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Pay with Paystack"
                        )}
                    </button>

                    <p className="text-xs text-center text-neutral-500">
                        Secured by Paystack • Supports Cards, M-PESA, Bank Transfer
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
