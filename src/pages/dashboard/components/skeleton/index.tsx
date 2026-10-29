export const SkeletonKpi = () => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse">
      <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
      <div className="h-8 w-32 bg-neutral-200 rounded" />
    </div>
  );
};

export const SkeletonChart = () => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
      <div className="h-4 w-40 bg-neutral-200 rounded mb-3" />
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="w-full bg-neutral-200 rounded-t" style={{ height: '50%' }} />
            <div className="h-3 w-8 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonTable = () => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
      <div className="h-4 w-40 bg-neutral-200 rounded mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-32 bg-neutral-200 rounded" />
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="h-4 w-20 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="p-6">
      <div className="mt-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="date"
            className="px-3 py-2 border border-neutral-300 rounded-lg w-40 bg-neutral-100"
            disabled
          />
          <span className="self-center text-neutral-400">–</span>
          <input
            type="date"
            className="px-3 py-2 border border-neutral-300 rounded-lg w-40 bg-neutral-100"
            disabled
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonKpi key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6">
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <SkeletonTable />
          </div>
          <div className="flex flex-col gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse">
      <div className="h-4 w-32 bg-neutral-200 rounded mb-3" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-4 w-20 bg-neutral-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-4 w-20 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
};
