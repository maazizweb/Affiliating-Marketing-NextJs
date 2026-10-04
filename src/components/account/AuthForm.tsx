"use client";

import { useActionState } from "react";
import { login, register } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ActionState } from "@/types/storefront";

function FormShell({
  action,
  submitLabel,
  children,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {children}
      <div aria-live="polite">{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}</div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait…" : submitLabel}
      </Button>
    </form>
  );
}

export function LoginForm({ next }: { next?: string }) {
  return (
    <FormShell action={login} submitLabel="Log in">
      <input type="hidden" name="next" value={next ?? ""} />
      <Input id="username" name="username" label="Email or username" required autoComplete="username" />
      <Input id="password" name="password" type="password" label="Password" required autoComplete="current-password" />
    </FormShell>
  );
}

export function RegisterForm() {
  return (
    <FormShell action={register} submitLabel="Create account">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="first_name" name="first_name" label="First name" required autoComplete="given-name" />
        <Input id="last_name" name="last_name" label="Last name" required autoComplete="family-name" />
      </div>
      <Input id="email" name="email" type="email" label="Email" required autoComplete="email" />
      <Input id="password" name="password" type="password" label="Password (min. 8 characters)" required minLength={8} autoComplete="new-password" />
    </FormShell>
  );
}
