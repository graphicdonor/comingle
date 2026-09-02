import { useEffect, useRef, useState } from "react";

/** Cheap IntersectionObserver wrapper used to pause expensive canvas/rAF
 * loops while a section is off-screen, and to gate one-time reveal
 * animations without re-rendering on every scroll tick. */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "10% 0px",
      threshold: 0.1,
      ...options,
    });
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
