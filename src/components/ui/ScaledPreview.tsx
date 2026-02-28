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
  const heightLockedRef = useRef(false);

  // Measure and set scale + height — only when container width actually changes
  const measure = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const containerWidth = container.clientWidth;
    if (containerWidth < 1) return;

    const widthChanged = Math.abs(containerWidth - lastWidthRef.current) >= 1;

    if (!widthChanged && heightLockedRef.current) return;

    if (widthChanged) {
      lastWidthRef.current = containerWidth;
      heightLockedRef.current = false;
      const s = containerWidth / contentWidth;
      setScale(s);
    }

    // Defer height read to let layout settle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const c = contentRef.current;
        if (!c) return;
        const s = lastWidthRef.current / contentWidth;
        const h = c.scrollHeight;
        setScaledHeight(Math.round(h * s));
        heightLockedRef.current = true;
      });
    });
  }, [contentWidth]);

  // Observe container for width changes only
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

  // Re-measure once after children mount/change, then lock
  useEffect(() => {
    heightLockedRef.current = false;
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
