import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Lock } from "lucide-react";

interface PortalCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  accentHsl: string;
  index: number;
  onClick: () => void;
  disabled?: boolean;
  beta?: boolean;
}

export default function PortalCard({ label, description, icon: Icon, accentHsl, index, onClick, disabled = false, beta = false }: PortalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  const activeHover = hovered && !disabled;

  return (
    <motion.div
      ref={cardRef}
      style={disabled ? {} : { rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      className={`relative group ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* Animated border glow - only when enabled */}
      {!disabled && (
        <div
          className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]"
          style={{
            background: `conic-gradient(from var(--border-angle, 0deg), transparent 40%, hsl(${accentHsl} / 0.5) 50%, transparent 60%)`,
            animation: activeHover ? "spin-border 3s linear infinite" : "none",
          }}
        />
      )}

      {/* Card body */}
      <div className={`relative rounded-2xl border overflow-hidden transition-all duration-500 ${
        disabled
          ? "border-foreground/8 bg-white/30 backdrop-blur-sm shadow-none"
          : "border-foreground/15 bg-white/60 backdrop-blur-md group-hover:border-transparent group-hover:bg-white/70 shadow-[0_4px_24px_hsla(0,0%,0%,0.12),0_1px_4px_hsla(0,0%,0%,0.08)]"
      }`}>

        {/* Idle breathing glow orb - only when enabled */}
        {!disabled && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-[0.04] group-hover:opacity-[0.12] transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle, hsl(${accentHsl}), transparent 70%)`,
              animation: "breathe 4s ease-in-out infinite",
            }}
          />
        )}

        {/* Shimmer sweep on hover - only when enabled */}
        {!disabled && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(105deg, transparent 40%, hsl(${accentHsl} / 0.08) 45%, hsl(${accentHsl} / 0.14) 50%, hsl(${accentHsl} / 0.08) 55%, transparent 60%)`,
              backgroundSize: "250% 100%",
              animation: activeHover ? "shimmer-sweep 2s ease-in-out infinite" : "none",
            }}
          />
        )}

        {/* Content */}
        <div className={`relative z-10 flex flex-col items-center text-center gap-5 p-10 pb-8 ${disabled ? "opacity-40" : ""}`}>

          {/* Icon container */}
          <div className="relative">
            {!disabled && (
              <div
                className="absolute inset-0 rounded-2xl scale-[1.35] opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{
                  border: `1px solid hsl(${accentHsl} / 0.2)`,
                  animation: activeHover ? "ring-pulse 2s ease-in-out infinite" : "none",
                }}
              />
            )}
            <motion.div
              animate={activeHover ? { scale: 1.12, rotate: 3 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center border border-white/40 group-hover:border-transparent transition-colors duration-500"
              style={{
                boxShadow: activeHover ? `0 8px 32px hsl(${accentHsl} / 0.2)` : "0 4px 12px hsl(var(--foreground) / 0.06)",
              }}
            >
              <Icon
                className="w-7 h-7 transition-colors duration-500"
                style={{ color: activeHover ? `hsl(${accentHsl})` : "hsl(var(--muted-foreground))" }}
              />
            </motion.div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-base font-bold tracking-tight text-foreground">{label}</h2>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed max-w-[200px]">{description}</p>
          </div>

          {/* Enter arrow or lock icon */}
          {disabled ? (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground/50">
              <Lock className="w-3.5 h-3.5" />
              No access
            </div>
          ) : (
            <motion.div
              animate={activeHover ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase"
                style={{ color: `hsl(${accentHsl})` }}
              >
                Enter
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
