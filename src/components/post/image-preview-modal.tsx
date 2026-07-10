"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ImagePreviewModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImagePreviewModal({ src, alt, onClose }: ImagePreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      {/* Drag-to-dismiss (vertical swipe), matching the reels viewer's close
          gestures — Escape and backdrop click both also close. */}
      <motion.img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.y) > 120 || Math.abs(info.velocity.y) > 500) onClose();
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
}
