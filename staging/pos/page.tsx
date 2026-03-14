import { Suspense } from "react";
import { POSDashboard } from "@/components/pos/POSDashboard";

function LoadingPOS() {
  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-white text-lg font-medium mb-2">Loading POS System</h2>
        <p className="text-slate-400">Initializing restaurant management tools...</p>
      </div>
    </div>
  );
}

export default function POSPage() {
  return (
    <Suspense fallback={<LoadingPOS />}>
      <POSDashboard />
    </Suspense>
  );
}