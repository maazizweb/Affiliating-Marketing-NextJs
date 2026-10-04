import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/account/AuthForm";
import { Container } from "@/components/ui/Container";
import { getSessionUserId } from "@/lib/auth/session";
import { first } from "@/utils/params";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = first((await searchParams).next);
  if (await getSessionUserId()) redirect("/account");
  return (
    <Container className="max-w-md py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Log in</h1>
      <LoginForm next={next} />
      <p className="mt-6 text-sm text-neutral-600">
        New here? <Link href="/register" className="underline">Create an account</Link>
      </p>
    </Container>
  );
}
