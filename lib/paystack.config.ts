interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
}

// Paystack configuration
export const paystackConfig: PaystackConfig = {
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
  secretKey: process.env.PAYSTACK_SECRET_KEY || "", 
  baseUrl: "https://api.paystack.co"
};

// Validate configuration
export const validatePaystackConfig = (): boolean => {
  const { publicKey, secretKey } = paystackConfig;
  
  if (!publicKey || !secretKey) {
    console.error("Missing Paystack configuration. Please set PAYSTACK_PUBLIC_KEY and PAYSTACK_SECRET_KEY in environment variables.");
    return false;
  }
  
  return true;
};

// Restaurant-specific payment configuration
export const paymentConfig = {
  currency: "NGN", // Nigerian Naira - adjust based on your location
  depositPercentage: 20, // 20% deposit required
  minimumDeposit: 500, // Minimum 500 NGN deposit
  maximumDeposit: 10000, // Maximum 10,000 NGN deposit
  
  // Dynamic pricing based on time and occasion
  basePricePerPerson: 1500, // Base price in NGN
  timeMultipliers: {
    lunch: 1.1, // 10% premium for lunch (12-2 PM)
    dinnerRush: 1.3, // 30% premium for dinner (7-10 PM)
    regular: 1.0 // No premium for other times
  },
  
  occasionMultipliers: {
    "Regular Dining": 1.0,
    "Birthday Celebration": 1.2,
    "Anniversary": 1.25,
    "Business Meeting": 1.15,
    "Date Night": 1.1,
    "Special Event": 1.3
  },
  
  // Cancellation and refund policy
  refundPolicy: {
    fullRefund: 24, // Hours before reservation for full refund
    partialRefund: 12, // Hours before reservation for 50% refund
    noRefund: 2 // Hours before reservation - no refund
  }
};

// Calculate deposit amount based on reservation details
export const calculateDepositAmount = (
  partySize: number,
  occasion: string,
  reservationTime: Date
): { depositAmount: number; totalEstimate: number } => {
  const hour = reservationTime.getHours();
  
  // Determine time multiplier
  let timeMultiplier = paymentConfig.timeMultipliers.regular;
  if (hour >= 12 && hour <= 14) {
    timeMultiplier = paymentConfig.timeMultipliers.lunch;
  } else if (hour >= 19 && hour <= 22) {
    timeMultiplier = paymentConfig.timeMultipliers.dinnerRush;
  }
  
  // Determine occasion multiplier
  const occasionMultiplier = paymentConfig.occasionMultipliers[occasion as keyof typeof paymentConfig.occasionMultipliers] || 1.0;
  
  // Calculate total estimate
  const baseTotal = partySize * paymentConfig.basePricePerPerson;
  const totalEstimate = Math.round(baseTotal * timeMultiplier * occasionMultiplier);
  
  // Calculate deposit (percentage-based with min/max limits)
  const percentageDeposit = Math.round(totalEstimate * (paymentConfig.depositPercentage / 100));
  const depositAmount = Math.max(
    paymentConfig.minimumDeposit,
    Math.min(paymentConfig.maximumDeposit, percentageDeposit)
  );
  
  return { depositAmount, totalEstimate };
};

// Payment status enum
export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing", 
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  PARTIAL_REFUND = "partial_refund"
}

// Payment transaction interface
export interface PaymentTransaction {
  id: string;
  reservationId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paystackReference: string;
  customerEmail: string;
  customerName: string;
  metadata: {
    partySize: number;
    reservationDate: string;
    occasion: string;
    isDeposit: boolean;
    totalEstimate?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}