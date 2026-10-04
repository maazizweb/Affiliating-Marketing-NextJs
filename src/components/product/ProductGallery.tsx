"use client";

import Image from "next/image";
import { useState } from "react";
import type { WCImage } from "@/types/woocommerce";

export function ProductGallery({ images, name }: { images: WCImage[]; name: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="flex aspect-square items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">No image</div>;
  }
  const current = images[active];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={current.src}
          alt={current.alt || name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === active}
                className={`relative block aspect-square w-full overflow-hidden rounded-md border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ${i === active ? "border-neutral-900" : "border-transparent"}`}
              >
                <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
