"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Utensils,
  Timer,
  XCircle,
  PlayCircle,
  StopCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getKitchenOrders, updateKitchenOrderStatus } from "@/lib/actions/pos-kitchen.actions";

interface KitchenDisplaySystemProps {
  staffRole: string;
  staffId: string;
}

interface KitchenOrder {
  $id: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: number;
  totalItems: number;
  estimatedTime: number;
  receivedAt: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  guestCount: number;
  specialInstructions?: string;
  allergies?: string[];
  priority: string;
  items: OrderItem[];
}

interface OrderItem {
  $id: string;
  menuItemName: string;
  quantity: number;
  specialInstructions?: string;
  status: string;
}

export const KitchenDisplaySystem: React.FC<KitchenDisplaySystemProps> = ({ 
  staffRole, 
  staffId 
}) => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("active");
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadKitchenOrders();
    
    if (autoRefresh) {
      const interval = setInterval(loadKitchenOrders, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadKitchenOrders = async () => {
    try {
      const fetchedOrders = await getKitchenOrders(filter);
      setOrders(fetchedOrders);
      console.log("✅ Kitchen orders loaded:", fetchedOrders.length);
    } catch (error) {
      console.error("Error loading kitchen orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateKitchenOrderStatus(orderId, newStatus, staffId);
      
      // Update local state optimistically
      setOrders(prev => 
        prev.map(order => 
          order.$id === orderId 
            ? { 
                ...order, 
                status: newStatus,
                ...(newStatus === "preparing" && { startedAt: new Date().toISOString() }),
                ...(newStatus === "ready" && { completedAt: new Date().toISOString() })
              }
            : order
        )
      );

      console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "preparing":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "ready":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "delayed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <Clock className="w-4 h-4" />;
      case "preparing":
        return <Timer className="w-4 h-4" />;
      case "ready":
        return <CheckCircle className="w-4 h-4" />;
      case "delayed":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-500/5";
      case "high":
        return "border-l-amber-500 bg-amber-500/5";
      case "normal":
        return "border-l-blue-500 bg-blue-500/5";
      default:
        return "border-l-slate-500 bg-slate-500/5";
    }
  };

  const getElapsedTime = (receivedAt: string, startedAt?: string) => {
    const start = startedAt ? new Date(startedAt) : new Date(receivedAt);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    return elapsed;
  };

  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case "active":
        return ["received", "preparing"].includes(order.status);
      case "ready":
        return order.status === "ready";
      case "completed":
        return order.status === "completed";
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Kitchen Display System</h2>
          <p className="text-slate-400">Active orders and preparation status</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {["active", "ready", "completed"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === filterOption
                    ? "bg-amber-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "border-green-500 text-green-400" : ""}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            Auto Refresh
          </Button>
          
          <Button
            size="sm"
            onClick={loadKitchenOrders}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-500/10 rounded-lg border border-blue-500/20 p-4 text-center">
          <p className="text-xl font-bold text-blue-400">
            {orders.filter(o => o.status === "received").length}
          </p>
          <p className="text-xs text-slate-400">New Orders</p>
        </div>
        <div className="bg-amber-500/10 rounded-lg border border-amber-500/20 p-4 text-center">
          <p className="text-xl font-bold text-amber-400">
            {orders.filter(o => o.status === "preparing").length}
          </p>
          <p className="text-xs text-slate-400">Preparing</p>
        </div>
        <div className="bg-green-500/10 rounded-lg border border-green-500/20 p-4 text-center">
          <p className="text-xl font-bold text-green-400">
            {orders.filter(o => o.status === "ready").length}
          </p>
          <p className="text-xs text-slate-400">Ready</p>
        </div>
        <div className="bg-red-500/10 rounded-lg border border-red-500/20 p-4 text-center">
          <p className="text-xl font-bold text-red-400">
            {orders.filter(o => getElapsedTime(o.receivedAt, o.startedAt) > (o.estimatedTime + 5)).length}
          </p>
          <p className="text-xs text-slate-400">Delayed</p>
        </div>
        <div className="bg-slate-500/10 rounded-lg border border-slate-500/20 p-4 text-center">
          <p className="text-xl font-bold text-slate-400">
            {orders.reduce((sum, order) => sum + order.totalItems, 0)}
          </p>
          <p className="text-xs text-slate-400">Total Items</p>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredOrders.map((order) => {
            const elapsedTime = getElapsedTime(order.receivedAt, order.startedAt);
            const isDelayed = elapsedTime > order.estimatedTime + 5;
            
            return (
              <motion.div
                key={order.$id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative bg-slate-800/50 rounded-xl border-l-4 p-6 hover:bg-slate-800/70 transition-all cursor-pointer ${getPriorityColor(order.priority)}`}
                onClick={() => setSelectedOrder(order)}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{order.orderNumber}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      {order.tableNumber && (
                        <>
                          <Users className="w-3 h-3" />
                          <span>Table {order.tableNumber}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{order.guestCount} guests</span>
                    </div>
                  </div>
                  
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                    {getStatusIcon(order.status)}
                    {order.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-slate-300">Items ({order.totalItems})</h4>
                  <div className="space-y-1">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-slate-300">{item.quantity}x {item.menuItemName}</span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="text-xs text-slate-400">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Information */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-slate-400">Elapsed:</span>
                    <span className={`ml-1 font-medium ${isDelayed ? "text-red-400" : "text-white"}`}>
                      {elapsedTime}m
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-400">Est:</span>
                    <span className="ml-1 text-white font-medium">{order.estimatedTime}m</span>
                  </div>
                </div>

                {/* Special Instructions & Allergies */}
                {(order.specialInstructions || order.allergies?.length) && (
                  <div className="mb-4 space-y-1">
                    {order.specialInstructions && (
                      <div className="text-xs bg-blue-500/10 text-blue-400 p-2 rounded">
                        <strong>Note:</strong> {order.specialInstructions}
                      </div>
                    )}
                    {order.allergies?.length > 0 && (
                      <div className="text-xs bg-red-500/10 text-red-400 p-2 rounded">
                        <strong>Allergies:</strong> {order.allergies.join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {order.status === "received" && (
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.$id, "preparing");
                      }}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Preparing
                    </Button>
                  )}
                  
                  {order.status === "preparing" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.$id, "ready");
                        }}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.$id, "delayed");
                        }}
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Issue
                      </Button>
                    </div>
                  )}
                  
                  {order.status === "ready" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-500 text-slate-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.$id, "completed");
                      }}
                    >
                      <StopCircle className="w-3 h-3 mr-1" />
                      Mark Served
                    </Button>
                  )}
                </div>

                {/* Priority Indicator */}
                {order.priority === "urgent" && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No {filter} orders</h3>
          <p className="text-slate-400">
            {filter === "active" 
              ? "All caught up! No active orders in the kitchen."
              : `No ${filter} orders to display.`
            }
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Dialog open={true} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl bg-slate-900 border border-amber-500/20">
            <DialogHeader>
              <DialogTitle className="text-amber-500">
                Order Details - {selectedOrder.orderNumber}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-slate-400">Order Number:</span>
                    <p className="text-white font-medium">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.toUpperCase()}
                    </Badge>
                  </div>
                  {selectedOrder.tableNumber && (
                    <div>
                      <span className="text-slate-400">Table:</span>
                      <p className="text-white font-medium">Table {selectedOrder.tableNumber}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Guests:</span>
                    <p className="text-white font-medium">{selectedOrder.guestCount}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Received:</span>
                    <p className="text-white font-medium">
                      {new Date(selectedOrder.receivedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Estimated Time:</span>
                    <p className="text-white font-medium">{selectedOrder.estimatedTime} minutes</p>
                  </div>
                </div>
              </div>

              {/* Full Item List */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-white font-medium">
                            {item.quantity}x {item.menuItemName}
                          </span>
                          {item.specialInstructions && (
                            <p className="text-sm text-blue-400 mt-1">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.status || "pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions & Allergies */}
              {(selectedOrder.specialInstructions || selectedOrder.allergies?.length) && (
                <div className="space-y-2">
                  {selectedOrder.specialInstructions && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <h4 className="text-blue-400 font-medium mb-1">Special Instructions</h4>
                      <p className="text-slate-300 text-sm">{selectedOrder.specialInstructions}</p>
                    </div>
                  )}
                  
                  {selectedOrder.allergies?.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <h4 className="text-red-400 font-medium mb-1">Allergies & Dietary Restrictions</h4>
                      <p className="text-slate-300 text-sm">{selectedOrder.allergies.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};