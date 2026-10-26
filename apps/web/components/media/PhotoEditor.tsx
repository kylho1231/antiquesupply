'use client';

import React, { useState } from 'react';
import Photo from './Photo';
import { MAX_PHOTOS, preparePhoto } from '../../lib/prepare-photo';
import { ArrowLeft, ArrowRight, Star, Trash2, Upload, AlertCircle, Loader2 } from 'lucide-react';

export default function PhotoEditor({
  photos,
  onChange,
  onBusyChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function select(files: FileList | null, replace?: number) {
    if (!files?.length || busy) return;
    setError('');
    if (replace === undefined && photos.length + files.length > MAX_PHOTOS) {
      setError(`You can add up to ${MAX_PHOTOS} photos in total.`);
      return;
    }
    setBusy(true);
    onBusyChange?.(true);
    try {
      const result: string[] = [];
      for (const file of Array.from(files)) {
        result.push(await preparePhoto(file));
      }
      const next = [...photos];
      if (replace !== undefined) {
        next[replace] = result[0];
      } else {
        next.push(...result);
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process the photo.');
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return (
    <fieldset disabled={busy} className="rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-4 bg-white">
      <legend className="font-bold text-xs uppercase tracking-wider text-slate-800 px-1">
        Product Photographs
      </legend>
      <p className="text-xs text-slate-600 leading-relaxed">
        JPEG, PNG or WebP · up to 6 photos · 8 MB each. The first photo is the primary marketplace image. Upload only photos your organization legally owns or is authorized to use.
      </p>

      {/* Upload Drop/Button Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="min-h-[44px] px-4 py-2.5 bg-antique-green hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs focus-within:ring-2 focus-within:ring-emerald-600">
          <Upload className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span>Upload New Photos</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy || photos.length >= MAX_PHOTOS}
            aria-label="Add product photographs"
            className="sr-only"
            onChange={event => {
              void select(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
        <span className="text-[11px] text-slate-500 font-medium">
          {photos.length} of {MAX_PHOTOS} photos uploaded
        </span>
      </div>

      {busy && (
        <div role="status" className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
          <Loader2 className="w-4 h-4 animate-spin text-antique-green" aria-hidden="true" />
          <span>Preparing and optimizing product photos to WebP format…</span>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-2 text-xs font-semibold text-red-800 bg-red-50 p-3 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2.5 hover:border-emerald-300 transition-colors"
            >
              <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white">
                <Photo src={photo} alt={`Product photo ${i + 1}`} contain sizes="180px" />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">
                  {i === 0 ? 'Main Photo' : `Photo ${i + 1}`}
                </span>
                {i === 0 && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Primary
                  </span>
                )}
              </div>

              {/* Action Buttons with 44px min touch targets */}
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    aria-label={`Move photo ${i + 1} earlier`}
                    onClick={() => {
                      const next = [...photos];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      onChange(next);
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    disabled={i === photos.length - 1}
                    aria-label={`Move photo ${i + 1} later`}
                    onClick={() => {
                      const next = [...photos];
                      [next[i], next[i + 1]] = [next[i + 1], next[i]];
                      onChange(next);
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                  >
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange([photo, ...photos.filter((_, index) => index !== i)])
                      }
                      title="Set as main primary photo"
                      aria-label={`Set photo ${i + 1} as main`}
                      className="h-9 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-antique-green text-[11px] font-semibold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antique-green"
                    >
                      <Star className="w-3 h-3 text-amber-500" aria-hidden="true" />
                      <span>Main</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => onChange(photos.filter((_, index) => index !== i))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}
