import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, ORDERS_COLLECTION_ID } from '@/lib/appwrite.config';
import { Query } from 'appwrite';
import { parseStringify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentStatus = searchParams.get('paymentStatus') || 'paid';
    
    if (!DATABASE_ID || !ORDERS_COLLECTION_ID) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    const queries: any[] = [
      // Filter by payment status - only include paid orders
      Query.equal('paymentStatus', 'paid'),
    ];
    
    // Filter by date range
    if (startDate && endDate) {
      // Use start of startDate and end of endDate for proper range filtering
      const startDateTime = new Date(startDate).toISOString();
      const endDateTime = new Date(endDate + 'T23:59:59.999').toISOString();
      
      queries.push(Query.greaterThanEqual('$createdAt', startDateTime));
      queries.push(Query.lessThanEqual('$createdAt', endDateTime));
    }
    
    queries.push(Query.orderDesc('$createdAt'));
    queries.push(Query.limit(500));

    console.log('[Sales API] Queries:', queries);

    const result = await databases.listDocuments(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      queries
    );

    const orders = parseStringify(result.documents);
    console.log('[Sales API] Found orders:', orders.length);
    if (orders.length > 0) {
      console.log('[Sales API] First order keys:', Object.keys(orders[0]));
    }
    
    // Calculate summary - handle multiple field name variants and legacy orders
    const totalSales = orders.reduce((sum: number, order: any) => {
      return sum + (order.total || order.totalAmount || order.grandTotal || 0);
    }, 0);
    
    // Calculate VAT with reverse-calculation for legacy orders
    const totalVat = orders.reduce((sum: number, order: any) => {
      const taxAmount = order.vatAmount || order.taxAmount || 0;
      if (taxAmount > 0) {
        // New orders with proper taxAmount
        return sum + taxAmount;
      }
      // Legacy orders: reverse-calculate from totalAmount
      const totalAmount = order.totalAmount || order.total || order.grandTotal || 0;
      if (totalAmount > 0) {
        const subtotal = totalAmount / 1.16;
        return sum + (subtotal * 0.16);
      }
      return sum;
    }, 0);
    const orderCount = orders.length;
    
    return NextResponse.json({
      orders,
      summary: {
        totalSales,
        totalVat,
        orderCount,
        averageOrderValue: orderCount > 0 ? totalSales / orderCount : 0
      }
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    return NextResponse.json({ error: 'Failed to fetch sales report' }, { status: 500 });
  }
}
