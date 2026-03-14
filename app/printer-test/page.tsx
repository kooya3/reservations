"use client";

import { useState } from "react";
import { PrinterSetup } from "@/components/pos/PrinterSetup";

export default function PrinterTestPage() {
    const [testOrderId, setTestOrderId] = useState("TEST-ORDER-001");
    const [printHistory, setPrintHistory] = useState<string[]>([]);

    const handlePrintSuccess = () => {
        const timestamp = new Date().toLocaleString();
        setPrintHistory(prev => [`${timestamp}: Print successful for ${testOrderId}`, ...prev]);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 space-y-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Thermal Printer Setup & Test</h1>
                <p>Note: this line contains a bullet • character.</p>
                <PrinterSetup orderId={testOrderId} onPrintSuccess={handlePrintSuccess} />
            </div>
        </div>
    );
}
