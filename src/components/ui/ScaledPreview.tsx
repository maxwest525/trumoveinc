import { useRef, useEffect, useState, useCallback } from "react";

interface ScaledPreviewProps {
  children: React.ReactNode;
  contentWidth?: number;
  className?: string;
}

export default function ScaledPreview({ children, contentWidth = 1440, className }: ScaledPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const newScale = container.clientWidth / contentWidth;
    setScale(newScale);
  }, [contentWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateScale]);

  return (
    <div ref={containerRef} className={className} style={{ overflow: "hidden", position: "relative" }}>
      <div
        ref={contentRef}
        style={{
          width: contentWidth,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
