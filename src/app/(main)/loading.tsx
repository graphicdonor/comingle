export default function HomeLoading() {
  return (
    <div className="max-w-xl mx-auto animate-pulse">
      <div className="h-32 rounded-3xl bg-gray-100 mb-5" />
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
