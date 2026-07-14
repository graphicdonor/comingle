"use client";
import { useState } from "react";
import Image from "next/image";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobPhotoCarouselProps {
  photos: string[];
  name: string;
}

export function JobPhotoCarousel({ photos, name }: JobPhotoCarouselProps) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-sky-500/25 to-blue-100 flex items-center justify-center">
        <Briefcase className="w-12 h-12 text-white/80" />
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-100">
      <Image src={photos[index]} alt={`${name} photo ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 500px" className="object-cover" />

      {photos.length > 1 && (
        <>
          <button
            aria-label="Previous photo"
            onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
            className="absolute inset-y-0 left-0 w-1/3"
          />
          <button
            aria-label="Next photo"
            onClick={() => setIndex((i) => (i + 1) % photos.length)}
            className="absolute inset-y-0 right-0 w-1/3"
          />
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
            {photos.map((photo, i) => (
              <span key={photo} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-white" : "w-1.5 bg-white/50")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
