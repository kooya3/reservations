"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

interface ChartData {
    date: string;
    revenue: number;
}

interface RevenueChartProps {
    data: ChartData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    const maxRevenue = useMemo(() => {
        return Math.max(...data.map(d => d.revenue), 1);
    }, [data]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                        Revenue Trend
                    </h3>
                    <p className="text-sm text-neutral-400 mt-1">Last 7 days performance</p>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                    No revenue data available
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Chart */}
                    <div className="flex items-end gap-2 h-48">
                        {data.map((item, index) => {
                            const heightPercent = (item.revenue / maxRevenue) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center justify-end h-full">
                                        <div
                                            className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-emerald-400 hover:to-emerald-300 cursor-pointer relative group"
                                            style={{ height: `${heightPercent}%`, minHeight: item.revenue > 0 ? '8px' : '0' }}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <div className="bg-neutral-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-white/10">
                                                    <div className="font-bold">{formatCurrency(item.revenue)}</div>
                                                    <div className="text-neutral-400">{formatDate(item.date)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-neutral-500 mt-2">
                                        {formatDate(item.date).split(' ')[1]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div>
                            <p className="text-xs text-neutral-500">Total Revenue</p>
                            <p className="text-lg font-bold text-white">
                                {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-neutral-500">Daily Average</p>
                            <p className="text-lg font-bold text-emerald-400">
                                {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0) / data.length)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
