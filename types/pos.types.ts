export interface Product {
  $id: string;
  name: string;
  description: string;
  price: number;
  category: Category | string; // Can be expanded object or just ID
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number;
  ingredients?: string[];
  allergens?: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  calories?: number;
  popularity: number;
}

export interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

export interface Order {
    $id: string;
    orderNumber: string;
    type: string;
    status: string;
    tableNumber?: number;
    customerName: string;
    guestCount: number;
    waiterName: string; // Added for server tracking
    waiterId?: string; // Clerk user ID for dashboard filtering
    subtotal: number;
    taxAmount: number;
    serviceCharge: number;
    discountAmount: number;
    tipAmount: number;
    totalAmount: number;
    paymentStatus: string;
    orderTime: string; // Added for timestamp
    priority: string;
    items: CartItem[];
    specialInstructions?: string;
    // Optional settlement/payment metadata for advanced POS flows
    settlementType?: string; // e.g. 'table_tab_master' | 'table_tab_child'
    settlementParentOrderId?: string;
    settledOrderIds?: string[];
    paymentMethods?: any[];
    $createdAt: string;
    $updatedAt: string;
}

export interface Category {
  $id: string;
  name: string; // e.g., 'appetizers', 'mains', 'drinks'
  label: string; // Display name
  slug: string;
  icon?: string;
  index: number;
  parentId?: string;
  isActive: boolean;
}

