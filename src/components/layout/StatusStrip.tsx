import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STATUS = [
  { text: "Instant AI quotes", key: "online-estimate", href: "/site/online-estimate" },
  { text: "Vetted mover network", key: "vetting", href: "/site/vetting" },
  { text: "Real time updates", key: "home", href: "/site" },
  { text: "Virtual video consults", key: "book", href: "/site/book" },
  { text: "Live review and claims monitoring", key: "home", href: "/site" },
  { text: "Load tracking", key: "home", href: "/site" },
];

function getRouteKey(path: string): string {
  const route = (path || "/").toLowerCase();
  if (route.startsWith("/site/online-estimate")) return "online-estimate";
  if (route.startsWith("/site/vetting")) return "vetting";
  if (route.startsWith("/site/book")) return "book";
  return "home";
}

export default function StatusStrip() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paused, setPaused] = useState(false);
  const scrollT = useRef<number | null>(null);
  const routeKey = useMemo(() => getRouteKey(location.pathname), [location.pathname]);

  const loop = useMemo(() => [...STATUS, ...STATUS], []);

  useEffect(() => {
    document.documentElement.setAttribute("data-tm-route", routeKey);
    document.documentElement.setAttribute("data-tm-badge", "plaque");
  }, [routeKey]);

  useEffect(() => {
    const onScroll = () => {
      document.documentElement.classList.add("tm-scrolling");
      setPaused(true);

      if (scrollT.current) window.clearTimeout(scrollT.current);
      scrollT.current = window.setTimeout(() => {
        document.documentElement.classList.remove("tm-scrolling");
        setPaused(false);
      }, 160);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollT.current) window.clearTimeout(scrollT.current);
    };
  }, []);

  function snapTo(item: typeof STATUS[0]) {
    const targetHref = item.href || "/";
    const onSamePage = location.pathname === targetHref;

    if (!onSamePage) {
      navigate(targetHref);
      return;
    }

    const id = `tm-${item.key}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div
      className={`h-[44px] border-b border-border/40 bg-gradient-to-b from-white/98 to-white overflow-hidden ${paused ? "is-paused" : ""}`}
      aria-label="Platform capabilities"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute top-0 bottom-0 left-0 w-[90px] bg-gradient-to-r from-white to-transparent pointer-events-none z-[2]" aria-hidden="true" />
      <div className="absolute top-0 bottom-0 right-0 w-[90px] bg-gradient-to-l from-white to-transparent pointer-events-none z-[2]" aria-hidden="true" />

      <div className="h-full overflow-hidden" role="list">
        <div
          className={`h-full flex items-center w-max gap-0 will-change-transform ${paused ? "[animation-play-state:paused]" : ""}`}
          style={{ animation: "tm-marquee 34s linear infinite" }}
          role="presentation"
        >
          {loop.map((s, i) => (
            <button
              key={`${s.text}-${i}`}
              type="button"
              className="appearance-none border-0 bg-transparent inline-flex items-center gap-[10px] px-[18px] py-[10px] text-[12px] tracking-[0.14em] uppercase font-semibold whitespace-nowrap text-foreground/70 relative cursor-pointer hover:text-foreground/90 focus-visible:outline-2 focus-visible:outline-primary/45 focus-visible:outline-offset-2 focus-visible:rounded-[10px]"
              data-page={s.key}
              role="listitem"
              onClick={() => snapTo(s)}
              aria-label={s.text}
            >
              <span className="w-[6px] h-[6px] rounded-full bg-primary shadow-[0_0_0_5px_hsl(var(--primary)/0.14)] flex-shrink-0" aria-hidden="true" />
              <span>{s.text}</span>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[16px] bg-foreground/14" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
