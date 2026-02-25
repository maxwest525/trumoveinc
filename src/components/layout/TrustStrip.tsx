import { Shield, BadgeCheck, Truck, Award } from "lucide-react";

const TRUST = [
  { icon: Shield, text: "USDOT Compliant", accent: "gold" },
  { icon: BadgeCheck, text: "Bonded & Insured", accent: "green" },
  { icon: Truck, text: "FMCSA Authorized", accent: "gold" },
  { icon: Award, text: "Licensed Broker", accent: "green" },
];

export default function TrustStrip() {
  return (
    <div className="trust-strip" aria-label="Compliance and authority">
      <div className="trust-strip-inner">
        {TRUST.map((t) => (
          <div key={t.text} className={`trust-strip-item accent-${t.accent}`}>
            <t.icon />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
