export default function ProfileLoading() {
  return (
    <div className="max-w-xl mx-auto animate-pulse">
      <div className="rounded-3xl overflow-hidden mb-5">
        <div className="h-28 bg-gray-100" />
        <div className="px-5 pb-5">
          <div className="-mt-10 mb-4 h-20 w-20 rounded-full bg-gray-200 ring-4 ring-white" />
          <div className="h-5 w-40 rounded bg-gray-100 mb-2" />
          <div className="h-4 w-24 rounded bg-gray-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
