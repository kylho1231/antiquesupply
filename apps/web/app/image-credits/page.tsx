import Link from 'next/link';
import manifest from '../../public/image-manifest.json';
import Photo from '../../components/media/Photo';

export default function ImageCreditsPage() {
  return <div className="max-w-5xl mx-auto p-6 space-y-6">
    <Link href="/" className="text-emerald-800 underline">Back to marketplace</Link>
    <h1 className="text-3xl font-bold">Photography & credits</h1>
    <p>These photographs illustrate places, materials and crafts. They do not verify a supplier, facility, product specification or endorsement. Sample listings use illustrative images; commercial listings require supplier-authorized photographs.</p>
    <p>Images were resized and converted to WebP and may be cropped by the interface. Each image and its adaptations retain the license linked below. <a href="/image-manifest.json" className="underline">Download the image manifest</a>.</p>
    <div className="grid sm:grid-cols-2 gap-6">{manifest.map(asset => <article id={asset.id} key={asset.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200">
      <div className="aspect-[4/3]"><Photo src={asset.path} alt={asset.alt} contain /></div>
      <div className="p-5 space-y-2 text-sm">
        <h2 className="font-bold">{asset.title}</h2>
        <p>{asset.creator}</p>
        <p><a href={asset.sourceUrl} className="underline">Original source</a> · <a href={asset.licenseUrl} className="underline">{asset.license}</a></p>
        <p>{asset.usage}</p><p className="text-slate-500">License checked {asset.checkedAt.slice(0, 10)}. No supplier affiliation implied.</p>
      </div>
    </article>)}</div>
  </div>;
}
