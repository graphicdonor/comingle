export default function CommunitiesLoading() {
  return (
    <div className="max-w-xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 rounded bg-gray-100" />
        <div className="h-9 w-24 rounded-full bg-gray-100" />
      </div>
      <div className="h-11 rounded-full bg-gray-100 mb-5" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
