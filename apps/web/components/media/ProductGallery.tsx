'use client';
import { useState } from 'react';
import { ProductPhoto } from './Photo';

export default function ProductGallery({ product }: { product: { name: string; image_urls: string[]; is_demo?: boolean } }) {
  const [index, setIndex] = useState(0);
  return <div>
    <div className="relative aspect-square"><ProductPhoto product={product} index={Math.min(index, Math.max(0, product.image_urls.length - 1))} contain sizes="(max-width: 768px) 90vw, 360px" /></div>
    {product.image_urls.length > 1 && <div className="flex gap-2 p-3 overflow-x-auto" aria-label="Product photos">
      {product.image_urls.map((src, i) => <button type="button" key={`${src.slice(-24)}-${i}`} onClick={() => setIndex(i)} aria-label={`Show product photo ${i + 1}`} aria-pressed={index === i} className={`shrink-0 w-16 h-16 rounded-lg border-2 ${index === i ? 'border-emerald-700' : 'border-transparent'}`}>
        <ProductPhoto product={product} index={i} contain sizes="64px" />
      </button>)}
    </div>}
  </div>;
}
