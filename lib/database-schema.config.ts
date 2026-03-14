// Complete Restaurant Management Database Schema Configuration

export const DATABASE_COLLECTIONS = {
  // Existing Collections
  APPOINTMENTS: process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
  PATIENTS: process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
  
  // New POS Collections
  MENU_ITEMS: "menu_items",
  ORDERS: "orders", 
  ORDER_ITEMS: "order_items",
  TABLES: "tables",
  STAFF: "staff",
  STAFF_SESSIONS: "staff_sessions",
  INVENTORY: "inventory",
  PAYMENTS: "payments",
  KITCHEN_ORDERS: "kitchen_orders",
  CUSTOMER_PROFILES: "customer_profiles",
  BUSINESS_METRICS: "business_metrics",
  SYSTEM_LOGS: "system_logs"
} as const;

// Collection Schema Definitions
export const COLLECTION_SCHEMAS = {
  MENU_ITEMS: {
    name: "string",
    description: "string", 
    price: "number",
    category: "string",
    imageUrl: "string?",
    isAvailable: "boolean",
    preparationTime: "number", // minutes
    ingredients: "string[]",
    allergens: "string[]",
    dietaryFlags: "object", // { isVegetarian, isVegan, isGlutenFree }
    variants: "object[]?", // size, cooking style variants
    customizations: "object[]?", // add-ons, modifications
    costPrice: "number", // for profitability analysis
    inventoryItems: "string[]", // linked inventory item IDs
    popularity: "number", // order frequency score
    isActive: "boolean",
    createdAt: "datetime",
    updatedAt: "datetime"
  },

  ORDERS: {
    orderNumber: "string", // ORDER-001, ORDER-002, etc.
    type: "string", // dine_in, takeaway, delivery
    status: "string", // draft, placed, confirmed, preparing, ready, served, cancelled
    tableNumber: "number?",
    
    // Customer Information
    customerId: "string?", // link to customer profile
    customerName: "string",
    customerPhone: "string?",
    customerEmail: "string?",
    guestCount: "number",
    
    // Reservation Integration
    reservationId: "string?", // link to existing appointment
    
    // Staff Assignment
    waiterId: "string?",
    waiterName: "string",
    cashierId: "string?",
    
    // Pricing
    subtotal: "number",
    taxAmount: "number", // 7.5% VAT
    serviceCharge: "number", // 10% service charge
    discountAmount: "number",
    tipAmount: "number",
    totalAmount: "number",
    
    // Timing
    orderTime: "datetime",
    estimatedReadyTime: "datetime?",
    actualReadyTime: "datetime?",
    servedTime: "datetime?",
    completedTime: "datetime?",
    
    // Kitchen Notes
    specialInstructions: "string?",
    kitchenNotes: "string?",
    priority: "string", // normal, high, urgent
    
    // Payment
    paymentStatus: "string", // pending, partial, paid, refunded
    paymentMethods: "object[]", // [{ method, amount, reference }]
    
    createdAt: "datetime",
    updatedAt: "datetime"
  },

  ORDER_ITEMS: {
    orderId: "string", // parent order
    menuItemId: "string",
    menuItemName: "string", // snapshot for historical data
    quantity: "number",
    unitPrice: "number", // price at time of order
    totalPrice: "number",
    
    // Customizations
    variant: "object?", // selected size, style, etc.
    customizations: "object[]", // selected add-ons
    specialInstructions: "string?",
    
    // Kitchen Status
    kitchenStatus: "string", // waiting, preparing, ready, served
    startedAt: "datetime?",
    completedAt: "datetime?",
    
    createdAt: "datetime"
  },

  TABLES: {
    number: "number",
    capacity: "number",
    location: "string", // indoor, outdoor, bar, private_dining, terrace
    status: "string", // available, occupied, reserved, cleaning, out_of_order
    
    // Current State
    currentOrderId: "string?",
    reservationId: "string?", 
    waiterId: "string?",
    waiterName: "string?",
    guestCount: "number?",
    
    // Timing
    occupiedAt: "datetime?",
    lastCleaned: "datetime?",
    estimatedAvailableAt: "datetime?",
    
    // Configuration
    position: "object", // { x, y } coordinates for floor plan
    features: "string[]", // window_view, private, booth, etc.
    notes: "string?",
    isActive: "boolean",
    
    createdAt: "datetime",
    updatedAt: "datetime"
  },

  STAFF: {
    name: "string",
    email: "string",
    phone: "string",
    role: "string", // admin, manager, waiter, chef, bartender, cashier, host
    
    // Authentication
    passwordHash: "string",
    pin: "string", // 4-digit PIN for quick POS access
    
    // Permissions
    permissions: "string[]", // granular permissions array
    accessLevel: "number", // 1-5 access level
    
    // Work Details
    isActive: "boolean",
    employeeId: "string",
    department: "string", // front_of_house, kitchen, management
    
    // Schedule
    shifts: "object[]", // weekly schedule
    hourlyRate: "number?",
    
    // Performance
    totalOrders: "number",
    totalRevenue: "number", 
    averageRating: "number",
    
    // Personal
    startDate: "datetime",
    birthday: "datetime?",
    emergencyContact: "object?",
    
    createdAt: "datetime",
    updatedAt: "datetime"
  },

  STAFF_SESSIONS: {
    staffId: "string",
    staffName: "string",
    role: "string",
    
    // Session Details
    sessionToken: "string",
    device: "string", // tablet, desktop, mobile
    location: "string", // pos_station_1, kitchen_display_1
    
    // Timing
    startTime: "datetime",
    endTime: "datetime?",
    lastActivity: "datetime",
    
    // Session Data
    ordersHandled: "number",
    revenueGenerated: "number",
    
    isActive: "boolean",
    createdAt: "datetime"
  },

  INVENTORY: {
    name: "string",
    category: "string", // proteins, vegetables, beverages, supplies
    unit: "string", // kg, liters, pieces
    
    // Stock Levels
    currentStock: "number",
    minStock: "number", // reorder threshold
    maxStock: "number",
    reservedStock: "number", // allocated for orders
    
    // Pricing
    costPerUnit: "number",
    lastPurchasePrice: "number",
    averageCost: "number",
    
    // Supplier Information
    supplier: "string?",
    supplierContact: "string?",
    leadTimeDays: "number",
    
    // Product Details
    sku: "string?",
    barcode: "string?",
    expiryDate: "datetime?",
    batchNumber: "string?",
    
    // Location
    storageLocation: "string", // kitchen, bar, storage_room, freezer
    
    // Menu Connections
    menuItems: "string[]", // menu items that use this ingredient
    
    // History
    lastRestocked: "datetime?",
    lastUsed: "datetime?",
    
    isActive: "boolean",
    createdAt: "datetime",
    updatedAt: "datetime"
  },

  PAYMENTS: {
    orderId: "string?", // can be null for reservation payments
    reservationId: "string?",
    
    // Payment Details
    amount: "number",
    currency: "string",
    method: "string", // cash, card, mobile_money, bank_transfer, paystack
    status: "string", // pending, processing, completed, failed, refunded
    
    // External References
    paystackReference: "string?",
    transactionId: "string",
    receiptNumber: "string",
    
    // Customer Info
    customerName: "string",
    customerEmail: "string?",
    customerPhone: "string?",
    
    // Staff
    processedBy: "string", // staff ID
    staffName: "string",
    
    // Breakdown
    subtotal: "number",
    taxAmount: "number",
    serviceCharge: "number", 
    tipAmount: "number",
    discountAmount: "number",
    
    // Timing
    processedAt: "datetime",
    completedAt: "datetime?",
    
    // Metadata
    metadata: "object?", // additional payment data
    notes: "string?",
    
    createdAt: "datetime"
  },

  KITCHEN_ORDERS: {
    orderId: "string",
    orderNumber: "string",
    tableNumber: "number?",
    
    // Items
    items: "object[]", // order items for kitchen
    totalItems: "number",
    
    // Status
    status: "string", // pending, in_progress, ready, served, cancelled
    priority: "string", // normal, high, urgent
    
    // Timing
    estimatedTime: "number", // minutes
    actualTime: "number?",
    receivedAt: "datetime",
    startedAt: "datetime?",
    completedAt: "datetime?",
    
    // Staff
    assignedChef: "string?",
    completedBy: "string?",
    
    // Notes
    kitchenNotes: "string?",
    specialInstructions: "string?",
    
    // Customer Context
    guestCount: "number",
    allergies: "string[]?",
    dietaryRequirements: "string[]?",
    
    createdAt: "datetime",
    updatedAt: "datetime"
  }
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  ORDER_NUMBER: /^ORDER-\d{3,}$/,
  TABLE_NUMBER: { min: 1, max: 100 },
  PHONE_NUMBER: /^\+?[\d\s\-\(\)]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PRICE: { min: 0, max: 1000000 }, // NGN
  QUANTITY: { min: 1, max: 100 },
  STAFF_PIN: /^\d{4}$/
} as const;

// Default Values
export const DEFAULT_VALUES = {
  TAX_RATE: 0.075, // 7.5% VAT
  SERVICE_CHARGE_RATE: 0.10, // 10%
  CURRENCY: "NGN",
  TIMEZONE: "Africa/Lagos",
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  ORDER_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  PREP_TIME_DEFAULT: 25, // minutes
  TABLE_TURNOVER_TIME: 90 // minutes
} as const;