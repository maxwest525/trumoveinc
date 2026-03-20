import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calculator, MapPin, Shield, Phone } from "lucide-react";
import { sitePrefix } from "@/lib/hostDetection";
import logo from "@/assets/logo-navbar.png";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/online-estimate", label: "Virtual Inventory", icon: Calculator },
  { path: "/track", label: "Shipment Tracking", icon: MapPin },
  { path: "/vetting", label: "FMCSA Carrier Vetting", icon: Shield },
  { path: "/book", label: "Contact Us", icon: Phone },
];

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const prefix = sitePrefix();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const homePath = prefix || "/";
  const isHome = location.pathname === homePath || location.pathname === "/site";

  return (
    <>
      <header className={`header-main header-floating ${isScrolled ? "is-scrolled" : ""} ${isHome ? "header-home-glow" : ""}`}>
        <div className="header-inner">
          <Link to={homePath} className="header-logo shrink-0" aria-label="TruMove Home">
            <img src={logo} alt="TruMove" className="header-logo-glow" />
          </Link>

          <nav className="header-nav" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const href = `${prefix}${item.path}`;
              const isActive = location.pathname === href;
              return (
                <div key={item.label} className="header-nav-item">
                  <Link to={href} className={`header-nav-link text-[15px] ${isActive ? "is-active" : ""}`}>
                    <Icon className="w-5 h-5 text-[hsl(142,71%,45%)]" />
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          <button
            type="button"
            className="header-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="header-mobile-menu">
            <nav className="header-mobile-nav">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const href = `${prefix}${item.path}`;
                return (
                  <Link
                    key={item.label}
                    to={href}
                    className={`header-mobile-link ${location.pathname === href ? "is-active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4 text-[hsl(142,71%,45%)]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
