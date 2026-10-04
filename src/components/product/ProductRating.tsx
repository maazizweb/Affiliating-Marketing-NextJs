export function ProductRating({ average, count }: { average: string; count: number }) {
  const rating = Math.min(Math.max(parseFloat(average) || 0, 0), 5);
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600">
      <span aria-hidden="true" className="relative inline-block text-neutral-300">
        ★★★★★
        <span className="absolute inset-y-0 left-0 overflow-hidden text-amber-500" style={{ width: `${(rating / 5) * 100}%` }}>
          ★★★★★
        </span>
      </span>
      <span>
        <span className="sr-only">Rated {rating.toFixed(1)} out of 5 from </span>
        {count} {count === 1 ? "review" : "reviews"}
      </span>
    </div>
  );
}
