export default function CommunityDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-32 rounded-3xl bg-gray-100 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
