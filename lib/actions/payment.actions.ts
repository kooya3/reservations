"use server";

import { paystackConfig, validatePaystackConfig, calculateDepositAmount, PaymentStatus, PaymentTransaction } from "../paystack.config";
import { parseStringify } from "../utils";

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