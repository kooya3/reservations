"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard,
  DollarSign,
  Users,
  Calculator,
  CheckCircle,
  AlertCircle,
  Clock,
  Receipt,
  Banknote,
  Smartphone,
  ArrowLeftRight,
  Plus,
  Minus,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  initializeDiningPayment,
  processCashPayment,
  calculatePaymentBreakdown,
  PosPaymentMethod,
  PaymentStatus 
} from "@/lib/actions/payment.actions";
import { useStaffAuth } from "@/hooks/useStaffAuth";

interface PaymentInterfaceProps {
  order: {
    $id: string;
    orderNumber: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    tableNumber?: number;
    subtotal: number;
    taxAmount: number;
    serviceCharge: number;
    totalAmount: number;
    items: any[];
  };
  onPaymentComplete: (payment: any) => void;
  onClose: () => void;
}

interface SplitPayment {
  id: string;
  amount: number;
  method: PosPaymentMethod;
  email?: string;
  name?: string;
}

export const PaymentInterface: React.FC<PaymentInterfaceProps> = ({
  order,
  onPaymentComplete,
  onClose
}) => {
  const { staff } = useStaffAuth();
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod | "split">("cash");
  const [tips, setTips] = useState(0);
  const [cashReceived, setCashReceived] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any>(null);
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);
  const [showSplitForm, setShowSplitForm] = useState(false);

  useEffect(() => {
    calculateBreakdown();
  }, [order, tips]);

  const calculateBreakdown = async () => {
    try {
      const breakdown = await calculatePaymentBreakdown(order.totalAmount, tips);
      setPaymentBreakdown(breakdown);
    } catch (error) {
      console.error("Error calculating breakdown:", error);
    }
  };

  const handleTipChange = (tipAmount: number) => {
    setTips(tipAmount);
  };

  const calculateTipPercentage = (percentage: number) => {
    const tipAmount = Math.round((order.totalAmount * percentage / 100) * 100) / 100;
    setTips(tipAmount);
  };

  const handlePaymentSubmit = async () => {
    if (!staff) {
      alert("Staff authentication required");
      return;
    }

    setLoading(true);

    try {
      const customerEmail = order.customerEmail || "customer@restaurant.com";
      const totalWithTips = paymentBreakdown?.grandTotal || order.totalAmount;

      if (paymentMethod === "split") {
        return handleSplitPayment();
      }

      if (paymentMethod === PosPaymentMethod.CASH) {
        const received = parseFloat(cashReceived);
        if (!received || received < totalWithTips) {
          alert(`Insufficient cash received. Required: ₦${totalWithTips.toLocaleString()}`);
          return;
        }

        const payment = await processCashPayment({
          orderId: order.$id,
          amount: order.totalAmount,
          receivedAmount: received,
          staffId: staff.$id,
          staffName: `${staff.firstName} ${staff.lastName}`,
          tips
        });

        if (payment.success) {
          onPaymentComplete(payment);
        } else {
          alert("Cash payment processing failed: " + payment.error);
        }
      } else {
        // Card/Digital payment
        const payment = await initializeDiningPayment({
          orderId: order.$id,
          amount: order.totalAmount,
          customerName: order.customerName,
          customerEmail,
          customerPhone: order.customerPhone,
          tableNumber: order.tableNumber,
          paymentMethod,
          tips
        });

        if (payment.success) {
          if (payment.authorizationUrl) {
            // Redirect to payment gateway
            window.open(payment.authorizationUrl, '_blank');
          } else {
            onPaymentComplete(payment);
          }
        } else {
          alert("Payment initialization failed: " + payment.error);
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSplitPayment = async () => {
    const totalSplit = splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalRequired = paymentBreakdown?.grandTotal || order.totalAmount;

    if (Math.abs(totalSplit - totalRequired) > 0.01) {
      alert(`Split payment amounts must equal total: ₦${totalRequired.toLocaleString()}`);
      return;
    }

    try {
      const splitPaymentData = splitPayments.map(split => ({
        amount: split.amount,
        method: split.method,
        email: split.email
      }));

      const payment = await initializeDiningPayment({
        orderId: order.$id,
        amount: order.totalAmount,
        customerName: order.customerName,
        customerEmail: order.customerEmail || "customer@restaurant.com",
        customerPhone: order.customerPhone,
        tableNumber: order.tableNumber,
        paymentMethod: PosPaymentMethod.SPLIT,
        splitPayments: splitPaymentData,
        tips
      });

      if (payment.success) {
        onPaymentComplete(payment);
      }
    } catch (error) {
      console.error("Split payment error:", error);
      alert("Split payment processing failed. Please try again.");
    }
  };

  const addSplitPayment = () => {
    const remaining = (paymentBreakdown?.grandTotal || order.totalAmount) - 
                     splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    setSplitPayments([...splitPayments, {
      id: Date.now().toString(),
      amount: Math.max(0, remaining),
      method: PosPaymentMethod.CASH,
      name: `Person ${splitPayments.length + 1}`
    }]);
  };

  const updateSplitPayment = (id: string, updates: Partial<SplitPayment>) => {
    setSplitPayments(prev => prev.map(payment => 
      payment.id === id ? { ...payment, ...updates } : payment
    ));
  };

  const removeSplitPayment = (id: string) => {
    setSplitPayments(prev => prev.filter(payment => payment.id !== id));
  };

  const getPaymentMethodIcon = (method: PosPaymentMethod | "split") => {
    switch (method) {
      case PosPaymentMethod.CARD:
        return <CreditCard className="w-5 h-5" />;
      case PosPaymentMethod.CASH:
        return <Banknote className="w-5 h-5" />;
      case PosPaymentMethod.TRANSFER:
        return <Smartphone className="w-5 h-5" />;
      case "split":
        return <ArrowLeftRight className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getPaymentMethodColor = (method: PosPaymentMethod | "split") => {
    const colors = {
      [PosPaymentMethod.CARD]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      [PosPaymentMethod.CASH]: "bg-green-500/20 text-green-400 border-green-500/30", 
      [PosPaymentMethod.TRANSFER]: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      [PosPaymentMethod.MOBILE_MONEY]: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      "split": "bg-orange-500/20 text-orange-400 border-orange-500/30"
    };
    return colors[method] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  if (!paymentBreakdown) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Calculating payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Order Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Payment - {order.orderNumber}
            </CardTitle>
            <Button variant="ghost" onClick={onClose} size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Customer</p>
              <p className="text-white font-medium">{order.customerName}</p>
              {order.tableNumber && (
                <p className="text-slate-400 text-xs">Table {order.tableNumber}</p>
              )}
            </div>
            <div>
              <p className="text-slate-400 text-sm">Subtotal</p>
              <p className="text-white font-medium">₦{order.subtotal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Tax & Service</p>
              <p className="text-white font-medium">₦{(order.taxAmount + order.serviceCharge).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-xl font-bold text-amber-400">₦{order.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Selection */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: PosPaymentMethod.CASH, label: "Cash" },
                { value: PosPaymentMethod.CARD, label: "Card" },
                { value: PosPaymentMethod.TRANSFER, label: "Transfer" },
                { value: "split" as const, label: "Split Bill" }
              ].map(method => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === method.value
                      ? getPaymentMethodColor(method.value)
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {getPaymentMethodIcon(method.value)}
                    <span className="text-sm font-medium">{method.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Cash Input */}
            {paymentMethod === PosPaymentMethod.CASH && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <label className="text-slate-300 text-sm">Cash Received</label>
                <input
                  type="number"
                  placeholder="Enter amount received"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
                {cashReceived && (
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Required:</span>
                      <span className="text-white">₦{paymentBreakdown.grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Cash Received:</span>
                      <span className="text-white">₦{parseFloat(cashReceived || "0").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-400">Change:</span>
                      <span className={`${
                        parseFloat(cashReceived || "0") >= paymentBreakdown.grandTotal 
                          ? "text-green-400" 
                          : "text-red-400"
                      }`}>
                        ₦{Math.max(0, parseFloat(cashReceived || "0") - paymentBreakdown.grandTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Split Payment */}
            {paymentMethod === "split" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 text-sm">Split Payments</label>
                  <Button
                    size="sm"
                    onClick={addSplitPayment}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {splitPayments.map((payment, index) => (
                    <div key={payment.id} className="bg-slate-700/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">Split {index + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSplitPayment(payment.id)}
                          className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={payment.amount}
                          onChange={(e) => updateSplitPayment(payment.id, { amount: parseFloat(e.target.value) || 0 })}
                          className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-amber-500 focus:outline-none"
                        />
                        <select
                          value={payment.method}
                          onChange={(e) => updateSplitPayment(payment.id, { method: e.target.value as PosPaymentMethod })}
                          className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:border-amber-500 focus:outline-none"
                        >
                          <option value={PosPaymentMethod.CASH}>Cash</option>
                          <option value={PosPaymentMethod.CARD}>Card</option>
                          <option value={PosPaymentMethod.TRANSFER}>Transfer</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Split:</span>
                    <span className="text-white">
                      ₦{splitPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Required:</span>
                    <span className="text-white">₦{paymentBreakdown.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Tips and Summary */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Tips & Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Tip Buttons */}
            <div>
              <label className="text-slate-300 text-sm mb-2 block">Tips</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[10, 15, 20, 25].map(percentage => (
                  <button
                    key={percentage}
                    onClick={() => calculateTipPercentage(percentage)}
                    className="px-2 py-2 text-xs bg-slate-700 hover:bg-amber-600 rounded-lg transition-colors"
                  >
                    {percentage}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom tip amount"
                value={tips}
                onChange={(e) => setTips(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Payment Breakdown */}
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
              <h4 className="text-white font-medium">Payment Breakdown</h4>
              {Object.entries(paymentBreakdown.breakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-slate-400">{key}:</span>
                  <span className={key === "Grand Total" ? "text-amber-400 font-bold" : "text-white"}>
                    ₦{(value as number).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Process Payment */}
            <Button
              onClick={handlePaymentSubmit}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Process Payment - ₦{paymentBreakdown.grandTotal.toLocaleString()}
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};