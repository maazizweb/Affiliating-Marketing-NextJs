import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound({ title = "Page not found", message = "The page you're looking for doesn't exist or has moved." }) {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-medium text-neutral-500">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-neutral-600">{message}</p>
      <ButtonLink href="/shop" className="mt-6">Browse the shop</ButtonLink>
    </Container>
  );
}
