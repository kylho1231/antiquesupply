'use client';
import { useState } from 'react';
import Photo from './Photo';
import { MAX_PHOTOS, preparePhoto } from '../../lib/prepare-photo';

export default function PhotoEditor({ photos, onChange, onBusyChange }: { photos: string[]; onChange: (photos: string[]) => void; onBusyChange?: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function select(files: FileList | null, replace?: number) {
    if (!files?.length || busy) return;
    setError('');
    if (replace === undefined && photos.length + files.length > MAX_PHOTOS) { setError('You can add up to six photos.'); return; }
    setBusy(true); onBusyChange?.(true);
    try {
      const result: string[] = [];
      for (const file of Array.from(files)) result.push(await preparePhoto(file));
      const next = [...photos];
      if (replace !== undefined) next[replace] = result[0]; else next.push(...result);
      onChange(next);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not process the photo.'); }
    finally { setBusy(false); onBusyChange?.(false); }
  }
  return <fieldset disabled={busy} className="rounded-xl border border-stone-200 p-4 space-y-3">
    <legend className="font-semibold px-1">Product photographs</legend>
    <p className="text-xs text-slate-600">JPEG, PNG or WebP · up to 6 photos · 8 MB each. The first photo is the main image. Upload only photos you own or have permission to use.</p>
    <p className="text-xs text-amber-900">Demo uploads are compressed and saved in this browser only. They are not private cloud storage.</p>
    <input type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="Add product photographs" disabled={busy || photos.length >= MAX_PHOTOS} onChange={event => { void select(event.target.files); event.target.value = ''; }} />
    {busy && <p role="status">Preparing photos…</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{photos.map((photo, i) => <div key={i} className="rounded-lg border bg-white p-2 space-y-2">
      <div className="aspect-square"><Photo src={photo} alt={`Product photo ${i + 1}`} contain sizes="160px" /></div>
      <p className="font-semibold text-xs">{i === 0 ? 'Main photo' : `Photo ${i + 1}`}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {i > 0 && <button type="button" className="underline" onClick={() => onChange([photo, ...photos.filter((_, index) => index !== i)])}>Make main</button>}
        <button type="button" disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`} onClick={() => { const next = [...photos]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; onChange(next); }}>←</button>
        <button type="button" disabled={i === photos.length - 1} aria-label={`Move photo ${i + 1} later`} onClick={() => { const next = [...photos]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; onChange(next); }}>→</button>
        <button type="button" className="text-red-700 underline" onClick={() => onChange(photos.filter((_, index) => index !== i))}>Remove</button>
      </div>
      <label className="block text-xs">Replace photo {i + 1}<input type="file" className="block w-full text-[10px]" accept="image/jpeg,image/png,image/webp" onChange={event => { void select(event.target.files, i); event.target.value = ''; }} /></label>
    </div>)}</div>
  </fieldset>;
}
