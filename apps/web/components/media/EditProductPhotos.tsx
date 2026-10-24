'use client';
import { useState } from 'react';
import PhotoEditor from './PhotoEditor';
import { useAntiqueSupplyStore } from '../../lib/store';

export default function EditProductPhotos({ product, onClose }: { product: { id: string; name: string; image_urls: string[] }; onClose: () => void }) {
  const { updateProductPhotos } = useAntiqueSupplyStore();
  const [photos, setPhotos] = useState(product.image_urls);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <div role="dialog" aria-modal="true" aria-label="Edit product photographs" className="fixed inset-0 z-50 bg-slate-950/70 p-4 overflow-y-auto flex items-start justify-center">
    <form className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 my-6" onSubmit={event => { event.preventDefault(); if (busy) return; try { updateProductPhotos(product.id, photos); onClose(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not save photos.'); } }}>
      <h2 className="text-xl font-bold">Photos · {product.name}</h2>
      <PhotoEditor photos={photos} onChange={setPhotos} onBusyChange={setBusy} />
      <label className="flex gap-2 text-sm"><input type="checkbox" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />I have permission to use the added photos for this product.</label>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div className="flex justify-end gap-4"><button type="button" onClick={onClose}>Cancel</button><button disabled={busy || !confirmed} className="rounded-lg bg-emerald-800 text-white px-5 py-2 disabled:opacity-50">Save photos</button></div>
    </form>
  </div>;
}
