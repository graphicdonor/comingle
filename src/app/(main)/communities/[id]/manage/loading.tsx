export default function ManageCommunityLoading() {
  return (
    <div className="max-w-xl mx-auto animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-gray-100 mb-5" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
