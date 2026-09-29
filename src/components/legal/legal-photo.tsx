import Image from "next/image";
import { Scale } from "lucide-react";

export function LegalPhoto({ photos, name }: { photos: string[]; name: string }) {
  if (photos.length === 0) {
    return (
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-violet-500/25 to-purple-100 flex items-center justify-center">
        <Scale className="w-12 h-12 text-white/80" />
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-100">
      <Image src={photos[0]} alt={name} fill sizes="(max-width: 640px) 100vw, 500px" className="object-cover" />
    </div>
  );
}
