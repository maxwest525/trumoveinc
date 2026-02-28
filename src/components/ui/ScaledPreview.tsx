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
  const rafRef = useRef<number>();
  const lastWidthRef = useRef<number>(0);
  const lastHeightRef = useRef<number>(0);
  const heightStableRef = useRef(false);

  const updateScale = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;

    // Only recalculate if container width actually changed (ignore sub-pixel jitter)
    if (Math.abs(containerWidth - lastWidthRef.current) < 1) {
      // Width unchanged — only do a one-time height settle
      if (!heightStableRef.current && content) {
        const contentHeight = content.scrollHeight;
        if (Math.abs(contentHeight - lastHeightRef.current) > 4) {
          lastHeightRef.current = contentHeight;
          const s = lastWidthRef.current / contentWidth;
          setScaledHeight(contentHeight * s);
        } else {
          heightStableRef.current = true;
        }
      }
      return;
    }

    lastWidthRef.current = containerWidth;
    heightStableRef.current = false;
    const newScale = containerWidth / contentWidth;
    setScale(newScale);

    if (content) {
      // Use rAF + double-rAF to let layout settle before measuring
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!contentRef.current) return;
          const contentHeight = contentRef.current.scrollHeight;
          lastHeightRef.current = contentHeight;
          setScaledHeight(contentHeight * newScale);
        });
      });
    }
  }, [contentWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScale();

    // Only observe the container for width changes
    const observer = new ResizeObserver((entries) => {
      // Only respond to width changes on the container
      const entry = entries[0];
      if (!entry) return;
      const newWidth = entry.contentRect.width;
      if (Math.abs(newWidth - lastWidthRef.current) < 1) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateScale);
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateScale]);

  // One-time content height measurement after mount + children change
  useEffect(() => {
    heightStableRef.current = false;
    const timer = setTimeout(updateScale, 150);
    return () => clearTimeout(timer);
  }, [children, updateScale]);

  const wrapperStyle: React.CSSProperties = {
    overflow: scrollable ? "auto" : "hidden",
    position: "relative",
  };

  return (
    <div ref={containerRef} className={className} style={wrapperStyle}>
      <div
        style={{
          width: "100%",
          height: scaledHeight,
          position: "relative",
        }}
      >
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
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
