export default function ChatListLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-2.5">
        <div className="h-4 w-16 bg-gray-100 rounded" />
        <div className="h-4 w-12 bg-gray-100 rounded" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
