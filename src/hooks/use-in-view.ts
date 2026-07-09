import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Tracks whether an element is (near) the viewport, for pausing continuous
 * animations while their section is scrolled off-screen — extracted from the
 * hand-rolled IntersectionObserver pattern in HeroMockup.
 *
 * SSR-safe: the observer is only constructed inside an effect. If
 * IntersectionObserver is unavailable, resolves to `true` so animations never
 * get stuck paused.
 */
export function useInView<T extends HTMLElement = HTMLElement>(opts?: {
  /** Minimum intersection ratio to count as "in view". Default 0 (any pixel). */
  ratio?: number;
  /** Observer rootMargin — default resumes slightly before entry. */
  rootMargin?: string;
  /** Value during SSR / before the first observation. Default false. */
  initial?: boolean;
}): [RefObject<T | null>, boolean] {
  const { ratio = 0, rootMargin = "120px 0px", initial = false } = opts ?? {};
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(ratio > 0 ? entry.intersectionRatio >= ratio : entry.isIntersecting);
      },
      { threshold: ratio > 0 ? [0, ratio] : 0, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ratio, rootMargin]);

  return [ref, inView];
}
