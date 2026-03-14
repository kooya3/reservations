// POS System Types for Restaurant Management

export interface MenuItem {
  $id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  calories?: number;
  variants?: ItemVariant[];
  customizations?: ItemCustomization[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemVariant {
  name: string;
  priceModifier: number; // +/- amount
  isDefault: boolean;
}

export interface ItemCustomization {
  name: string;
  options: CustomizationOption[];
  isRequired: boolean;
  maxSelections: number;
}

export interface CustomizationOption {
  name: string;
  price: number;
  isDefault: boolean;
}

export enum MenuCategory {
  APPETIZERS = "appetizers",
  SOUPS = "soups", 
  SALADS = "salads",
  MAIN_COURSE = "main_course",
  SEAFOOD = "seafood",
  GRILLED = "grilled",
  PASTA = "pasta",
  DESSERTS = "desserts",
  BEVERAGES = "beverages",
  COCKTAILS = "cocktails",
  WINE = "wine",
  BEER = "beer",
  COFFEE = "coffee"
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  variant?: ItemVariant;
  customizations: SelectedCustomization[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface SelectedCustomization {
  customization: ItemCustomization;
  selectedOptions: CustomizationOption[];
}

export enum OrderStatus {
  DRAFT = "draft",
  PLACED = "placed", 
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY = "ready",
  SERVED = "served",
  CANCELLED = "cancelled",
  REFUNDED = "refunded"
}

export enum OrderType {
  DINE_IN = "dine_in",
  TAKEAWAY = "takeaway", 
  DELIVERY = "delivery"
}

export interface Order {
  $id: string;
  orderNumber: string; // e.g., "ORDER-001"
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  
  // Customer & Table Info
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  tableNumber?: number;
  reservationId?: string; // Link to existing reservation
  
  // Pricing
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  tipAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Payment
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  paystackReference?: string;
  
  // Timing
  orderTime: Date;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  servedTime?: Date;
  
  // Staff
  waiterId?: string;
  waiterName: string;
  kitchenNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
  MOBILE_MONEY = "mobile_money",
  BANK_TRANSFER = "bank_transfer",
  PAYSTACK = "paystack",
  SPLIT = "split" // Multiple payment methods
}

export enum PaymentStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  PAID = "paid",
  REFUNDED = "refunded",
  FAILED = "failed"
}

export interface SplitPayment {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  paidBy: string; // Customer name or identifier
}

export interface Table {
  $id: string;
  number: number;
  capacity: number;
  location: TableLocation;
  status: TableStatus;
  currentOrderId?: string;
  reservationId?: string;
  waiterId?: string;
  waiterName?: string;
  lastOccupied?: Date;
  notes?: string;
}

export enum TableLocation {
  INDOOR = "indoor",
  OUTDOOR = "outdoor", 
  BAR = "bar",
  PRIVATE_DINING = "private_dining",
  TERRACE = "terrace"
}

export enum TableStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  RESERVED = "reserved",
  CLEANING = "cleaning",
  OUT_OF_ORDER = "out_of_order"
}

export interface KitchenOrder {
  $id: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: number;
  items: KitchenOrderItem[];
  status: KitchenOrderStatus;
  priority: OrderPriority;
  estimatedTime: number; // in minutes
  actualTime?: number;
  assignedChef?: string;
  notes?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface KitchenOrderItem {
  menuItem: MenuItem;
  quantity: number;
  variant?: ItemVariant;
  customizations: SelectedCustomization[];
  specialInstructions?: string;
  status: KitchenItemStatus;
}

export enum KitchenOrderStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress", 
  READY = "ready",
  SERVED = "served",
  CANCELLED = "cancelled"
}

export enum KitchenItemStatus {
  WAITING = "waiting",
  PREPARING = "preparing",
  READY = "ready",
  SERVED = "served"
}

export enum OrderPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent"
}

export interface Staff {
  $id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  isActive: boolean;
  permissions: StaffPermission[];
  shift?: StaffShift;
  tables?: number[]; // Assigned table numbers
  createdAt: Date;
}

export enum StaffRole {
  ADMIN = "admin",
  MANAGER = "manager",
  WAITER = "waiter",
  BARTENDER = "bartender", 
  CHEF = "chef",
  CASHIER = "cashier",
  HOST = "host"
}

export enum StaffPermission {
  VIEW_ORDERS = "view_orders",
  CREATE_ORDERS = "create_orders",
  MODIFY_ORDERS = "modify_orders",
  CANCEL_ORDERS = "cancel_orders",
  PROCESS_PAYMENTS = "process_payments",
  MANAGE_TABLES = "manage_tables", 
  VIEW_KITCHEN = "view_kitchen",
  MANAGE_MENU = "manage_menu",
  VIEW_ANALYTICS = "view_analytics",
  MANAGE_STAFF = "manage_staff",
  MANAGE_INVENTORY = "manage_inventory"
}

export interface StaffShift {
  startTime: string; // HH:MM format
  endTime: string;
  breakTime?: number; // in minutes
}

// POS Session for daily operations
export interface POSSession {
  $id: string;
  date: Date;
  staffId: string;
  staffName: string;
  startTime: Date;
  endTime?: Date;
  startingCash: number;
  endingCash?: number;
  totalSales: number;
  totalOrders: number;
  cashSales: number;
  cardSales: number;
  refunds: number;
  isActive: boolean;
  notes?: string;
}

// Analytics types
export interface POSAnalytics {
  // Sales metrics
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  
  // Popular items
  topSellingItems: {
    item: MenuItem;
    quantitySold: number;
    revenue: number;
  }[];
  
  // Performance metrics
  averagePreparationTime: number;
  orderAccuracy: number;
  customerSatisfaction?: number;
  
  // Staff performance
  topWaiters: {
    staff: Staff;
    ordersServed: number;
    revenue: number;
    tips: number;
  }[];
  
  // Time-based analytics
  peakHours: {
    hour: number;
    orderCount: number;
    revenue: number;
  }[];
  
  // Payment methods
  paymentBreakdown: {
    method: PaymentMethod;
    amount: number;
    percentage: number;
  }[];
}

export interface InventoryItem {
  $id: string;
  name: string;
  category: string;
  unit: string; // kg, liters, pieces, etc.
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  supplier?: string;
  lastRestocked?: Date;
  expiryDate?: Date;
  location: string; // Kitchen, Bar, Storage
  isActive: boolean;
  menuItems: string[]; // IDs of menu items that use this ingredient
}

export interface StockTransaction {
  $id: string;
  itemId: string;
  type: 'IN' | 'OUT' | 'WASTE' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  cost?: number;
  staffId: string;
  createdAt: Date;
}