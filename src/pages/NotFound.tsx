import { useLocation, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Construction, ArrowLeft, Truck } from "lucide-react";
import logoImg from "@/assets/logo.png";

const NotFound = () => {
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Animated green particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; r: number; dx: number; dy: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0f4f8] via-[#e8ecf1] to-[#dfe3e8]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Logo */}
        <img src={logoImg} alt="TruMove" className="h-10 mb-8" />

        {/* Construction icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center border border-[#22c55e]/20">
            <Construction className="w-10 h-10 text-[#22c55e]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[#1a365d] flex items-center justify-center shadow-lg">
            <Truck className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[#020817] mb-3 tracking-tight">
          Under Construction
        </h1>

        {/* Message */}
        <p className="text-base sm:text-lg text-[#64748b] mb-2 leading-relaxed">
          The page you're looking for is under construction.
        </p>
        <p className="text-base sm:text-lg text-[#64748b] mb-8 leading-relaxed">
          It looks like TruMove is moving you already{" "}
          <span className="inline-block animate-bounce">🚚</span>
        </p>

        {/* Path badge */}
        <div className="mb-8 px-4 py-2 rounded-lg bg-white/60 backdrop-blur-md border border-foreground/10 shadow-sm">
          <code className="text-xs text-muted-foreground font-mono">{location.pathname}</code>
        </div>

        {/* Back button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1a365d] text-white font-medium text-sm hover:bg-[#1a365d]/90 transition-colors shadow-lg shadow-[#1a365d]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
