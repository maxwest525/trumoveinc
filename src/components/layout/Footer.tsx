import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { sitePrefix } from "@/lib/hostDetection";

export default function Footer() {
  const prefix = sitePrefix();

  return (
    <footer className="footer-main">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">TruMove</div>
          <div className="footer-tagline">
            AI-powered moving quotes and carrier coordination.
          </div>
        </div>

        <nav className="footer-nav">
          <Link className="footer-link" to={`${prefix}/about`}>
            About
          </Link>
          <Link className="footer-link" to={`${prefix}/faq`}>
            FAQ
          </Link>
          <Link className="footer-link" to={`${prefix}/privacy`}>
            Privacy
          </Link>
          <Link className="footer-link" to={`${prefix}/terms`}>
            Terms
          </Link>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </footer>
  );
}
