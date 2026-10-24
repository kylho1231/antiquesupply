'use client';

import Image from 'next/image';
import { useState } from 'react';
import manifest from '../../public/image-manifest.json';

export function assetFor(src?: string) {
  return manifest.find(asset => asset.path === src);
}

export default function Photo({ src, alt, sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw', priority = false, contain = false, label, className = '', credits = true }: {
  src?: string; alt: string; sizes?: string; priority?: boolean; contain?: boolean; label?: string; className?: string; credits?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  const [loadedSource, setLoadedSource] = useState<string>();
  const asset = assetFor(src);
  const safeSource = src && (asset || /^data:image\/(webp|jpeg|png);base64,/.test(src) || /^\/api\/v1\/media\/[a-f0-9-]+$/.test(src));
  return <div className={`relative w-full h-full overflow-hidden bg-[#eee9df] ${className}`}>
    {safeSource && failedSource !== src ? <>
      {loadedSource !== src && <div aria-hidden className="absolute inset-0 animate-pulse bg-emerald-950/5" />}
      <Image src={src} alt={asset?.alt || alt} fill sizes={sizes} priority={priority}
        unoptimized={src.startsWith('data:') || src.startsWith('/api/')}
        className={contain ? 'object-contain p-3' : 'object-cover'}
        onLoad={() => setLoadedSource(src)} onError={() => setFailedSource(src)} />
      {credits && (asset || label) && <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 text-white px-3 py-2 text-[10px] leading-relaxed">
        {label && <span className="block font-semibold">{label}</span>}
        {asset && <a href={`/image-credits#${asset.id}`} className="underline underline-offset-2">{asset.creator} · {asset.license}</a>}
      </div>}
    </> : <div role="img" aria-label={`Photo unavailable: ${alt}`} className="h-full min-h-28 flex flex-col justify-center items-center text-center p-6 text-emerald-950 bg-gradient-to-br from-stone-100 to-emerald-100/60">
      <span className="text-[10px] font-bold uppercase tracking-[.2em]">AntiqueSupply</span>
      <span className="mt-3 font-semibold text-sm">{failedSource === src && src ? 'Photo could not load' : 'Supplier photo pending'}</span>
      <span className="text-xs mt-1 text-slate-600">{alt}</span>
    </div>}
  </div>;
}

export function ProductPhoto({ product, index = 0, ...props }: { product: { image_urls?: string[]; name: string; is_demo?: boolean }; index?: number; contain?: boolean; sizes?: string }) {
  const src = product.image_urls?.[index];
  // Editorial files must never masquerade as photographs of live merchandise.
  const allowed = !assetFor(src) || product.is_demo === true;
  return <Photo src={allowed ? src : undefined} alt={product.name} label={product.is_demo ? 'Sample listing · illustrative photo' : undefined} {...props} />;
}
