import { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getServerStats, getRecentServerOrders } from "@/lib/actions/dashboard.actions";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Server Dashboard | AM | PM POS",
    description: "Track your orders and performance"
};

interface PageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default async function ServerDashboardPage({ params }: PageProps) {
    const user = await currentUser();
    const { userId } = await params;

    // Security: Ensure user is authenticated
    if (!user) {
        redirect("/sign-in");
    }

    // Security: Ensure user can only access their own dashboard
    if (user.id !== userId) {
        // Redirect to their own dashboard
        redirect(`/pos/dashboard/${user.id}`);
    }

    // Fetch server data
    const [statsResult, ordersResult] = await Promise.all([
        getServerStats(user.id),
        getRecentServerOrders(user.id) // Get all orders, no limit
    ]);

    if (!statsResult.success || !ordersResult.success) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Error Loading Dashboard</h1>
                    <p className="text-neutral-400">{statsResult.error || ordersResult.error}</p>
                </div>
            </div>
        );
    }

    const { stats } = statsResult;
    const { orders } = ordersResult;

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/pos"
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">
                                    {user.fullName || user.firstName || 'Server'}'s Dashboard
                                </h1>
                                <p className="text-sm text-neutral-400 mt-1">Track your performance and orders</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <DashboardStats stats={stats!} />

                    {/* Revenue Chart */}
                    <RevenueChart data={stats!.chartData} />

                    {/* All Orders Table */}
                    <OrdersTable orders={orders} />
                </div>
            </div>
        </div>
    );
}
