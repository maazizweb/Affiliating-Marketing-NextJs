import { ButtonLink } from "./Button";

/** URL-driven pagination: no client state. `href(page)` builds the target URL. */
export function Pagination({
  page,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between">
      {page > 1 ? (
        <ButtonLink variant="secondary" href={href(page - 1)} rel="prev">
          Previous
        </ButtonLink>
      ) : (
        <span />
      )}
      <span className="text-sm text-neutral-600">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <ButtonLink variant="secondary" href={href(page + 1)} rel="next">
          Next
        </ButtonLink>
      ) : (
        <span />
      )}
    </nav>
  );
}
