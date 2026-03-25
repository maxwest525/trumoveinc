import { useEffect, useRef, useState, RefObject } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface ScrollAnimationResult<T extends HTMLElement> {
  ref: RefObject<T | null>;
  isInView: boolean;
  /** True when element was already visible on mount — skip entrance animation */
  isInstant: boolean;
}

export function useScrollAnimation<T extends HTMLElement>(
  options: UseScrollAnimationOptions = {}
): [RefObject<T | null>, boolean, boolean] {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const [isInstant, setIsInstant] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If the element is already in the viewport on mount, show instantly
    const rect = element.getBoundingClientRect();
    const alreadyVisible =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;

    if (alreadyVisible) {
      setIsInView(true);
      setIsInstant(true);
      if (triggerOnce) return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isInView, isInstant];
}

// Utility hook for staggered children animations
export function useStaggeredAnimation(
  isInView: boolean,
  itemCount: number,
  baseDelay: number = 0.1
): number[] {
  return Array.from({ length: itemCount }, (_, i) => 
    isInView ? baseDelay * (i + 1) : 0
  );
}
