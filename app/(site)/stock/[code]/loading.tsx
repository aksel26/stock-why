import { CardSkeleton, Skeleton, TextSkeleton } from "@/components/common/Skeleton";

export default function StockLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <Skeleton className="h-4 w-20 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <Skeleton className="h-7 w-36 mb-1" />
            <Skeleton className="h-4 w-16 mb-4" />
            <Skeleton className="h-9 w-44 mb-2" />
            <Skeleton className="h-5 w-20" />
          </div>
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <Skeleton className="h-5 w-24 mb-4" />
            <div className="bg-[#caff33]/10 rounded-xl p-4 mb-3">
              <TextSkeleton lines={2} />
            </div>
            <TextSkeleton lines={4} />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <Skeleton className="h-5 w-28 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
