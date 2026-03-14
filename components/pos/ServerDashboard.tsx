"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CalendarDays, ShoppingBag, CreditCard } from "lucide-react";
import { getRecentOrders } from "@/lib/actions/pos.actions";
import { Order } from "@/types/pos.types";

export function ServerDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const data = await getRecentOrders();
            setOrders(data || []);
            setIsLoading(false);
        };

        fetchOrders();
    }, []);

    // Simple aggregate stats from the fetched orders (limited to recent 10 for now)
    const totalOrders = orders.length;
    const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    return (
        <div className="p-4 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-neutral-400">Recent orders</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
                        <p className="text-xs text-neutral-400">Total revenue (Recent)</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shift Start</CardTitle>
                        <CalendarDays className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14:00</div>
                        <p className="text-xs text-neutral-400">4h 30m on shift</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                {isLoading ? (
                    <div className="text-neutral-400 text-sm">Loading transactions...</div>
                ) : orders.length === 0 ? (
                    <div className="text-neutral-400 text-sm">No recent transactions</div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.$id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                <div>
                                    <p className="text-white font-medium">Order #{order.orderNumber || order.$id?.substring(0, 8)}</p>
                                    <p className="text-xs text-neutral-400">{new Date(order.$createdAt!).toLocaleTimeString()} - {order.status}</p>
                                </div>
                                <div className="text-emerald-400 font-bold">
                                    {formatCurrency(order.totalAmount)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
