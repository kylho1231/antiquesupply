'use client';

import React, { useState, useEffect } from 'react';
import PhotoEditor from './PhotoEditor';
import { useAntiqueSupplyStore } from '../../lib/store';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EditProductPhotos({
  product,
  onClose,
}: {
  product: { id: string; name: string; image_urls: string[] };
  onClose: () => void;
}) {
  const { updateProductPhotos } = useAntiqueSupplyStore();
  const [photos, setPhotos] = useState(product.image_urls);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-photos-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto flex items-center justify-center animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-emerald-900/10 animate-in zoom-in-95 duration-150"
        onSubmit={event => {
          event.preventDefault();
          if (busy) return;
          try {
            updateProductPhotos(product.id, photos);
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not save photos.');
          }
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
              Media Management
            </span>
            <h2 id="edit-photos-modal-title" className="text-lg font-black text-slate-900 mt-0.5">
              Product Photos · {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo editor"
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <PhotoEditor photos={photos} onChange={setPhotos} onBusyChange={setBusy} />

        <label className="flex items-start gap-2.5 text-xs text-slate-800 font-medium cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            required
            checked={confirmed}
            onChange={event => setConfirmed(event.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-antique-green focus-visible:ring-2 focus-visible:ring-antique-green w-4 h-4 cursor-pointer"
          />
          <span className="leading-relaxed">
            I verify that our organization holds legal commercial rights or ownership of these product photographs.
          </span>
        </label>

        {error && (
          <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !confirmed}
            className="min-h-[44px] px-6 py-2.5 text-xs font-bold text-white bg-antique-green hover:bg-emerald-800 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            Save Photos
          </button>
        </div>
      </form>
    </div>
  );
}
