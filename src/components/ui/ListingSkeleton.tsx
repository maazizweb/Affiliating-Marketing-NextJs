import { Container } from "./Container";

export function ListingSkeleton() {
  return (
    <Container className="py-8" >
      <div role="status" aria-label="Loading" className="animate-pulse">
        <div className="mb-6 h-8 w-48 rounded bg-neutral-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i}>
              <div className="aspect-square rounded-lg bg-neutral-200" />
              <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-1/3 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
