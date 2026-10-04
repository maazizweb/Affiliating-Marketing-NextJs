import type { InputHTMLAttributes } from "react";

export const inputClass =
  "block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-neutral-900";

export function Input({
  label,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <input id={id} {...props} className={inputClass} />
    </div>
  );
}
