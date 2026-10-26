'use client';

import React, { useState } from 'react';
import { ProductPhoto } from './Photo';

export default function ProductGallery({
  product,
}: {
  product: { name: string; image_urls: string[]; is_demo?: boolean };
}) {
  const [index, setIndex] = useState(0);

  return (
    <div className="space-y-2">
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <ProductPhoto
          product={product}
          index={Math.min(index, Math.max(0, product.image_urls.length - 1))}
          contain
          sizes="(max-width: 768px) 90vw, 360px"
        />
      </div>

      {product.image_urls.length > 1 && (
        <div
          role="tablist"
          className="flex gap-2.5 p-3 overflow-x-auto scrollbar-none"
          aria-label="Product image thumbnails"
        >
          {product.image_urls.map((src, i) => {
            const isSelected = index === i;
            return (
              <button
                type="button"
                role="tab"
                key={`${src.slice(-24)}-${i}`}
                onClick={() => setIndex(i)}
                aria-label={`View product photo ${i + 1} of ${product.image_urls.length}`}
                aria-selected={isSelected}
                className={`shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green ${
                  isSelected
                    ? 'border-antique-green shadow-xs ring-1 ring-antique-green/40'
                    : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <ProductPhoto product={product} index={i} contain sizes="64px" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
