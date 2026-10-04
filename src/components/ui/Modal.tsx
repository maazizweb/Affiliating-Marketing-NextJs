"use client";

import { useRef, type ReactNode } from "react";
import { Button } from "./Button";

/** Accessible modal on the native <dialog> element (focus trap + Esc handled by the browser). */
export function Modal({
  triggerLabel,
  title,
  children,
}: {
  triggerLabel: string;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button variant="secondary" type="button" onClick={() => ref.current?.showModal()}>
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        aria-labelledby="modal-title"
        onClick={(e) => e.target === ref.current && ref.current.close()}
        className="m-auto w-full max-w-md rounded-lg p-6 backdrop:bg-black/50"
      >
        <h2 id="modal-title" className="text-lg font-semibold">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
        <Button variant="ghost" type="button" className="mt-2" onClick={() => ref.current?.close()}>
          Cancel
        </Button>
      </dialog>
    </>
  );
}
