export default function MatrimonialBrowseLoading() {
  return (
    <div className="grid grid-cols-2 gap-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 rounded-2xl bg-gray-100" />
      ))}
    </div>
  );
}
