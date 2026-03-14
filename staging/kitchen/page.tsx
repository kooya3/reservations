"use client";

import { useState, useEffect } from "react";
import { KitchenDashboard } from "@/components/pos/KitchenDashboard";

export default function KitchenPage() {
  const [staffInfo, setStaffInfo] = useState({
    id: "staff-kitchen-001",
    name: "Kitchen Manager",
    role: "kitchen_manager"
  });

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <KitchenDashboard 
          staffRole={staffInfo.role}
          staffId={staffInfo.id}
          staffName={staffInfo.name}
        />
      </div>
    </div>
  );
}