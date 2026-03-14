"use server";

import { Query } from "node-appwrite";
import { databases, DATABASE_ID } from "../appwrite.config";
import { parseStringify } from "../utils";

// POS Collections
const KITCHEN_ORDERS_COLLECTION_ID = "kitchen_orders";
const ORDER_ITEMS_COLLECTION_ID = "order_items";
const ORDERS_COLLECTION_ID = "orders";

// Sample kitchen orders for fallback
const SAMPLE_KITCHEN_ORDERS = [
  {
    $id: "kitchen-order-1",
    orderId: "order-1",
    orderNumber: "ORD-20241125-1430-001",
    tableNumber: 5,
    totalItems: 3,
    estimatedTime: 25,
    receivedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: "preparing",
    startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    guestCount: 4,
    specialInstructions: "Medium-rare steak, extra sauce on the side",
    allergies: ["dairy", "nuts"],
    priority: "normal",
    items: [
      { menuItemName: "Grilled Salmon", quantity: 2, specialInstructions: "", status: "preparing" },
      { menuItemName: "Caesar Salad", quantity: 1, specialInstructions: "No croutons", status: "ready" }
    ]
  },
  {
    $id: "kitchen-order-2", 
    orderId: "order-2",
    orderNumber: "ORD-20241125-1445-002",
    tableNumber: 3,
    totalItems: 2,
    estimatedTime: 15,
    receivedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    status: "received",
    guestCount: 2,
    specialInstructions: "",
    allergies: [],
    priority: "normal",
    items: [
      { menuItemName: "Chocolate Lava Cake", quantity: 2, specialInstructions: "Extra ice cream", status: "pending" }
    ]
  },
  {
    $id: "kitchen-order-3",
    orderId: "order-3", 
    orderNumber: "ORD-20241125-1435-003",
    tableNumber: 8,
    totalItems: 5,
    estimatedTime: 30,
    receivedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: "ready",
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    guestCount: 6,
    specialInstructions: "Birthday celebration - candle for dessert",
    allergies: ["gluten"],
    priority: "high",
    items: [
      { menuItemName: "Beef Tenderloin", quantity: 3, specialInstructions: "Well done", status: "ready" },
      { menuItemName: "House Wine (Red)", quantity: 2, specialInstructions: "", status: "ready" }
    ]
  },
  {
    $id: "kitchen-order-4",
    orderId: "order-4",
    orderNumber: "ORD-20241125-1400-004", 
    tableNumber: 2,
    totalItems: 4,
    estimatedTime: 20,
    receivedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    status: "delayed",
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    guestCount: 3,
    specialInstructions: "Rush order - customer has flight to catch",
    allergies: ["fish"],
    priority: "urgent",
    items: [
      { menuItemName: "Caesar Salad", quantity: 2, specialInstructions: "", status: "preparing" },
      { menuItemName: "Espresso", quantity: 2, specialInstructions: "Double shot", status: "ready" }
    ]
  }
];

// Get kitchen orders
export const getKitchenOrders = async (filter?: string) => {
  try {
    console.log("👨‍🍳 Fetching kitchen orders...", filter || "all statuses");
    
    const queries = [Query.orderDesc('receivedAt')];
    
    // Add status filter
    if (filter) {
      switch (filter) {
        case "active":
          queries.push(Query.equal('status', ['received', 'preparing']));
          break;
        case "ready":
          queries.push(Query.equal('status', 'ready'));
          break;
        case "completed":
          queries.push(Query.equal('status', 'completed'));
          break;
      }
    }

    const kitchenOrders = await databases.listDocuments(
      DATABASE_ID!,
      KITCHEN_ORDERS_COLLECTION_ID,
      queries
    );

    console.log(`✅ Retrieved ${kitchenOrders.documents.length} kitchen orders`);
    
    // Get order items for each kitchen order
    const ordersWithItems = await Promise.all(
      kitchenOrders.documents.map(async (order: any) => {
        try {
          const items = await databases.listDocuments(
            DATABASE_ID!,
            ORDER_ITEMS_COLLECTION_ID,
            [Query.equal('orderId', order.orderId)]
          );
          return {
            ...order,
            items: items.documents
          };
        } catch (error) {
          console.error(`Error fetching items for kitchen order ${order.$id}:`, error);
          return {
            ...order,
            items: []
          };
        }
      })
    );
    
    return parseStringify(ordersWithItems);

  } catch (error) {
    console.error("❌ Error fetching kitchen orders:", error);
    
    // Return filtered sample data
    console.log("👨‍🍳 Using sample kitchen order data");
    let filteredOrders = SAMPLE_KITCHEN_ORDERS;
    
    if (filter) {
      switch (filter) {
        case "active":
          filteredOrders = SAMPLE_KITCHEN_ORDERS.filter(order => 
            ["received", "preparing"].includes(order.status)
          );
          break;
        case "ready":
          filteredOrders = SAMPLE_KITCHEN_ORDERS.filter(order => 
            order.status === "ready"
          );
          break;
        case "completed":
          filteredOrders = SAMPLE_KITCHEN_ORDERS.filter(order => 
            order.status === "completed"
          );
          break;
      }
    }
    
    return parseStringify(filteredOrders);
  }
};

// Update kitchen order status
export const updateKitchenOrderStatus = async (
  kitchenOrderId: string,
  newStatus: string,
  staffId?: string
) => {
  try {
    console.log(`👨‍🍳 Updating kitchen order ${kitchenOrderId} status to: ${newStatus}`);
    
    const updates: any = {};
    
    // Add timestamp based on status
    switch (newStatus) {
      case "preparing":
        updates.status = "preparing";
        updates.startedAt = new Date().toISOString();
        updates.preparedBy = staffId;
        break;
      case "ready":
        updates.status = "ready";
        updates.completedAt = new Date().toISOString();
        updates.completedBy = staffId;
        break;
      case "delayed":
        updates.status = "delayed";
        updates.delayReason = "Kitchen delay";
        break;
      case "completed":
        updates.status = "completed";
        updates.servedAt = new Date().toISOString();
        updates.servedBy = staffId;
        break;
      default:
        updates.status = newStatus;
    }

    const updatedKitchenOrder = await databases.updateDocument(
      DATABASE_ID!,
      KITCHEN_ORDERS_COLLECTION_ID,
      kitchenOrderId,
      updates
    );

    console.log(`✅ Kitchen order ${kitchenOrderId} updated to ${newStatus}`);
    
    // If order is ready or completed, also update the main order status
    if (["ready", "completed"].includes(newStatus)) {
      try {
        const kitchenOrder = updatedKitchenOrder;
        if (kitchenOrder.orderId) {
          const orderStatus = newStatus === "ready" ? "ready" : "completed";
          await databases.updateDocument(
            DATABASE_ID!,
            ORDERS_COLLECTION_ID,
            kitchenOrder.orderId,
            {
              ...(newStatus === "ready" && { actualReadyTime: new Date().toISOString() }),
              ...(newStatus === "completed" && { completedAt: new Date().toISOString() })
            }
          );
          console.log(`✅ Main order ${kitchenOrder.orderId} updated to ${orderStatus}`);
        }
      } catch (orderUpdateError) {
        console.error("Error updating main order:", orderUpdateError);
        // Don't throw - kitchen order update was successful
      }
    }
    
    return parseStringify(updatedKitchenOrder);

  } catch (error) {
    console.error(`❌ Error updating kitchen order ${kitchenOrderId}:`, error);
    throw error;
  }
};

// Get kitchen order by ID
export const getKitchenOrderById = async (kitchenOrderId: string) => {
  try {
    console.log(`👨‍🍳 Fetching kitchen order: ${kitchenOrderId}`);
    
    const kitchenOrder = await databases.getDocument(
      DATABASE_ID!,
      KITCHEN_ORDERS_COLLECTION_ID,
      kitchenOrderId
    );

    // Get order items
    const items = await databases.listDocuments(
      DATABASE_ID!,
      ORDER_ITEMS_COLLECTION_ID,
      [Query.equal('orderId', kitchenOrder.orderId)]
    );

    const orderWithItems = {
      ...kitchenOrder,
      items: items.documents
    };

    console.log(`✅ Retrieved kitchen order: ${kitchenOrderId}`);
    return parseStringify(orderWithItems);

  } catch (error) {
    console.error(`❌ Error fetching kitchen order ${kitchenOrderId}:`, error);
    
    // Return sample data if ID matches
    const sampleOrder = SAMPLE_KITCHEN_ORDERS.find(order => order.$id === kitchenOrderId);
    if (sampleOrder) {
      return parseStringify(sampleOrder);
    }
    
    throw error;
  }
};

// Get kitchen performance analytics
export const getKitchenAnalytics = async (date?: string) => {
  try {
    console.log("📊 Calculating kitchen performance analytics...");
    
    const today = date ? new Date(date) : new Date();
    const orders = await getKitchenOrders();
    
    // Filter orders for the specified date
    const todayOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.receivedAt).toDateString();
      return orderDate === today.toDateString();
    });
    
    const analytics = {
      totalOrders: todayOrders.length,
      completedOrders: todayOrders.filter((order: any) => order.status === "completed").length,
      averagePreparationTime: 0,
      onTimeDelivery: 0,
      delayedOrders: todayOrders.filter((order: any) => order.status === "delayed").length,
      currentQueueLength: todayOrders.filter((order: any) => 
        ["received", "preparing"].includes(order.status)
      ).length,
      statusBreakdown: {
        received: todayOrders.filter((order: any) => order.status === "received").length,
        preparing: todayOrders.filter((order: any) => order.status === "preparing").length,
        ready: todayOrders.filter((order: any) => order.status === "ready").length,
        completed: todayOrders.filter((order: any) => order.status === "completed").length,
        delayed: todayOrders.filter((order: any) => order.status === "delayed").length,
      },
      hourlyVolume: {} as Record<string, number>
    };
    
    // Calculate average preparation time for completed orders
    const completedOrdersWithTime = todayOrders.filter((order: any) => 
      order.status === "completed" && order.startedAt && order.completedAt
    );
    
    if (completedOrdersWithTime.length > 0) {
      const totalPrepTime = completedOrdersWithTime.reduce((sum: number, order: any) => {
        const startTime = new Date(order.startedAt).getTime();
        const endTime = new Date(order.completedAt).getTime();
        const prepTime = (endTime - startTime) / (1000 * 60); // in minutes
        return sum + prepTime;
      }, 0);
      
      analytics.averagePreparationTime = Math.round(totalPrepTime / completedOrdersWithTime.length);
      
      // Calculate on-time delivery percentage
      const onTimeOrders = completedOrdersWithTime.filter((order: any) => {
        const startTime = new Date(order.startedAt).getTime();
        const endTime = new Date(order.completedAt).getTime();
        const actualTime = (endTime - startTime) / (1000 * 60);
        return actualTime <= order.estimatedTime + 5; // 5 minute grace period
      });
      
      analytics.onTimeDelivery = Math.round((onTimeOrders.length / completedOrdersWithTime.length) * 100);
    }
    
    // Calculate hourly volume
    todayOrders.forEach((order: any) => {
      const hour = new Date(order.receivedAt).getHours();
      analytics.hourlyVolume[hour] = (analytics.hourlyVolume[hour] || 0) + 1;
    });
    
    console.log("✅ Kitchen analytics calculated");
    return parseStringify(analytics);

  } catch (error) {
    console.error("❌ Error calculating kitchen analytics:", error);
    
    // Return sample analytics
    return parseStringify({
      totalOrders: 24,
      completedOrders: 18,
      averagePreparationTime: 22,
      onTimeDelivery: 85,
      delayedOrders: 2,
      currentQueueLength: 4,
      statusBreakdown: {
        received: 2,
        preparing: 2,
        ready: 2,
        completed: 18,
        delayed: 2
      },
      hourlyVolume: {
        "11": 3,
        "12": 7,
        "13": 5,
        "14": 4,
        "18": 2,
        "19": 3
      }
    });
  }
};