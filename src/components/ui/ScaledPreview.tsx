import { useRef, useEffect, useState, useCallback } from "react";

interface ScaledPreviewProps {
  children: React.ReactNode;
  contentWidth?: number;
  className?: string;
  scrollable?: boolean;
}

export default function ScaledPreview({ children, contentWidth = 1440, className, scrollable = false }: ScaledPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined);
  const lastWidthRef = useRef<number>(0);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const debounceRef = useRef<number>(0);

  const measureHeight = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    const s = lastWidthRef.current / contentWidth;
    if (s <= 0) return;
    const h = content.scrollHeight;
    setScaledHeight(Math.round(h * s));
  }, [contentWidth]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const containerWidth = container.clientWidth;
    if (containerWidth < 1) return;

    const widthChanged = Math.abs(containerWidth - lastWidthRef.current) >= 1;

    if (widthChanged) {
      lastWidthRef.current = containerWidth;
      const s = containerWidth / contentWidth;
      setScale(s);
    }

    // Defer height read to let layout settle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measureHeight();
      });
    });
  }, [contentWidth, measureHeight]);

  // Observe container for width changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    measure();

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (Math.abs(w - lastWidthRef.current) < 1) return;
      measure();
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [measure]);

  // MutationObserver to detect content changes (style updates, DOM changes)
  // This is what makes the preview update when brand styles are applied
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    mutationObserverRef.current = new MutationObserver(() => {
      // Debounce to avoid excessive recalculations
      cancelAnimationFrame(debounceRef.current);
      debounceRef.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          measureHeight();
        });
      });
    });

    mutationObserverRef.current.observe(content, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      mutationObserverRef.current?.disconnect();
      cancelAnimationFrame(debounceRef.current);
    };
  }, [measureHeight]);

  // Initial height settlement
  useEffect(() => {
    const t = setTimeout(measure, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ overflow: scrollable ? "auto" : "hidden", position: "relative" }}>
      <div style={{ width: "100%", height: scaledHeight, position: "relative" }}>
        <div
          ref={contentRef}
          style={{
            width: contentWidth,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
            willChange: "transform",
            pointerEvents: "none",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
