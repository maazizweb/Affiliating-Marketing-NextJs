"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-neutral-600">
        We couldn&apos;t load this page. This is usually temporary — please try again.
      </p>
      {/* Server error messages are redacted in production; the digest ties this to the server log. */}
      {error.digest && <p className="mt-1 text-xs text-neutral-400">Reference: {error.digest}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">Home</ButtonLink>
      </div>
    </Container>
  );
}
