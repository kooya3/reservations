"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  getTableDailyTabSummary,
  settleTableTabAndCreateOrder,
} from "@/lib/actions/pos.actions";
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "@/lib/actions/paystack.actions";
import { Loader2, CreditCard, RefreshCw } from "lucide-react";

interface SettleTableTabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettleTableTabModal({
  isOpen,
  onClose,
}: SettleTableTabModalProps) {
  const router = useRouter();
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [date, setDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10) // yyyy-mm-dd
  );
  const [summary, setSummary] = useState<any | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoadSummary = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      setIsLoadingSummary(true);

      if (!tableNumber || tableNumber < 1) {
        throw new Error("Please enter a valid table number.");
      }

      const result = await getTableDailyTabSummary(tableNumber, date);
      setSummary(result);

      if (!result.orders || result.orders.length === 0) {
        setError("No unpaid orders found for this table on the selected date.");
      }
    } catch (err) {
      console.error("Failed to load table tab summary:", err);
      setSummary(null);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load table summary. Please try again."
      );
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleSettleTab = async () => {
    if (!summary || !summary.orders || summary.orders.length === 0) {
      setError("There is no unpaid tab to settle for this table.");
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setIsProcessingPayment(true);

      const amount = summary.totalAmount as number;
      if (!amount || amount <= 0) {
        throw new Error("Tab total is zero; nothing to charge.");
      }

      const syntheticOrderId = `tab-${tableNumber}-${date}`;

      const initResult = await initializePaystackTransaction({
        email: "customer@example.com",
        amount,
        orderId: syntheticOrderId,
        metadata: {
          tableNumber,
          date,
          type: "table_tab",
          orders: summary.orders.map((o: any) => o.$id),
        },
      });

      if (!initResult.success || !initResult.access_code) {
        throw new Error(initResult.error || "Failed to initialize payment");
      }

      // Dynamically import PaystackPop on the client to avoid SSR window errors
      const { default: PaystackPop } = await import("@paystack/inline-js");
      // @ts-ignore - PaystackPop types are not complete
      const popup = new PaystackPop();

      popup.resumeTransaction(initResult.access_code, {
        onSuccess: async (transaction: any) => {
          try {
            const verifyResult = await verifyPaystackTransaction(
              transaction.reference
            );

            if (
              !verifyResult.success ||
              verifyResult.data?.status !== "success"
            ) {
              setError("Payment verification failed. Please contact support.");
              setIsProcessingPayment(false);
              return;
            }

            if (verifyResult.data.amount !== amount) {
              setError("Payment amount mismatch. Please contact support.");
              setIsProcessingPayment(false);
              return;
            }

            const settleResult = await settleTableTabAndCreateOrder({
              tableNumber,
              date,
              paymentReference: transaction.reference,
              paymentMethod: "paystack",
            });

            if (!settleResult.success || !settleResult.consolidatedOrderId) {
              setError(
                settleResult.message ||
                  "Payment captured, but failed to mark orders as paid. Please resolve manually."
              );
              setIsProcessingPayment(false);
              return;
            }

            setSuccessMessage(
              `Tab settled successfully. ${settleResult.updatedCount} orders marked as paid.`
            );
            // Refresh summary to reflect no remaining unpaid orders
            const refreshed = await getTableDailyTabSummary(tableNumber, date);
            setSummary(refreshed);

            // Navigate to the standard receipt page for the consolidated order
            router.push(`/pos/receipt/${settleResult.consolidatedOrderId}`);
          } catch (err) {
            console.error("Error after successful payment:", err);
            setError(
              err instanceof Error
                ? err.message
                : "An error occurred after payment. Please check order statuses."
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onCancel: () => {
          setError("Payment cancelled.");
          setIsProcessingPayment(false);
        },
        onError: (err: any) => {
          console.error("Paystack popup error:", err);
          setError(err?.message || "Payment failed.");
          setIsProcessingPayment(false);
        },
      });
    } catch (err) {
      console.error("Failed to settle table tab:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to settle table tab. Please try again."
      );
      setIsProcessingPayment(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccessMessage(null);
    setSummary(null);
    setIsLoadingSummary(false);
    setIsProcessingPayment(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-neutral-900 border-white/10 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settle Table Tab</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Load all unpaid orders for a table on a given day, review the tab,
            and charge the full amount once the guest is ready to pay.
          </DialogDescription>
        </DialogHeader>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          <div>
            <label className="text-sm text-neutral-400 mb-1 block">
              Table Number
            </label>
            <input
              type="number"
              min={1}
              value={tableNumber}
              onChange={(e) =>
                setTableNumber(Number.parseInt(e.target.value || "0", 10))
              }
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 mb-1 block">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleLoadSummary}
              disabled={isLoadingSummary}
              className="w-full bg-emerald-600 hover:bg-emerald-500"
            >
              {isLoadingSummary ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Tab
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Load Tab
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-sm text-neutral-300">
              <span>
                Table {summary.tableNumber} • {summary.date}
              </span>
              <span>{summary.orderCount} unpaid order(s)</span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-white/5 rounded-lg p-3 space-y-2 bg-neutral-950/50">
              {summary.orders && summary.orders.length > 0 ? (
                summary.orders.map((order: any) => (
                  <div
                    key={order.$id}
                    className="flex items-center justify-between text-sm border-b border-white/5 last:border-0 pb-1 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">
                        {order.orderNumber || order.$id}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {order.orderTime
                          ? new Date(order.orderTime).toLocaleTimeString()
                          : ""}
                      </p>
                    </div>
                    <div className="font-semibold text-emerald-400">
                      {formatCurrency(order.totalAmount || 0)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-400">
                  No unpaid orders for this table on the selected date.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <div className="text-sm text-neutral-300">
                <p>Subtotal</p>
                <p className="font-semibold">
                  {formatCurrency(summary.subtotal || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400 uppercase">Total Due</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(summary.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isProcessingPayment}
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleSettleTab}
            disabled={
              isProcessingPayment ||
              isLoadingSummary ||
              !summary ||
              !summary.orders ||
              summary.orders.length === 0
            }
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Charge Full Tab
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

