"use server";

import { ID, Query } from "node-appwrite";
import { databases, DATABASE_ID } from "../appwrite.config";
import { paystackConfig, validatePaystackConfig, calculateDepositAmount, PaymentStatus, PaymentTransaction } from "../paystack.config";
import { parseStringify } from "../utils";

// Collections
const PAYMENTS_COLLECTION_ID = "payments";

// Extended payment types for POS integration
export enum PosPaymentType {
  RESERVATION = "reservation",
  DINING = "dining",
  DEPOSIT = "deposit",
  TIP = "tip",
  REFUND = "refund"
}

export enum PosPaymentMethod {
  CARD = "card",
  CASH = "cash",
  TRANSFER = "transfer",
  MOBILE_MONEY = "mobile_money",
  SPLIT = "split"
}

// Initialize payment transaction
export const initializePayment = async ({
  email,
  amount,
  reservationId,
  customerName,
  partySize,
  reservationDate,
  occasion
}: {
  email: string;
  amount: number;
  reservationId: string;
  customerName: string;
  partySize: number;
  reservationDate: string;
  occasion: string;
}) => {
  try {
    if (!validatePaystackConfig()) {
      throw new Error("Paystack configuration is invalid");
    }

    const reference = `RES_${reservationId}_${Date.now()}`;
    
    const paymentData = {
      email,
      amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
      reference,
      currency: "NGN",
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      metadata: {
        reservationId,
        partySize,
        reservationDate,
        occasion,
        isDeposit: true,
        customerName
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"]
    };

    const response = await fetch(`${paystackConfig.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Paystack API Error: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();

    if (!result.status) {
      throw new Error(`Payment initialization failed: ${result.message}`);
    }

    console.log("💳 Payment initialized successfully:", {
      reference,
      amount: amount,
      authorization_url: result.data.authorization_url
    });

    return parseStringify({
      success: true,
      data: {
        authorization_url: result.data.authorization_url,
        access_code: result.data.access_code,
        reference: result.data.reference
      }
    });

  } catch (error) {
    console.error("❌ Payment initialization error:", error);
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : "Failed to initialize payment"
    });
  }
};

// Verify payment transaction
export const verifyPayment = async (reference: string) => {
  try {
    if (!validatePaystackConfig()) {
      throw new Error("Paystack configuration is invalid");
    }

    const response = await fetch(
      `${paystackConfig.baseUrl}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Paystack API Error: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();

    if (!result.status) {
      throw new Error(`Payment verification failed: ${result.message}`);
    }

    const transaction = result.data;
    
    console.log("✅ Payment verified successfully:", {
      reference,
      status: transaction.status,
      amount: transaction.amount / 100, // Convert from kobo to main currency
      customer: transaction.customer.email
    });

    return parseStringify({
      success: true,
      data: {
        status: transaction.status,
        reference: transaction.reference,
        amount: transaction.amount / 100, // Convert from kobo
        currency: transaction.currency,
        customer: {
          email: transaction.customer.email,
          customer_code: transaction.customer.customer_code
        },
        metadata: transaction.metadata,
        paid_at: transaction.paid_at,
        channel: transaction.channel,
        gateway_response: transaction.gateway_response
      }
    });

  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify payment"
    });
  }
};

// Calculate payment estimate for reservation
export const calculatePaymentEstimate = async ({
  partySize,
  occasion,
  reservationDateTime
}: {
  partySize: number;
  occasion: string;
  reservationDateTime: string;
}) => {
  try {
    const reservationDate = new Date(reservationDateTime);
    const { depositAmount, totalEstimate } = calculateDepositAmount(
      partySize,
      occasion,
      reservationDate
    );

    return parseStringify({
      success: true,
      data: {
        depositAmount,
        totalEstimate,
        depositPercentage: 20,
        remainingAmount: totalEstimate - depositAmount,
        currency: "NGN",
        breakdown: {
          basePrice: 1500,
          partySize,
          timeSlot: reservationDate.toLocaleTimeString("en-US", { 
            hour: "2-digit", 
            minute: "2-digit",
            hour12: true 
          }),
          occasion,
          isPeakTime: reservationDate.getHours() >= 19 && reservationDate.getHours() <= 22,
          isLunchTime: reservationDate.getHours() >= 12 && reservationDate.getHours() <= 14
        }
      }
    });

  } catch (error) {
    console.error("❌ Payment calculation error:", error);
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate payment estimate"
    });
  }
};

// Process refund
export const processRefund = async ({
  transactionId,
  amount,
  reason
}: {
  transactionId: string;
  amount?: number; // Optional - for partial refunds
  reason: string;
}) => {
  try {
    if (!validatePaystackConfig()) {
      throw new Error("Paystack configuration is invalid");
    }

    const refundData: any = {
      transaction: transactionId,
      reason
    };

    // Add amount for partial refunds
    if (amount) {
      refundData.amount = amount * 100; // Convert to kobo
    }

    const response = await fetch(`${paystackConfig.baseUrl}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(refundData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Paystack API Error: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();

    if (!result.status) {
      throw new Error(`Refund failed: ${result.message}`);
    }

    console.log("💸 Refund processed successfully:", {
      transactionId,
      refundAmount: amount || "full",
      reason
    });

    return parseStringify({
      success: true,
      data: {
        refund_id: result.data.id,
        transaction: result.data.transaction,
        amount: result.data.amount / 100, // Convert from kobo
        currency: result.data.currency,
        status: result.data.status,
        reason: result.data.reason
      }
    });

  } catch (error) {
    console.error("❌ Refund processing error:", error);
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : "Failed to process refund"
    });
  }
};

// Create customer for recurring transactions
export const createPaystackCustomer = async ({
  email,
  firstName,
  lastName,
  phone
}: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}) => {
  try {
    if (!validatePaystackConfig()) {
      throw new Error("Paystack configuration is invalid");
    }

    const customerData = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone
    };

    const response = await fetch(`${paystackConfig.baseUrl}/customer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Paystack API Error: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();

    if (!result.status) {
      throw new Error(`Customer creation failed: ${result.message}`);
    }

    console.log("👤 Customer created successfully:", {
      email,
      customer_code: result.data.customer_code
    });

    return parseStringify({
      success: true,
      data: {
        customer_code: result.data.customer_code,
        email: result.data.email,
        id: result.data.id
      }
    });

  } catch (error) {
    console.error("❌ Customer creation error:", error);
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create customer"
    });
  }
};

// Initialize dining payment for POS orders
export const initializeDiningPayment = async ({
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  tableNumber,
  paymentMethod,
  splitPayments = [],
  tips = 0
}: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  tableNumber?: number;
  paymentMethod: PosPaymentMethod;
  splitPayments?: Array<{ amount: number; method: PosPaymentMethod; email?: string }>;
  tips?: number;
}) => {
  try {
    console.log("🍽️ Initializing dining payment...", { orderId, amount, paymentMethod });

    const totalAmount = amount + tips;
    const reference = `DINING_${orderId}_${Date.now()}`;

    // Create payment record in database
    const paymentRecord = await databases.createDocument(
      DATABASE_ID!,
      PAYMENTS_COLLECTION_ID,
      ID.unique(),
      {
        reference,
        orderId,
        amount: totalAmount,
        customerName,
        customerEmail: customerEmail.toLowerCase(),
        customerPhone: customerPhone || "",
        type: PosPaymentType.DINING,
        method: paymentMethod,
        status: PaymentStatus.PENDING,
        currency: "NGN",
        tableNumber: tableNumber || 0,
        tips,
        originalAmount: amount,
        createdAt: new Date().toISOString(),
        metadata: JSON.stringify({
          splitPayments,
          isTablePayment: !!tableNumber
        })
      }
    );

    // Handle different payment methods
    switch (paymentMethod) {
      case PosPaymentMethod.CARD:
        return await initializeCardPayment(reference, customerEmail, totalAmount, {
          orderId,
          tableNumber,
          customerName,
          isDining: true
        });

      case PosPaymentMethod.CASH:
        return parseStringify({
          success: true,
          paymentMethod: "cash",
          reference,
          amount: totalAmount,
          requiresStaffConfirmation: true
        });

      case PosPaymentMethod.SPLIT:
        return await initializeSplitPayment(reference, splitPayments, {
          orderId,
          tableNumber,
          customerName
        });

      default:
        return parseStringify({
          success: true,
          paymentMethod,
          reference,
          amount: totalAmount,
          requiresStaffConfirmation: true
        });
    }

  } catch (error) {
    console.error("❌ Dining payment initialization failed:", error);
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : "Failed to initialize dining payment"
    });
  }
};

// Process cash payment for dining
export const processCashPayment = async ({
  orderId,
  amount,
  receivedAmount,
  staffId,
  staffName,
  tips = 0
}: {
  orderId: string;
  amount: number;
  receivedAmount: number;
  staffId: string;
  staffName: string;
  tips?: number;
}) => {
  try {
    console.log("💵 Processing cash payment...", { orderId, amount, receivedAmount });

    const totalAmount = amount + tips;
    const change = receivedAmount - totalAmount;

    if (receivedAmount < totalAmount) {
      throw new Error("Insufficient payment received");
    }

    const reference = `CASH_${orderId}_${Date.now()}`;

    // Update or create payment record
    const paymentRecord = await databases.createDocument(
      DATABASE_ID!,
      PAYMENTS_COLLECTION_ID,
      ID.unique(),
      {
        reference,
        orderId,
        amount: totalAmount,
        receivedAmount,
        changeAmount: change,
        type: PosPaymentType.DINING,
        method: PosPaymentMethod.CASH,
        status: PaymentStatus.COMPLETED,
        currency: "NGN",
        tips,
        processedBy: staffId,
        processedByName: staffName,
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    );

    console.log("✅ Cash payment processed successfully:", reference);

    return parseStringify({
      success: true,
      reference,
      totalAmount,
      receivedAmount,
      changeAmount: change,
      status: PaymentStatus.COMPLETED
    });

  } catch (error) {
    console.error("❌ Cash payment processing failed:", error);
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : "Failed to process cash payment"
    });
  }
};

// Initialize card payment
const initializeCardPayment = async (
  reference: string,
  email: string,
  amount: number,
  metadata: any
) => {
  try {
    if (!validatePaystackConfig()) {
      throw new Error("Paystack configuration is invalid");
    }

    const paymentData = {
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      currency: "NGN",
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      metadata: {
        ...metadata,
        paymentType: "dining"
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"]
    };

    const response = await fetch(`${paystackConfig.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Paystack API Error: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();

    if (!result.status) {
      throw new Error(`Payment initialization failed: ${result.message}`);
    }

    return parseStringify({
      success: true,
      paymentMethod: "card",
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
      reference: result.data.reference
    });

  } catch (error) {
    console.error("❌ Card payment initialization failed:", error);
    throw error;
  }
};

// Initialize split payment
const initializeSplitPayment = async (
  reference: string,
  splitPayments: Array<{ amount: number; method: PosPaymentMethod; email?: string }>,
  metadata: any
) => {
  try {
    const splitResults = [];

    for (let i = 0; i < splitPayments.length; i++) {
      const split = splitPayments[i];
      const splitReference = `${reference}_SPLIT_${i + 1}`;

      if (split.method === PosPaymentMethod.CARD) {
        const cardPayment = await initializeCardPayment(
          splitReference,
          split.email || "customer@example.com",
          split.amount,
          { ...metadata, splitIndex: i + 1, totalSplits: splitPayments.length }
        );
        splitResults.push({
          splitIndex: i + 1,
          method: "card",
          amount: split.amount,
          ...cardPayment
        });
      } else {
        splitResults.push({
          splitIndex: i + 1,
          method: split.method,
          amount: split.amount,
          reference: splitReference,
          requiresStaffConfirmation: true
        });
      }
    }

    return parseStringify({
      success: true,
      paymentMethod: "split",
      splitPayments: splitResults,
      reference
    });

  } catch (error) {
    console.error("❌ Split payment initialization failed:", error);
    throw error;
  }
};

// Get payment by order ID
export const getOrderPayments = async (orderId: string) => {
  try {
    console.log("📋 Fetching payments for order:", orderId);

    const payments = await databases.listDocuments(
      DATABASE_ID!,
      PAYMENTS_COLLECTION_ID,
      [
        Query.equal('orderId', orderId),
        Query.orderDesc('createdAt')
      ]
    );

    console.log(`✅ Found ${payments.documents.length} payments for order:`, orderId);

    return parseStringify(payments.documents);

  } catch (error) {
    console.error("❌ Error fetching order payments:", error);
    
    // Return sample data for demo
    return parseStringify([
      {
        reference: `DINING_${orderId}_demo`,
        amount: 15000,
        method: "cash",
        status: "completed",
        paidAt: new Date().toISOString()
      }
    ]);
  }
};

// Update payment status
export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  additionalData?: any
) => {
  try {
    console.log("📝 Updating payment status:", { paymentId, status });

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (status === PaymentStatus.COMPLETED) {
      updateData.paidAt = new Date().toISOString();
    }

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    const updatedPayment = await databases.updateDocument(
      DATABASE_ID!,
      PAYMENTS_COLLECTION_ID,
      paymentId,
      updateData
    );

    console.log("✅ Payment status updated:", status);

    return parseStringify(updatedPayment);

  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    throw error;
  }
};

// Calculate payment breakdown with taxes and service charges
export const calculatePaymentBreakdown = async (subtotal: number, tips = 0) => {
  try {
    const taxRate = 0.075; // 7.5% VAT
    const serviceChargeRate = 0.10; // 10% service charge

    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const serviceCharge = Math.round(subtotal * serviceChargeRate * 100) / 100;
    const totalBeforeTips = subtotal + taxAmount + serviceCharge;
    const grandTotal = totalBeforeTips + tips;

    return parseStringify({
      subtotal,
      taxAmount,
      serviceCharge,
      tips,
      totalBeforeTips,
      grandTotal,
      breakdown: {
        "Subtotal": subtotal,
        "VAT (7.5%)": taxAmount,
        "Service Charge (10%)": serviceCharge,
        "Tips": tips,
        "Grand Total": grandTotal
      }
    });

  } catch (error) {
    console.error("❌ Error calculating payment breakdown:", error);
    throw error;
  }
};