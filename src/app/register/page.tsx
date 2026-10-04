import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/account/AuthForm";
import { Container } from "@/components/ui/Container";
import { getSessionUserId } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage() {
  if (await getSessionUserId()) redirect("/account");
  return (
    <Container className="max-w-md py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Create account</h1>
      <RegisterForm />
      <p className="mt-6 text-sm text-neutral-600">
        Already registered? <Link href="/login" className="underline">Log in</Link>
      </p>
    </Container>
  );
}
