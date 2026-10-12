export default function PriceLabelsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="animate-pulse bg-neutral-200 rounded h-8 w-48"></div>
        <div className="animate-pulse bg-neutral-200 rounded h-8 w-64"></div>
      </div>
      <div className="animate-pulse bg-neutral-200 rounded h-64"></div>
    </div>
  );
}