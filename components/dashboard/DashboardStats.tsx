"use client";

import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, TrendingUpIcon, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Stats {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    todayOrders: number;
    todayRevenue: number;
    chartData: Array<{ date: string; revenue: number }>;
}

interface DashboardStatsProps {
    stats: Stats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const { totalOrders, totalRevenue, averageOrderValue, todayOrders, todayRevenue } = stats;

    const statCards = [
        {
            title: "Total Orders",
            value: totalOrders.toString(),
            subtitle: `${todayOrders} today`,
            icon: ShoppingBag,
            color: "emerald",
            trend: todayOrders > 0 ? "up" : "neutral"
        },
        {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            subtitle: `${formatCurrency(todayRevenue)} today`,
            icon: DollarSign,
            color: "blue",
            trend: todayRevenue > 0 ? "up" : "neutral"
        },
        {
            title: "Avg Order Value",
            value: formatCurrency(averageOrderValue),
            subtitle: "Per transaction",
            icon: TrendingUpIcon,
            color: "purple",
            trend: "neutral"
        },
        {
            title: "Performance",
            value: "4.8",
            subtitle: "Customer rating",
            icon: Star,
            color: "amber",
            trend: "up"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
                const Icon = card.icon;
                const colorClasses = {
                    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20"
                };

                return (
                    <div
                        key={index}
                        className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover-lift"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg border ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            {card.trend === "up" && (
                                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="font-medium">+12%</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400 mb-1">{card.title}</p>
                            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                            <p className="text-xs text-neutral-500">{card.subtitle}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
