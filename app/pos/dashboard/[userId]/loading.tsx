export default function Loading() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Loading Dashboard...</h2>
                    <p className="text-sm text-neutral-400 mt-2">Fetching your performance data</p>
                </div>
            </div>
        </div>
    );
}
