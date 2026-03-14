"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  X, 
  Search,
  User,
  MapPin,
  Clock,
  Utensils,
  CreditCard,
  Receipt,
  AlertCircle,
  Check,
  Leaf,
  Wheat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MenuItem, MenuCategory, OrderItem, OrderType, OrderStatus } from "@/types/pos.types";
import { getPOSMenuByCategory } from "@/lib/actions/pos-menu.actions";
import { createPOSOrder } from "@/lib/actions/pos-order.actions";
import { PaymentInterface } from "./PaymentInterface";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface POSOrderInterfaceProps {
  tableNumber?: number;
  orderType: OrderType;
  staffName: string;
}

export const POSOrderInterface: React.FC<POSOrderInterfaceProps> = ({
  tableNumber,
  orderType,
  staffName
}) => {
  const [menuByCategory, setMenuByCategory] = useState<Record<MenuCategory, MenuItem[]>>({} as any);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>(MenuCategory.APPETIZERS);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [currentOrderForPayment, setCurrentOrderForPayment] = useState<any | null>(null);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const menu = await getPOSMenuByCategory();
      setMenuByCategory(menu);
      
      // Set first available category with items
      const firstCategory = Object.keys(menu).find(cat => 
        menu[cat as MenuCategory].length > 0
      ) as MenuCategory;
      if (firstCategory) {
        setSelectedCategory(firstCategory);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (menuItem: MenuItem, variant?: any, customizations?: any) => {
    const existingItemIndex = currentOrder.findIndex(item => 
      item.menuItem.$id === menuItem.$id &&
      JSON.stringify(item.variant) === JSON.stringify(variant) &&
      JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    if (existingItemIndex > -1) {
      // Increase quantity
      setCurrentOrder(prev => 
        prev.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + 1, totalPrice: item.unitPrice * (item.quantity + 1) }
            : item
        )
      );
    } else {
      // Add new item
      const unitPrice = menuItem.price + (variant?.priceModifier || 0);
      const newItem: OrderItem = {
        menuItem,
        quantity: 1,
        variant,
        customizations: customizations || [],
        unitPrice,
        totalPrice: unitPrice
      };
      setCurrentOrder(prev => [...prev, newItem]);
    }
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(index);
      return;
    }

    setCurrentOrder(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: newQuantity, totalPrice: item.unitPrice * newQuantity }
          : item
      )
    );
  };

  const removeFromOrder = (index: number) => {
    setCurrentOrder(prev => prev.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return currentOrder.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.075; // 7.5% VAT
  };

  const calculateServiceCharge = (subtotal: number) => {
    return subtotal * 0.10; // 10% service charge
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const serviceCharge = calculateServiceCharge(subtotal);
    return subtotal + tax + serviceCharge;
  };

  const handleSendToKitchen = async () => {
    if (currentOrder.length === 0) return;
    
    if (!customerInfo.name.trim()) {
      alert("Please enter customer name");
      return;
    }

    try {
      console.log("🍽️ Sending order to kitchen...");
      
      const orderData = {
        type: orderType,
        ...(tableNumber && { tableNumber }),
        customerName: customerInfo.name,
        ...(customerInfo.phone && { customerPhone: customerInfo.phone }),
        ...(customerInfo.email && { customerEmail: customerInfo.email }),
        guestCount: tableNumber ? currentOrder.reduce((sum, item) => sum + item.quantity, 0) : 1,
        waiterId: "staff-001", // Would come from authenticated user
        waiterName: staffName,
        items: currentOrder
      };

      const createdOrder = await createPOSOrder(orderData);
      
      if (createdOrder) {
        console.log("✅ Order created successfully:", createdOrder.orderNumber);
        
        // Clear the order
        setCurrentOrder([]);
        setCustomerInfo({ name: "", phone: "", email: "" });
        
        alert(`Order ${createdOrder.orderNumber} sent to kitchen successfully!`);
      }
      
    } catch (error) {
      console.error("❌ Error creating order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  const handleProcessPayment = () => {
    if (currentOrder.length === 0) {
      alert("No items in order to process payment");
      return;
    }
    
    if (!customerInfo.name.trim()) {
      alert("Please enter customer name before processing payment");
      return;
    }

    // Create order object for payment
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTax(subtotal);
    const serviceCharge = calculateServiceCharge(subtotal);
    const totalAmount = calculateTotal();

    const orderForPayment = {
      $id: `temp-${Date.now()}`, // Temporary ID for payment processing
      orderNumber: `TEMP-${Date.now()}`,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      tableNumber,
      subtotal,
      taxAmount,
      serviceCharge,
      totalAmount,
      items: currentOrder
    };

    setCurrentOrderForPayment(orderForPayment);
    setShowPayment(true);
  };

  const handlePaymentComplete = (payment: any) => {
    console.log("✅ Payment completed:", payment);
    
    // Clear the order
    setCurrentOrder([]);
    setCustomerInfo({ name: "", phone: "", email: "" });
    setShowPayment(false);
    setCurrentOrderForPayment(null);
    
    alert(`Payment processed successfully! Reference: ${payment.reference}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const getCategoryDisplayName = (category: MenuCategory) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryIcon = (category: MenuCategory) => {
    const icons = {
      [MenuCategory.APPETIZERS]: "🥗",
      [MenuCategory.SOUPS]: "🍲", 
      [MenuCategory.SALADS]: "🥬",
      [MenuCategory.MAIN_COURSE]: "🍽️",
      [MenuCategory.SEAFOOD]: "🐟",
      [MenuCategory.GRILLED]: "🔥",
      [MenuCategory.PASTA]: "🍝",
      [MenuCategory.DESSERTS]: "🍰",
      [MenuCategory.BEVERAGES]: "🥤",
      [MenuCategory.COCKTAILS]: "🍹",
      [MenuCategory.WINE]: "🍷",
      [MenuCategory.BEER]: "🍺",
      [MenuCategory.COFFEE]: "☕"
    };
    return icons[category] || "🍽️";
  };

  const filteredItems = searchQuery
    ? Object.values(menuByCategory).flat().filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuByCategory[selectedCategory] || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading POS system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-900">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Point of Sale</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Staff: {staffName}</span>
                {tableNumber && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Table {tableNumber}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/20 text-green-400">
                {orderType.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button
                variant="ghost"
                onClick={() => setShowCart(!showCart)}
                className="text-amber-400 hover:text-amber-300 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {currentOrder.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-black text-xs rounded-full flex items-center justify-center">
                    {currentOrder.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              {Object.entries(menuByCategory).map(([category, items]) => {
                if (items.length === 0) return null;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category as MenuCategory)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span>{getCategoryIcon(category as MenuCategory)}</span>
                    <span className="font-medium">
                      {getCategoryDisplayName(category as MenuCategory)}
                    </span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {items.length}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.$id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-amber-500/50 transition-colors cursor-pointer ${
                    !item.isAvailable ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  onClick={() => item.isAvailable && addToOrder(item)}
                >
                  {/* Item Image Placeholder */}
                  <div className="w-full h-24 bg-slate-700 rounded-lg mb-3 flex items-center justify-center">
                    <Utensils className="w-8 h-8 text-slate-500" />
                  </div>

                  {/* Item Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-white text-sm line-clamp-1">
                        {item.name}
                      </h3>
                      {!item.isAvailable && (
                        <Badge variant="destructive" className="text-xs ml-2">
                          Out
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-slate-400 text-xs line-clamp-2">
                      {item.description}
                    </p>

                    {/* Dietary Badges */}
                    <div className="flex items-center gap-1">
                      {item.isVegetarian && (
                        <Leaf className="w-3 h-3 text-green-400" />
                      )}
                      {item.isGlutenFree && (
                        <Wheat className="w-3 h-3 text-blue-400" />
                      )}
                    </div>

                    {/* Price and Time */}
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold">
                        {formatPrice(item.price)}
                      </span>
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{item.preparationTime}m</span>
                      </div>
                    </div>

                    {/* Add Button */}
                    <Button
                      size="sm"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-black"
                      disabled={!item.isAvailable}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No items found</h3>
              <p className="text-slate-400">
                {searchQuery ? 'Try a different search term' : 'No items in this category'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Order Cart */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col"
          >
            {/* Cart Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Current Order</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCart(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Customer Info */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Customer name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {currentOrder.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">No items in order</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentOrder.map((orderItem, index) => (
                    <div key={index} className="bg-slate-900 border border-slate-600 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">
                            {orderItem.menuItem.name}
                          </h4>
                          {orderItem.variant && (
                            <p className="text-slate-400 text-xs">
                              {orderItem.variant.name}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromOrder(index)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateItemQuantity(index, orderItem.quantity - 1)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-white text-sm min-w-[20px] text-center">
                            {orderItem.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateItemQuantity(index, orderItem.quantity + 1)}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="text-amber-400 font-medium text-sm">
                          {formatPrice(orderItem.totalPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary & Actions */}
            {currentOrder.length > 0 && (
              <div className="border-t border-slate-700 p-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="text-white">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tax (7.5%):</span>
                    <span className="text-white">{formatPrice(calculateTax(calculateSubtotal()))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Service (10%):</span>
                    <span className="text-white">{formatPrice(calculateServiceCharge(calculateSubtotal()))}</span>
                  </div>
                  <div className="border-t border-slate-600 pt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-bold">Total:</span>
                      <span className="text-amber-400 font-bold text-lg">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleSendToKitchen}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={currentOrder.length === 0 || !customerInfo.name.trim()}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Send to Kitchen
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black"
                    disabled={currentOrder.length === 0}
                    onClick={handleProcessPayment}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process Payment
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Dialog */}
      {showPayment && currentOrderForPayment && (
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="max-w-6xl bg-slate-900 border border-amber-500/20">
            <DialogHeader>
              <DialogTitle className="text-amber-500">
                Process Payment - {currentOrderForPayment.orderNumber}
              </DialogTitle>
            </DialogHeader>
            <PaymentInterface
              order={currentOrderForPayment}
              onPaymentComplete={handlePaymentComplete}
              onClose={() => setShowPayment(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};