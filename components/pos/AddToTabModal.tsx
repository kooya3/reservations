"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/pos.types";
import { formatCurrency } from "@/lib/utils";
import { createOrder } from "@/lib/actions/pos.actions";
import { Loader2 } from "lucide-react";

interface AddToTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  waiterName?: string | null;
  waiterId?: string | null;
  onSuccess: (order: any) => void;
}

export function AddToTabModal({
  isOpen,
  onClose,
  cart,
  waiterName,
  waiterId,
  onSuccess,
}: AddToTabModalProps) {
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal;

  const handleSubmit = async () => {
    try {
      setError(null);

      if (!cart.length) {
        setError("No items in the current order.");
        return;
      }

      if (!tableNumber || tableNumber < 1) {
        setError("Please enter a valid table number.");
        return;
      }

      if (!guestCount || guestCount < 1) {
        setError("Please enter a valid guest count.");
        return;
      }

      setIsSubmitting(true);

      const name =
        customerName.trim() !== "" ? customerName.trim() : "Walk-in Customer";

      // Generate short order number similar to POSInterface implementation
      const timestamp = Date.now().toString().slice(-10);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const shortOrderNumber = `ORD-${timestamp}-${random}`;

      // Calculate VAT - prices are VAT-inclusive (16%)
      const vatRate = 0.16;
      const totalBeforeVat = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const subtotal = totalBeforeVat / (1 + vatRate);
      const taxAmount = subtotal * vatRate;
      const total = totalBeforeVat;

      const now = new Date().toISOString();

      const orderData = {
        orderNumber: shortOrderNumber,
        type: "dine_in",
        status: "placed",
        tableNumber,
        customerName: name,
        guestCount,
        waiterName: waiterName || "POS System",
        waiterId: waiterId || "system",
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        serviceCharge: 0,
        discountAmount: 0,
        tipAmount: 0,
        totalAmount: total,
        paymentStatus: "unpaid",
        orderTime: now,
        priority: "normal",
        items: cart,
        specialInstructions: `TAB - Table ${tableNumber}`,
      } as any;

      const newOrder = await createOrder(orderData);

      onSuccess(newOrder);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error("Failed to add order to tab:", err);
      setIsSubmitting(false);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add this order to the tab. Please try again."
      );
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-neutral-900 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add To Tab</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Save this order as an unpaid tab for a specific table. You can
            settle the full tab later from the Settle Table screen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-neutral-400 mb-1 block">
                Table Number
              </label>
              <input
                type="number"
                min={1}
                value={tableNumber}
                onChange={(e) =>
                  setTableNumber(
                    Number.parseInt(e.target.value || "0", 10) || 0
                  )
                }
                className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-neutral-400 mb-1 block">
                Guest Count
              </label>
              <input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) =>
                  setGuestCount(
                    Number.parseInt(e.target.value || "0", 10) || 0
                  )
                }
                className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-neutral-400 mb-1 block">
              Customer Name (optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer"
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="mt-2 border-t border-white/10 pt-3 text-sm">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-300 mt-2">
              <span>Total (tab)</span>
              <span className="text-lg font-bold text-emerald-400">
                {formatCurrency(total)}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500 italic">
              This order will be saved as unpaid for this table. No payment
              will be processed now.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !cart.length}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add To Tab"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

