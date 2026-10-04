export function SearchForm({ className = "" }: { className?: string }) {
  return (
    <form action="/search" role="search" className={className}>
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        required
        placeholder="Search products…"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-neutral-900"
      />
    </form>
  );
}
