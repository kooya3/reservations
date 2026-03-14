"use client";

import { useEffect, useState, useCallback } from 'react';
import { client } from '@/lib/appwrite-client';

// Get collection IDs from environment
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const ORDERS_COLLECTION_ID = process.env.NEXT_PUBLIC_ORDERS_COLLECTION_ID!;

interface UseRealtimeOrdersOptions {
  onNewOrder?: (order: any) => void;
  onOrderUpdate?: (order: any) => void;
  onOrderDelete?: (orderId: string) => void;
}

export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { onNewOrder, onOrderUpdate, onOrderDelete } = options;

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        console.log('🔌 Connecting to real-time orders...');
        
        unsubscribe = client.subscribe(
          `databases.${DATABASE_ID}.collections.${ORDERS_COLLECTION_ID}.documents`,
          (response) => {
            setIsConnected(true);
            setLastUpdate(new Date());
            setError(null);

            console.log('📡 Real-time event received:', response.events);

            // Handle create events
            if (response.events.includes('databases.*.collections.*.documents.*.create')) {
              console.log('✨ New order created:', response.payload);
              onNewOrder?.(response.payload);
            }

            // Handle update events
            if (response.events.includes('databases.*.collections.*.documents.*.update')) {
              console.log('🔄 Order updated:', response.payload);
              onOrderUpdate?.(response.payload);
            }

            // Handle delete events
            if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
              console.log('🗑️ Order deleted:', response.payload.$id);
              onOrderDelete?.(response.payload.$id);
            }
          }
        );

        console.log('✅ Real-time connection established');
      } catch (err) {
        console.error('❌ Real-time connection error:', err);
        setIsConnected(false);
        setError(err instanceof Error ? err.message : 'Connection failed');

        // Attempt reconnection after 5 seconds
        reconnectTimeout = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 5000);
      }
    };

    connect();

    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('🔌 Real-time connection closed');
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      setIsConnected(false);
    };
  }, [onNewOrder, onOrderUpdate, onOrderDelete]);

  return {
    isConnected,
    lastUpdate,
    error
  };
}
