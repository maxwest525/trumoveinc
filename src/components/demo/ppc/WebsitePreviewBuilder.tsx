import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon, ArrowLeft, Star, CheckCircle2, Phone, MapPin, Shield, Clock, Users, Truck, Quote, Play, ChevronRight, Zap, Award, ArrowRight, Lock, BarChart3, Globe, Headphones } from "lucide-react";
import ScaledPreview from "@/components/ui/ScaledPreview";
import { BuildSelections } from "./AnalyticsBuilderPanel";
import { cn } from "@/lib/utils";

interface WebsitePreviewBuilderProps {
  selections: BuildSelections;
  onBack: () => void;
}

type TemplateStyle = 'editorial-dark' | 'clean-split-light' | 'enterprise-dark-form' | 'promo-dark-gradient' | 'corporate-light-video' | 'top10-listicle';
type PageTab = 'home' | 'services' | 'reviews' | 'quote';

const TEMPLATES: { id: TemplateStyle; label: string; desc: string }[] = [
  { id: 'editorial-dark', label: 'Editorial Dark', desc: 'Pure black, centered' },
  { id: 'clean-split-light', label: 'Clean Split Light', desc: 'White, teal accent' },
  { id: 'enterprise-dark-form', label: 'Enterprise Dark Form', desc: 'Dark, form right' },
  { id: 'promo-dark-gradient', label: 'Promo Dark Gradient', desc: 'Navy-purple gradient' },
  { id: 'corporate-light-video', label: 'Corporate Light Video', desc: 'Light, blue accent' },
  { id: 'top10-listicle', label: 'Top 10 Listicle', desc: 'Review/ranking site' },
];

function getContent(selections: BuildSelections) {
  const kw = selections.keywords[0] || 'Long Distance Moving';
  const loc = selections.locations[0] || 'Los Angeles, CA';
  const audience = selections.demographics[0] || 'Homeowners';
  return {
    headline: `Expert ${kw.replace(/\b\w/g, c => c.toUpperCase())} in ${loc.split(',')[0]}`,
    subheadline: `Trusted by ${audience.toLowerCase()} across ${selections.locations.length || 3} states`,
    benefits: [
      selections.keywords[1] ? `Specialized ${selections.keywords[1]}` : 'AI-Powered Instant Quotes',
      selections.keywords[2] ? `Top-rated ${selections.keywords[2]}` : 'Real-Time GPS Tracking',
      'Full-Value Protection Guarantee',
    ],
    testimonials: [
      { name: 'Sarah M.', location: selections.locations[0] || 'Los Angeles', text: 'Seamless experience from quote to delivery. The AI estimate was spot-on.' },
      { name: 'James K.', location: selections.locations[1] || 'Houston', text: 'Best moving company we\'ve ever used. Professional, on-time, and careful with our belongings.' },
    ],
    cta: 'Get Your Free Quote',
    stats: [
      { label: 'Moves Completed', value: '50,000+' },
      { label: 'Customer Rating', value: '4.9/5' },
      { label: 'States Covered', value: '48' },
      { label: 'Years Experience', value: '15+' },
    ],
    logos: ['Allied', 'United', 'Mayflower', 'North American', 'Atlas'],
  };
}

// ══════════════════════════════════════════════════════════════════
// 1. EDITORIAL DARK — Ubernatural-inspired
//    Ultra-minimal, massive serif headlines, stark b/w, editorial magazine feel
//    NO cards, NO borders, NO rounded corners. Pure typography + whitespace.
// ══════════════════════════════════════════════════════════════════

function EditorialDark({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#000000' : '#fafaf9';
  const fg = darkMode ? '#ffffff' : '#0c0a09';
  const muted = darkMode ? '#78716c' : '#a8a29e';
  const border = darkMode ? '#1c1917' : '#e7e5e4';
  const serifFont = "Georgia, 'Times New Roman', serif";

  return (
    <div style={{ background: bg, color: fg, fontFamily: serifFont, minHeight: 900 }}>
      {/* Minimal nav — flush, no decoration */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 80px' }}>
        <span style={{ fontSize: 14, fontWeight: 400, letterSpacing: 6, textTransform: 'uppercase', fontFamily: "'Courier New', monospace" }}>TruMove</span>
        <div style={{ display: 'flex', gap: 40, fontSize: 13, letterSpacing: 1, textTransform: 'lowercase', fontFamily: "'Courier New', monospace", color: muted }}>
          <span>home</span><span>services</span><span>reviews</span><span>contact</span>
        </div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero: massive serif, stacked vertically */}
          <div style={{ padding: '140px 80px 100px', maxWidth: 1100 }}>
            <div style={{ fontSize: 13, letterSpacing: 6, textTransform: 'uppercase', color: muted, fontFamily: "'Courier New', monospace", marginBottom: 40 }}>
              Moving, Reimagined
            </div>
            <h1 style={{ fontSize: 96, fontWeight: 400, lineHeight: 0.95, letterSpacing: -4, fontStyle: 'italic' }}>
              {content.headline.split(' in ')[0]}
            </h1>
            <h1 style={{ fontSize: 96, fontWeight: 400, lineHeight: 0.95, letterSpacing: -4, marginTop: 8 }}>
              in {content.headline.split(' in ')[1] || 'Your City'}
            </h1>
            <div style={{ width: 80, height: 1, background: fg, margin: '60px 0' }} />
            <p style={{ fontSize: 22, lineHeight: 1.7, maxWidth: 500, fontWeight: 300, color: muted }}>
              {content.subheadline}. We handle every detail so you don't have to.
            </p>
          </div>

          {/* Full-bleed divider image placeholder */}
          <div style={{ height: 500, background: darkMode ? '#0a0a0a' : '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 120, opacity: 0.06, fontStyle: 'italic', lineHeight: 1 }}>01</div>
              <div style={{ fontSize: 14, letterSpacing: 4, textTransform: 'uppercase', color: muted, fontFamily: "'Courier New', monospace", marginTop: -20 }}>Editorial Feature Image</div>
            </div>
          </div>

          {/* Stats — editorial layout, no boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '100px 80px', borderTop: `1px solid ${border}` }}>
            {content.stats.map((s, i) => (
              <div key={s.label} style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: muted, fontFamily: "'Courier New', monospace", marginBottom: 16 }}>0{i + 1}</div>
                <div style={{ fontSize: 56, fontWeight: 300, fontStyle: 'italic', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: muted, marginTop: 12, letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'Courier New', monospace" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Benefits — editorial list, no cards */}
          <div style={{ padding: '0 80px 100px' }}>
            {content.benefits.map((b, i) => (
              <div key={i} style={{ borderTop: `1px solid ${border}`, padding: '48px 0', display: 'grid', gridTemplateColumns: '80px 1fr 1fr', alignItems: 'start', gap: 40 }}>
                <div style={{ fontSize: 11, letterSpacing: 4, color: muted, fontFamily: "'Courier New', monospace" }}>0{i + 1}</div>
                <div style={{ fontSize: 32, fontStyle: 'italic', lineHeight: 1.2 }}>{b}</div>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: muted }}>Industry-leading service with transparent pricing and real-time updates throughout your entire moving journey.</p>
              </div>
            ))}
          </div>

          {/* CTA — stark, minimal */}
          <div style={{ padding: '120px 80px', textAlign: 'center', borderTop: `1px solid ${border}` }}>
            <p style={{ fontSize: 14, letterSpacing: 4, textTransform: 'uppercase', color: muted, fontFamily: "'Courier New', monospace", marginBottom: 32 }}>Begin Your Journey</p>
            <div style={{ fontSize: 64, fontStyle: 'italic', lineHeight: 1.1 }}>Let's move you<br />somewhere beautiful.</div>
            <div style={{ marginTop: 48, display: 'inline-block', borderBottom: `2px solid ${fg}`, paddingBottom: 4, fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', fontFamily: "'Courier New', monospace", cursor: 'pointer' }}>
              Request a consultation →
            </div>
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '100px 80px' }}>
          <div style={{ fontSize: 13, letterSpacing: 6, textTransform: 'uppercase', color: muted, fontFamily: "'Courier New', monospace", marginBottom: 40 }}>What We Do</div>
          <h2 style={{ fontSize: 72, fontStyle: 'italic', fontWeight: 400, lineHeight: 1, marginBottom: 80 }}>Our Services</h2>
          {['Long Distance Moving', 'Local Moving', 'Commercial Relocation', 'Packing & Crating', 'Climate-Controlled Storage', 'Auto Transport'].map((s, i) => (
            <div key={s} style={{ borderTop: `1px solid ${border}`, padding: '48px 0', display: 'grid', gridTemplateColumns: '60px 1fr 300px', gap: 40, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontFamily: "'Courier New', monospace", color: muted }}>0{i + 1}</span>
              <span style={{ fontSize: 28, fontStyle: 'italic' }}>{s}</span>
              <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>Professional, insured service with guaranteed delivery dates and full-value protection.</p>
            </div>
          ))}
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '100px 80px' }}>
          <div style={{ fontSize: 13, letterSpacing: 6, textTransform: 'uppercase', color: muted, fontFamily: "'Courier New', monospace", marginBottom: 40 }}>Testimonials</div>
          <h2 style={{ fontSize: 72, fontStyle: 'italic', fontWeight: 400, lineHeight: 1, marginBottom: 80 }}>Words from<br />our clients</h2>
          {[...content.testimonials, { name: 'Maria G.', location: 'Phoenix', text: 'The entire experience felt curated. Like someone actually cared about where my things ended up.' }].map((t, i) => (
            <div key={i} style={{ borderTop: `1px solid ${border}`, padding: '64px 0' }}>
              <div style={{ fontSize: 120, lineHeight: 0.8, opacity: 0.06, fontStyle: 'italic', marginBottom: -20 }}>"</div>
              <p style={{ fontSize: 28, lineHeight: 1.6, fontStyle: 'italic', maxWidth: 700, marginBottom: 32 }}>{t.text}</p>
              <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', fontFamily: "'Courier New', monospace", color: muted }}>{t.name} — {t.location}</div>
            </div>
          ))}
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '100px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 120 }}>
          <div>
            <div style={{ fontSize: 13, letterSpacing: 6, textTransform: 'uppercase', color: muted, fontFamily: "'Courier New', monospace", marginBottom: 40 }}>Contact</div>
            <h2 style={{ fontSize: 72, fontStyle: 'italic', fontWeight: 400, lineHeight: 1, marginBottom: 40 }}>Let's<br />talk.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.8, color: muted }}>
              Tell us about your move and we'll respond with a personalized plan within 24 hours. No pressure, no hidden fees.
            </p>
            <div style={{ marginTop: 60, borderTop: `1px solid ${border}`, paddingTop: 40 }}>
              <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', fontFamily: "'Courier New', monospace", color: muted, marginBottom: 16 }}>Or call directly</div>
              <div style={{ fontSize: 36, fontStyle: 'italic' }}>(800) 555-MOVE</div>
            </div>
          </div>
          <div style={{ paddingTop: 60 }}>
            {['Your Name', 'Email', 'Phone', 'Moving From', 'Moving To', 'Preferred Date', 'Tell us about your move'].map((f, i) => (
              <div key={f} style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', display: 'block', marginBottom: 8, color: muted, fontFamily: "'Courier New', monospace" }}>{f}</label>
                <div style={{ borderBottom: `1px solid ${border}`, padding: '12px 0', fontSize: 16, height: i === 6 ? 80 : 'auto' }} />
              </div>
            ))}
            <div style={{ marginTop: 32, borderBottom: `2px solid ${fg}`, paddingBottom: 4, display: 'inline-block', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', fontFamily: "'Courier New', monospace" }}>
              Submit Request →
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: muted, fontFamily: "'Courier New', monospace" }}>© 2025 TruMove</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Courier New', monospace", color: muted }}>
          <span>Privacy</span><span>Terms</span><span>Instagram</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 2. CLEAN SPLIT LIGHT — Pixel.ai-inspired
//    Friendly, approachable SaaS. Teal accent. Rounded shapes.
//    Pill badges, illustrated feel, asymmetric hero with quote form.
// ══════════════════════════════════════════════════════════════════

function CleanSplitLight({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0c1222' : '#ffffff';
  const fg = darkMode ? '#e2e8f0' : '#0f172a';
  const muted = darkMode ? '#64748b' : '#94a3b8';
  const accent = '#0d9488';
  const accentLight = darkMode ? '#0d948830' : '#0d948812';
  const cardBg = darkMode ? '#1e293b' : '#f0fdfa';
  const surfaceBg = darkMode ? '#162032' : '#f8fafb';
  const border = darkMode ? '#1e3a5f' : '#e2e8f0';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: 900 }}>
      {/* Nav with pill CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>TruMove</span>
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: muted, fontWeight: 500 }}>
          <span>Features</span><span>Pricing</span><span>Reviews</span><span>FAQ</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ padding: '8px 20px', fontSize: 14, color: muted, fontWeight: 500 }}>Log in</div>
          <div style={{ background: accent, color: '#fff', padding: '8px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600 }}>Get Started →</div>
        </div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero: asymmetric split with floating form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 40, padding: '80px 64px 60px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentLight, color: accent, padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
                <Zap size={14} /> AI-Powered Moving Platform
              </div>
              <h1 style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1.5 }}>
                {content.headline}
              </h1>
              <p style={{ fontSize: 18, color: muted, marginTop: 20, lineHeight: 1.7 }}>
                {content.subheadline}. Get an instant quote in 60 seconds — no phone calls, no waiting.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <div style={{ background: accent, color: '#fff', padding: '14px 32px', borderRadius: 999, fontSize: 15, fontWeight: 600 }}>{content.cta} →</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 999, border: `1px solid ${border}`, color: muted, fontSize: 15 }}>
                  <Play size={16} fill={accent} color={accent} /> Watch demo
                </div>
              </div>
              <div style={{ display: 'flex', gap: 32, marginTop: 40, fontSize: 13, color: muted }}>
                <span>✓ No hidden fees</span><span>✓ Licensed & insured</span><span>✓ 4.9★ rating</span>
              </div>
            </div>
            {/* Floating form card */}
            <div style={{ background: surfaceBg, borderRadius: 24, padding: 36, border: `1px solid ${border}`, boxShadow: darkMode ? 'none' : '0 20px 60px -20px rgba(13,148,136,0.15)' }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Get Your Free Estimate</div>
              <div style={{ fontSize: 13, color: muted, marginBottom: 24 }}>Takes less than 60 seconds</div>
              {['Moving From', 'Moving To', 'Move Date', 'Home Size'].map(f => (
                <div key={f} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: muted }}>{f}</div>
                  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>{f}...</div>
                </div>
              ))}
              <div style={{ background: accent, color: '#fff', padding: '14px', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 15, marginTop: 8 }}>Get Instant Quote →</div>
              <div style={{ textAlign: 'center', fontSize: 11, color: muted, marginTop: 10 }}>🔒 Your info is secure & private</div>
            </div>
          </div>

          {/* Logos strip */}
          <div style={{ padding: '32px 64px', background: surfaceBg, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: muted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>Trusted by leading carriers</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
              {content.logos.map(l => <span key={l} style={{ fontSize: 14, color: muted, fontWeight: 600, opacity: 0.5 }}>{l}</span>)}
            </div>
          </div>

          {/* Benefits — colorful icon cards with teal accents */}
          <div style={{ padding: '80px 64px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ display: 'inline-flex', background: accentLight, color: accent, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>Why TruMove</div>
              <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>Everything you need for a perfect move</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {content.benefits.map((b, i) => (
                <div key={i} style={{ padding: 32, borderRadius: 20, border: `1px solid ${border}`, background: surfaceBg, textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    {i === 0 ? <Zap size={24} color={accent} /> : i === 1 ? <MapPin size={24} color={accent} /> : <Shield size={24} color={accent} />}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{b}</div>
                  <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>Reliable, transparent service with real-time updates every step of the way.</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats in colored pills */}
          <div style={{ padding: '48px 64px', display: 'flex', justifyContent: 'center', gap: 16 }}>
            {content.stats.map(s => (
              <div key={s.label} style={{ background: surfaceBg, border: `1px solid ${border}`, borderRadius: 16, padding: '20px 32px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: accent }}>{s.value}</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', background: accentLight, color: accent, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>Our Services</div>
            <h2 style={{ fontSize: 40, fontWeight: 800 }}>Comprehensive moving solutions</h2>
            <p style={{ fontSize: 16, color: muted, marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>From packing to delivery, we handle every aspect of your move.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: '🚛', title: 'Long Distance', desc: 'Coast-to-coast with guaranteed delivery windows' },
              { icon: '📦', title: 'Packing Services', desc: 'Professional packing with custom crating' },
              { icon: '🏢', title: 'Commercial', desc: 'Office moves with minimal downtime' },
              { icon: '🔒', title: 'Storage', desc: 'Climate-controlled, 24/7 monitored' },
              { icon: '🚗', title: 'Auto Transport', desc: 'Open and enclosed vehicle shipping' },
              { icon: '🌍', title: 'International', desc: 'Door-to-door with customs support' },
            ].map(s => (
              <div key={s.title} style={{ padding: 28, borderRadius: 20, border: `1px solid ${border}`, background: surfaceBg }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>{s.desc}</p>
                <div style={{ color: accent, fontSize: 14, fontWeight: 600, marginTop: 16, display: 'flex', alignItems: 'center', gap: 4 }}>Learn more <ChevronRight size={14} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', background: accentLight, color: accent, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>Reviews</div>
            <h2 style={{ fontSize: 40, fontWeight: 800 }}>Loved by thousands</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16 }}>{[1,2,3,4,5].map(s => <Star key={s} size={20} fill={accent} color={accent} />)}</div>
            <div style={{ fontSize: 14, color: muted, marginTop: 8 }}>4.9/5 from 12,847 verified reviews</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[...content.testimonials, { name: 'Maria G.', location: 'Phoenix', text: 'The AI quote was within $30 of the final price. No surprises.' }, { name: 'David R.', location: 'Seattle', text: 'GPS tracking gave us total peace of mind during our cross-country move.' }].map((t, i) => (
              <div key={i} style={{ padding: 28, borderRadius: 20, border: `1px solid ${border}`, background: surfaceBg }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={accent} color={accent} />)}</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: accent }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: muted }}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '64px 64px', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', background: accentLight, color: accent, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>Free Quote</div>
            <h2 style={{ fontSize: 40, fontWeight: 800 }}>Get your estimate</h2>
            <p style={{ fontSize: 16, color: muted, marginTop: 8 }}>AI-powered estimates in under 60 seconds.</p>
          </div>
          {['Full Name', 'Email', 'Phone', 'Moving From', 'Moving To', 'Move Date'].map(f => (
            <div key={f} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: muted }}>{f}</label>
              <div style={{ background: surfaceBg, border: `1px solid ${border}`, borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>{f}...</div>
            </div>
          ))}
          <div style={{ background: accent, color: '#fff', padding: 14, borderRadius: 12, textAlign: 'center', fontWeight: 700, marginTop: 20 }}>{content.cta} →</div>
        </div>
      )}

      <div style={{ padding: '40px 64px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13, marginTop: 40 }}>
        <span>© 2025 TruMove</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 3. ENTERPRISE DARK FORM — Ceros-inspired
//    Dark, dense, data-rich. Monospace accents. Grid-heavy.
//    Form-integrated hero. Geometric shapes. Corporate gravitas.
// ══════════════════════════════════════════════════════════════════

function EnterpriseDarkForm({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#08090d' : '#fafbfc';
  const fg = darkMode ? '#e4e4e7' : '#18181b';
  const muted = darkMode ? '#52525b' : '#a1a1aa';
  const accent = '#a1a1aa';
  const greenAccent = '#22c55e';
  const cardBg = darkMode ? '#111318' : '#ffffff';
  const border = darkMode ? '#1f2028' : '#e4e4e7';
  const monoFont = "'SF Mono', 'Fira Code', 'Courier New', monospace";

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Nav — monospace, industrial */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 60px', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: greenAccent }} />
          <span style={{ fontSize: 14, fontWeight: 600, fontFamily: monoFont, letterSpacing: 2 }}>TRUMOVE</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 12, fontFamily: monoFont, color: muted }}>
          <span>PLATFORM</span><span>SOLUTIONS</span><span>CLIENTS</span><span>CONTACT</span>
        </div>
        <div style={{ border: `1px solid ${accent}`, color: fg, padding: '8px 20px', fontSize: 12, fontFamily: monoFont, letterSpacing: 1 }}>REQUEST DEMO</div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero: data terminal aesthetic */}
          <div style={{ padding: '80px 60px', display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 80, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: monoFont, color: greenAccent, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: greenAccent }} />
                SYSTEM ONLINE — ACCEPTING NEW CLIENTS
              </div>
              <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, letterSpacing: -3 }}>
                Enterprise<br />Relocation<br />
                <span style={{ color: muted }}>Infrastructure.</span>
              </h1>
              <p style={{ fontSize: 16, color: muted, marginTop: 28, lineHeight: 1.8, maxWidth: 500 }}>
                {content.subheadline}. Military-grade logistics for corporate relocation at scale.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginTop: 48, background: border }}>
                {content.stats.slice(0, 3).map(s => (
                  <div key={s.label} style={{ background: bg, padding: '24px 20px' }}>
                    <div style={{ fontSize: 11, fontFamily: monoFont, color: muted, letterSpacing: 2, marginBottom: 8 }}>{s.label.toUpperCase()}</div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Terminal-style form */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, padding: 0 }}>
              <div style={{ padding: '12px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: '#ef4444' }} />
                <div style={{ width: 8, height: 8, borderRadius: 999, background: '#eab308' }} />
                <div style={{ width: 8, height: 8, borderRadius: 999, background: greenAccent }} />
                <span style={{ fontSize: 11, fontFamily: monoFont, color: muted, marginLeft: 8 }}>quote_request.sh</span>
              </div>
              <div style={{ padding: 24 }}>
                {['COMPANY', 'CONTACT', 'EMAIL', 'EMPLOYEES', 'ORIGIN', 'DESTINATION'].map(f => (
                  <div key={f} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontFamily: monoFont, color: muted, letterSpacing: 2, marginBottom: 4 }}>{f}</div>
                    <div style={{ background: bg, border: `1px solid ${border}`, padding: '10px 12px', fontSize: 13, fontFamily: monoFont }}><span style={{ color: greenAccent }}>▸</span> _</div>
                  </div>
                ))}
                <div style={{ background: fg, color: bg, padding: 12, textAlign: 'center', fontSize: 12, fontFamily: monoFont, letterSpacing: 2, marginTop: 8 }}>EXECUTE →</div>
              </div>
            </div>
          </div>

          {/* Capabilities grid — dense, data-like */}
          <div style={{ padding: '0 60px 80px' }}>
            <div style={{ fontSize: 11, fontFamily: monoFont, color: muted, letterSpacing: 2, marginBottom: 24 }}>CAPABILITIES</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: border }}>
              {[
                { num: '01', title: 'AI Route Optimization', desc: 'Machine learning models optimize every route for cost and speed.' },
                { num: '02', title: 'Real-Time Tracking', desc: 'GPS telemetry on every vehicle, updated every 30 seconds.' },
                { num: '03', title: 'Predictive Pricing', desc: 'Historical data analysis for the most accurate quotes in the industry.' },
                { num: '04', title: 'Compliance Engine', desc: 'Automated FMCSA, DOT, and state-level regulatory compliance.' },
                { num: '05', title: 'API Integrations', desc: 'Connect with your HRIS, ERP, and relocation management systems.' },
                { num: '06', title: 'Enterprise SLA', desc: '99.9% uptime guarantee with dedicated support and escalation paths.' },
              ].map(c => (
                <div key={c.num} style={{ background: bg, padding: 32 }}>
                  <div style={{ fontSize: 11, fontFamily: monoFont, color: greenAccent, marginBottom: 16 }}>{c.num}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{c.title}</div>
                  <p style={{ fontSize: 13, color: muted, lineHeight: 1.7 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '60px 60px' }}>
          <div style={{ fontSize: 11, fontFamily: monoFont, color: greenAccent, letterSpacing: 2, marginBottom: 16 }}>SOLUTIONS</div>
          <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 60 }}>Enterprise Solutions</h2>
          {[
            { title: 'Corporate Relocation', metrics: '120+ enterprise clients', desc: 'End-to-end employee relocation with dedicated project managers, temp housing, and spousal career support.' },
            { title: 'Office Migration', metrics: '99.7% on-time delivery', desc: 'Zero-downtime office moves with IT equipment handling, furniture installation, and after-hours scheduling.' },
            { title: 'Executive Services', metrics: 'White-glove tier', desc: 'Confidential, fully insured C-suite relocations handled by our most senior crews.' },
            { title: 'International Transfers', metrics: '40+ countries', desc: 'Customs brokerage, freight forwarding, visa support, and destination services worldwide.' },
          ].map((s, i) => (
            <div key={s.title} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 200px', gap: 32, padding: '32px 0', borderTop: `1px solid ${border}`, alignItems: 'start' }}>
              <div style={{ fontSize: 11, fontFamily: monoFont, color: muted }}>0{i + 1}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
              <div style={{ fontSize: 12, fontFamily: monoFont, color: greenAccent, textAlign: 'right', paddingTop: 4 }}>{s.metrics}</div>
            </div>
          ))}
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '60px 60px' }}>
          <div style={{ fontSize: 11, fontFamily: monoFont, color: greenAccent, letterSpacing: 2, marginBottom: 16 }}>CLIENT FEEDBACK</div>
          <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 60 }}>What Our Clients Report</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: border }}>
            {[
              { name: 'Sarah Mitchell', role: 'VP People Ops, Acme Corp', text: 'Relocated 120 employees across 3 states in under 60 days. Zero complaints.', metric: '0 incidents' },
              { name: 'James Park', role: 'CFO, Summit Healthcare', text: 'Cost transparency was refreshing. No surprise invoices.', metric: '-12% under budget' },
              { name: 'Linda Torres', role: 'HR Director, Finova', text: 'Dedicated PM made the entire office move seamless. Back online in 24hrs.', metric: '24hr recovery' },
              { name: 'David Chen', role: 'COO, TechBridge', text: 'International relocation handled flawlessly — customs, housing, onboarding.', metric: '40+ countries' },
            ].map((t, i) => (
              <div key={i} style={{ background: bg, padding: 32 }}>
                <div style={{ fontSize: 11, fontFamily: monoFont, color: greenAccent, marginBottom: 16 }}>{t.metric}</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: muted, fontFamily: monoFont }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '60px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: monoFont, color: greenAccent, letterSpacing: 2, marginBottom: 16 }}>CONTACT</div>
            <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 20 }}>Request a<br />Consultation</h2>
            <p style={{ fontSize: 15, color: muted, lineHeight: 1.8, marginBottom: 40 }}>Our enterprise team will prepare a custom proposal within 24 hours. No obligation.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: border }}>
              {[{ label: 'RESPONSE TIME', value: '< 24hrs' }, { label: 'DEDICATED PM', value: 'Included' }, { label: 'CUSTOM PRICING', value: 'Volume rates' }, { label: 'SLA GUARANTEE', value: '99.9% uptime' }].map(m => (
                <div key={m.label} style={{ background: bg, padding: 20 }}>
                  <div style={{ fontSize: 10, fontFamily: monoFont, color: muted, letterSpacing: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: cardBg, border: `1px solid ${border}`, padding: 32 }}>
            <div style={{ fontSize: 12, fontFamily: monoFont, color: muted, letterSpacing: 2, marginBottom: 24 }}>ENTERPRISE INQUIRY</div>
            {['Company Name', 'Contact Name', 'Work Email', 'Phone', 'Employees to Relocate', 'Origin', 'Destination', 'Timeline'].map(f => (
              <div key={f} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontFamily: monoFont, color: muted, letterSpacing: 2, marginBottom: 4 }}>{f.toUpperCase()}</div>
                <div style={{ background: bg, border: `1px solid ${border}`, padding: '10px 12px', fontSize: 13 }}></div>
              </div>
            ))}
            <div style={{ background: fg, color: bg, padding: 12, textAlign: 'center', fontSize: 12, fontFamily: monoFont, letterSpacing: 2, marginTop: 12 }}>SUBMIT REQUEST →</div>
          </div>
        </div>
      )}

      <div style={{ padding: '32px 60px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: monoFont, color: muted, letterSpacing: 1, marginTop: 40 }}>
        <span>© 2025 TRUMOVE ENTERPRISE</span>
        <div style={{ display: 'flex', gap: 24 }}><span>PRIVACY</span><span>TERMS</span><span>SECURITY</span></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 4. PROMO DARK GRADIENT — Madgicx-inspired
//    Vibrant gradients, glow effects, urgent promo banners,
//    bold CTAs, emoji-rich, festival/launch energy.
// ══════════════════════════════════════════════════════════════════

function PromoDarkGradient({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const solidBg = darkMode ? '#0a0118' : '#fefbff';
  const fg = darkMode ? '#ffffff' : '#1a0533';
  const muted = darkMode ? '#b4a0d4' : '#7e5cad';
  const mutedText = darkMode ? '#9890a8' : '#888';
  const purple = '#a855f7';
  const indigo = '#6366f1';
  const pink = '#ec4899';
  const border = darkMode ? '#2a1945' : '#ede9fe';
  const cardBg = darkMode ? '#13082a' : '#ffffff';
  const glowShadow = darkMode ? `0 0 80px ${purple}30, 0 0 160px ${indigo}15` : `0 20px 60px ${purple}15`;

  return (
    <div style={{ background: darkMode ? 'linear-gradient(180deg, #0a0118 0%, #120828 30%, #0d0420 100%)' : 'linear-gradient(180deg, #fefbff 0%, #f5f0ff 30%, #fefbff 100%)', color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Promo banner — animated feel */}
      <div style={{ background: `linear-gradient(90deg, ${pink}, ${purple}, ${indigo})`, color: '#fff', textAlign: 'center', padding: '12px', fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>
        🔥 FLASH SALE: 30% Off All Moves — Ends in 48 Hours ⏰
      </div>

      {/* Nav with gradient CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 64px' }}>
        <span style={{ fontSize: 22, fontWeight: 800, background: `linear-gradient(135deg, ${purple}, ${pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TruMove</span>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: mutedText, fontWeight: 500 }}>
          <span>Home</span><span>Deals</span><span>Reviews</span><span>Get Quote</span>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${purple}, ${indigo})`, color: '#fff', padding: '10px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, boxShadow: `0 4px 24px ${purple}50` }}>
          Claim 30% Off →
        </div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero: gradient text, glow effects */}
          <div style={{ textAlign: 'center', padding: '100px 64px 60px', position: 'relative' }}>
            {/* Background glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${purple}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${purple}20`, color: purple, padding: '8px 20px', borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 32, border: `1px solid ${purple}30` }}>
                ⚡ AI-Powered Moving • Save Up to $2,000
              </div>
              <h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3 }}>
                Your Dream Move,<br />
                <span style={{ background: `linear-gradient(135deg, ${purple}, ${pink}, ${indigo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Half the Price.</span>
              </h1>
              <p style={{ fontSize: 20, color: mutedText, marginTop: 24, maxWidth: 600, margin: '24px auto 0', lineHeight: 1.6 }}>
                {content.subheadline}. Limited-time savings on every route.
              </p>
              <div style={{ marginTop: 40, display: 'flex', gap: 16, justifyContent: 'center' }}>
                <div style={{ background: `linear-gradient(135deg, ${purple}, ${indigo})`, color: '#fff', padding: '18px 48px', borderRadius: 14, fontSize: 18, fontWeight: 800, boxShadow: glowShadow }}>
                  🎉 Get 30% Off Now
                </div>
                <div style={{ border: `1px solid ${border}`, padding: '18px 32px', borderRadius: 14, fontSize: 16, color: mutedText, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Play size={18} /> See How It Works
                </div>
              </div>
              <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 40, fontSize: 14, color: muted }}>
                <span>✓ No deposit required</span><span>✓ Free cancellation</span><span>✓ Price-match guarantee</span>
              </div>
            </div>
          </div>

          {/* Savings calculator showcase */}
          <div style={{ margin: '20px 64px 60px', borderRadius: 20, border: `1px solid ${border}`, background: cardBg, overflow: 'hidden', boxShadow: glowShadow }}>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>💰 Savings Calculator</span>
              <span style={{ fontSize: 13, color: muted }}>See how much you save with TruMove</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
              {[
                { route: 'LA → NYC', normal: '$4,200', ours: '$2,940', save: '$1,260' },
                { route: 'Chicago → Miami', normal: '$3,100', ours: '$2,170', save: '$930' },
                { route: 'Seattle → Austin', normal: '$3,800', ours: '$2,660', save: '$1,140' },
                { route: 'Boston → Denver', normal: '$3,600', ours: '$2,520', save: '$1,080' },
              ].map(r => (
                <div key={r.route} style={{ padding: 24, borderRight: `1px solid ${border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{r.route}</div>
                  <div style={{ fontSize: 13, color: muted, textDecoration: 'line-through', marginBottom: 4 }}>{r.normal}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: purple }}>{r.ours}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', marginTop: 4, background: '#22c55e15', padding: '2px 10px', borderRadius: 999, display: 'inline-block' }}>Save {r.save}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats with gradient numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '0 64px 80px' }}>
            {content.stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: 28, borderRadius: 16, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ fontSize: 36, fontWeight: 900, background: `linear-gradient(135deg, ${purple}, ${pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: mutedText, marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', background: `${purple}20`, color: purple, padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, marginBottom: 16, border: `1px solid ${purple}30` }}>🚀 Services</div>
            <h2 style={{ fontSize: 48, fontWeight: 900 }}>What's <span style={{ background: `linear-gradient(135deg, ${purple}, ${pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Included</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { emoji: '🚛', title: 'Long Distance', price: 'From $1,499', desc: 'GPS-tracked, insured, guaranteed windows.' },
              { emoji: '📦', title: 'Full Packing', price: 'From $499', desc: 'Professional packers with premium materials.' },
              { emoji: '🏢', title: 'Office Moves', price: 'Custom', desc: 'Weekend moves, IT handling, zero downtime.' },
              { emoji: '🔒', title: 'Storage', price: 'From $99/mo', desc: 'Climate-controlled, 24/7 access & security.' },
              { emoji: '🚗', title: 'Auto Transport', price: 'From $799', desc: 'Open or enclosed, door-to-door nationwide.' },
              { emoji: '🌍', title: 'International', price: 'Custom', desc: 'Customs, freight, and destination support.' },
            ].map(s => (
              <div key={s.title} style={{ padding: 28, borderRadius: 16, border: `1px solid ${border}`, background: cardBg, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{s.emoji}</div>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: purple, marginBottom: 8 }}>{s.price}</div>
                <p style={{ fontSize: 13, color: mutedText, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 48, fontWeight: 900 }}>💜 Loved by <span style={{ background: `linear-gradient(135deg, ${purple}, ${pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>50,000+</span> Movers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              ...content.testimonials,
              { name: 'Maria G.', location: 'Phoenix', text: 'The promo was real — saved $800 on our cross-country move!' },
              { name: 'Robert L.', location: 'Chicago', text: 'Everything handled with care. Will absolutely use again for our next move.' },
            ].map((t, i) => (
              <div key={i} style={{ padding: 28, borderRadius: 16, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>{[1,2,3,4,5].map(s => <Star key={s} size={16} fill={purple} color={purple} />)}</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name} · <span style={{ color: mutedText, fontWeight: 400 }}>{t.location}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '64px 64px', maxWidth: 580, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', background: `${purple}20`, color: purple, padding: '8px 20px', borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 16, border: `1px solid ${purple}30` }}>🔥 30% Off Expires Soon</div>
            <h2 style={{ fontSize: 44, fontWeight: 900 }}>Lock In Your <span style={{ background: `linear-gradient(135deg, ${purple}, ${pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Savings</span></h2>
            <p style={{ fontSize: 16, color: mutedText, marginTop: 12 }}>AI quote in 60 seconds. No obligation.</p>
          </div>
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: 32, boxShadow: glowShadow }}>
            {['Full Name', 'Email Address', 'Phone Number', 'Moving From', 'Moving To', 'Move Date'].map(f => (
              <div key={f} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: mutedText }}>{f}</label>
                <div style={{ background: solidBg, border: `1px solid ${border}`, borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>{f}...</div>
              </div>
            ))}
            <div style={{ background: `linear-gradient(135deg, ${purple}, ${indigo})`, color: '#fff', padding: '16px', borderRadius: 12, textAlign: 'center', fontWeight: 800, fontSize: 16, marginTop: 8, boxShadow: `0 4px 24px ${purple}50` }}>🎉 Get Quote — Save 30%</div>
            <p style={{ fontSize: 12, color: mutedText, textAlign: 'center', marginTop: 10 }}>No credit card • Free cancellation</p>
          </div>
        </div>
      )}

      <div style={{ padding: '40px 64px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: mutedText, fontSize: 13, marginTop: 40 }}>
        <span>© 2025 TruMove</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 5. CORPORATE LIGHT VIDEO — GoHighLevel-inspired
//    SaaS platform feel. Light & airy. Feature comparison tables.
//    Video hero placeholder. Pricing-oriented. Trust badges.
// ══════════════════════════════════════════════════════════════════

function CorporateLightVideo({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0f172a' : '#ffffff';
  const fg = darkMode ? '#f1f5f9' : '#0f172a';
  const muted = darkMode ? '#64748b' : '#94a3b8';
  const accent = '#2563eb';
  const accentBg = darkMode ? '#2563eb15' : '#eff6ff';
  const cardBg = darkMode ? '#1e293b' : '#f8fafc';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const green = '#22c55e';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Top trust bar */}
      <div style={{ background: darkMode ? '#020617' : '#f1f5f9', textAlign: 'center', padding: '8px', fontSize: 12, color: muted, display: 'flex', justifyContent: 'center', gap: 24, fontWeight: 500 }}>
        <span>⭐ 4.9/5 on G2</span>
        <span>🏆 Leader — Moving Platform 2025</span>
        <span>🔒 SOC 2 Type II Certified</span>
      </div>

      {/* Nav with dual CTAs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 64px', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 800 }}>TruMove</span>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: muted, fontWeight: 500 }}>
            <span>Platform</span><span>Solutions</span><span>Pricing</span><span>Resources</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: muted, fontWeight: 500, padding: '8px 16px' }}>Sign in</div>
          <div style={{ background: accent, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Start Free Trial</div>
        </div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero with video placeholder */}
          <div style={{ textAlign: 'center', padding: '80px 64px 40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentBg, color: accent, padding: '6px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
              <Award size={14} /> Rated #1 Platform for Moving Companies
            </div>
            <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.12, letterSpacing: -2, maxWidth: 800, margin: '0 auto' }}>
              The all-in-one platform to <span style={{ color: accent }}>grow your moving business</span>
            </h1>
            <p style={{ fontSize: 18, color: muted, marginTop: 20, maxWidth: 600, margin: '20px auto 0', lineHeight: 1.7 }}>
              CRM, quoting, dispatch, tracking, and marketing — all in one place. Try free for 14 days.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
              <div style={{ background: accent, color: '#fff', padding: '14px 36px', borderRadius: 8, fontSize: 16, fontWeight: 700 }}>Start Free Trial →</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 8, border: `1px solid ${border}`, color: muted, fontSize: 15 }}>
                <Play size={16} fill={accent} color={accent} /> Watch demo (2 min)
              </div>
            </div>
            <div style={{ fontSize: 13, color: muted, marginTop: 16 }}>No credit card required · Setup in 5 minutes</div>
          </div>

          {/* Video/dashboard placeholder */}
          <div style={{ margin: '20px 64px 60px', borderRadius: 16, border: `1px solid ${border}`, background: darkMode ? '#0c1628' : '#f8fafc', overflow: 'hidden', boxShadow: darkMode ? 'none' : '0 20px 80px -20px rgba(37,99,235,0.15)' }}>
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${border}`, display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: 999, background: '#eab308' }} />
              <div style={{ width: 10, height: 10, borderRadius: 999, background: '#22c55e' }} />
            </div>
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: 80, height: 80, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${accent}40` }}>
                <Play size={32} fill="#fff" color="#fff" />
              </div>
              <div style={{ position: 'absolute', bottom: 20, fontSize: 13, color: muted }}>Platform Demo — See TruMove in action</div>
            </div>
          </div>

          {/* Logo strip */}
          <div style={{ textAlign: 'center', padding: '24px 64px 48px' }}>
            <div style={{ fontSize: 12, color: muted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>Trusted by 5,000+ moving companies</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
              {content.logos.map(l => <span key={l} style={{ fontSize: 15, color: muted, fontWeight: 600, opacity: 0.4 }}>{l}</span>)}
            </div>
          </div>

          {/* Feature comparison table — unique to this template */}
          <div style={{ padding: '48px 64px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800 }}>Why teams switch to TruMove</h2>
            </div>
            <div style={{ border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: cardBg }}>
                <div style={{ padding: '14px 24px', fontSize: 13, fontWeight: 700, borderBottom: `1px solid ${border}` }}>Feature</div>
                <div style={{ padding: '14px 24px', fontSize: 13, fontWeight: 700, color: accent, textAlign: 'center', borderBottom: `1px solid ${border}` }}>TruMove</div>
                <div style={{ padding: '14px 24px', fontSize: 13, fontWeight: 700, color: muted, textAlign: 'center', borderBottom: `1px solid ${border}` }}>Competitor A</div>
                <div style={{ padding: '14px 24px', fontSize: 13, fontWeight: 700, color: muted, textAlign: 'center', borderBottom: `1px solid ${border}` }}>Competitor B</div>
              </div>
              {[
                ['AI Instant Quotes', true, false, false],
                ['Real-Time GPS Tracking', true, true, false],
                ['Built-in CRM', true, false, true],
                ['Marketing Automation', true, false, false],
                ['Mobile App', true, true, true],
                ['24/7 Phone Support', true, false, false],
              ].map(([feature, a, b, c], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: `1px solid ${border}` }}>
                  <div style={{ padding: '14px 24px', fontSize: 14 }}>{feature as string}</div>
                  <div style={{ padding: '14px 24px', textAlign: 'center', fontSize: 16 }}>{a ? <CheckCircle2 size={18} color={green} /> : <span style={{ color: muted }}>—</span>}</div>
                  <div style={{ padding: '14px 24px', textAlign: 'center', fontSize: 16 }}>{b ? <CheckCircle2 size={18} color={green} /> : <span style={{ color: muted }}>—</span>}</div>
                  <div style={{ padding: '14px 24px', textAlign: 'center', fontSize: 16 }}>{c ? <CheckCircle2 size={18} color={green} /> : <span style={{ color: muted }}>—</span>}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '0 64px 80px' }}>
            {content.stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: 28, borderRadius: 12, background: cardBg, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: accent }}>{s.value}</div>
                <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', background: accentBg, color: accent, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>Platform Features</div>
            <h2 style={{ fontSize: 40, fontWeight: 800 }}>Everything to run your moving business</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: <BarChart3 size={24} color={accent} />, title: 'Analytics Dashboard', desc: 'Track every metric: leads, revenue, conversion, utilization.' },
              { icon: <Users size={24} color={accent} />, title: 'CRM & Lead Management', desc: 'Full pipeline management from lead to delivery.' },
              { icon: <Zap size={24} color={accent} />, title: 'AI Quoting Engine', desc: 'Instant, accurate estimates that win more jobs.' },
              { icon: <MapPin size={24} color={accent} />, title: 'Dispatch & Tracking', desc: 'GPS fleet tracking with optimized route planning.' },
              { icon: <Globe size={24} color={accent} />, title: 'Marketing Suite', desc: 'SEO, PPC, and social tools to grow your leads.' },
              { icon: <Headphones size={24} color={accent} />, title: 'Customer Portal', desc: 'Self-service portal for customers to track their move.' },
            ].map(s => (
              <div key={s.title} style={{ padding: 28, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800 }}>Customer Success Stories</h2>
            <p style={{ fontSize: 16, color: muted, marginTop: 8 }}>See how moving companies grow with TruMove.</p>
          </div>

          {/* Featured case study */}
          <div style={{ padding: 32, borderRadius: 12, border: `1px solid ${border}`, background: cardBg, marginBottom: 24, marginTop: 40 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ background: accentBg, color: accent, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>Case Study</div>
              <div style={{ background: '#dcfce7', color: green, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>+340% Lead Growth</div>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>How Summit Movers Tripled Their Revenue</h3>
            <p style={{ fontSize: 15, color: muted, lineHeight: 1.7 }}>"TruMove's AI quoting converted 3x more website visitors into booked moves. The analytics dashboard helped us cut ad spend by 40% while increasing leads."</p>
            <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600 }}>— Alex Rivera, Owner, Summit Movers</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              ...content.testimonials,
              { name: 'Chris W.', location: 'Denver', text: 'Switched from spreadsheets to TruMove. Now I see every lead, truck, and dollar in real time.' },
              { name: 'Priya S.', location: 'Austin', text: 'The mobile app alone was worth it. My crews do everything from their phones now.' },
            ].map((t, i) => (
              <div key={i} style={{ padding: 24, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={accent} color={accent} />)}</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>"{t.text}"</p>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name} · <span style={{ color: muted, fontWeight: 400 }}>{t.location}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>Start your free trial</h2>
              <p style={{ fontSize: 16, color: muted, lineHeight: 1.7, marginBottom: 32 }}>14-day free trial. No credit card required. Setup in under 5 minutes.</p>
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { label: 'Unlimited quotes', desc: 'AI-powered instant estimates for your customers' },
                  { label: 'Full CRM access', desc: 'Manage leads, deals, and follow-ups from day one' },
                  { label: 'Analytics dashboard', desc: 'Track every metric that matters' },
                  { label: 'Priority support', desc: 'Live chat and phone support during trial' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', gap: 12 }}>
                    <CheckCircle2 size={18} color={green} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{f.label}</div>
                      <div style={{ fontSize: 13, color: muted }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: cardBg, borderRadius: 12, padding: 32, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Create Your Account</div>
              {['Full Name', 'Work Email', 'Company Name', 'Phone Number', 'Company Size'].map(f => (
                <div key={f} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4, color: muted }}>{f}</label>
                  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '11px 14px', fontSize: 14 }}>{f}...</div>
                </div>
              ))}
              <div style={{ background: accent, color: '#fff', padding: 14, borderRadius: 8, textAlign: 'center', fontWeight: 600, fontSize: 15, marginTop: 8 }}>Start Free Trial →</div>
              <p style={{ fontSize: 11, color: muted, textAlign: 'center', marginTop: 10 }}>No credit card required · Cancel anytime</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '40px 64px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13, marginTop: 40 }}>
        <span>© 2025 TruMove Platform Inc.</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span><span>Security</span></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 6. TOP 10 LISTICLE — Review/ranking site
// ══════════════════════════════════════════════════════════════════

function Top10Listicle({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0f1117' : '#ffffff';
  const fg = darkMode ? '#f1f5f9' : '#1a1a2e';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const accent = '#f59e0b';
  const cardBg = darkMode ? '#1a1d2e' : '#f8fafc';
  const border = darkMode ? '#2a2d3e' : '#e5e7eb';
  const greenBg = darkMode ? '#16a34a15' : '#16a34a10';
  const green = '#16a34a';

  const competitors = [
    { rank: 1, name: 'TruMove', rating: 4.9, reviews: 12847, badge: '🏆 Editor\'s Choice', highlight: true, pros: ['AI-powered instant quotes', 'Real-time GPS tracking', 'Full-value protection', '$0 hidden fees'], cons: ['Premium pricing'] },
    { rank: 2, name: 'SafeShip Movers', rating: 4.6, reviews: 8234, badge: null, highlight: false, pros: ['Good customer service', 'Nationwide coverage'], cons: ['Slow quote process', 'Extra fees for stairs'] },
    { rank: 3, name: 'QuickHaul Express', rating: 4.5, reviews: 6891, badge: null, highlight: false, pros: ['Fast delivery times', 'Budget options'], cons: ['Limited tracking', 'Insurance extra'] },
    { rank: 4, name: 'HomeRun Relocations', rating: 4.3, reviews: 5102, badge: null, highlight: false, pros: ['Family-owned', 'Flexible scheduling'], cons: ['Regional only', 'No online booking'] },
    { rank: 5, name: 'PrimeMove Co.', rating: 4.2, reviews: 4567, badge: null, highlight: false, pros: ['Corporate packages', 'Storage options'], cons: ['Higher minimums', 'Slower response'] },
    { rank: 6, name: 'EasyGo Movers', rating: 4.1, reviews: 3890, badge: null, highlight: false, pros: ['Low prices', 'Simple booking'], cons: ['Limited insurance', 'Few reviews'] },
    { rank: 7, name: 'TransNation', rating: 4.0, reviews: 3201, badge: null, highlight: false, pros: ['International moves', 'Multi-language'], cons: ['Complex pricing', 'Long wait times'] },
    { rank: 8, name: 'BudgetBox Movers', rating: 3.9, reviews: 2890, badge: null, highlight: false, pros: ['Cheapest option', 'DIY packages'], cons: ['Minimal service', 'No packing help'] },
    { rank: 9, name: 'SwiftLine Moving', rating: 3.8, reviews: 2345, badge: null, highlight: false, pros: ['Fast estimates', 'Weekend availability'], cons: ['Small fleet', 'Limited areas'] },
    { rank: 10, name: 'ValuePack Relocation', rating: 3.7, reviews: 1980, badge: null, highlight: false, pros: ['Bundle deals', 'Student discounts'], cons: ['Inconsistent quality', 'Few trucks'] },
  ];

  const kw = content.headline.split(' in ')[0]?.replace('Expert ', '') || 'Long Distance Moving';
  const loc = content.headline.split(' in ')[1] || 'Your Area';
  const year = new Date().getFullYear();

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 80px', borderBottom: `1px solid ${border}` }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>MovingReviews<span style={{ color: accent }}>.com</span></span>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: muted }}>
          <span>Home</span><span>Categories</span><span>How We Rank</span><span>About</span>
        </div>
        <div style={{ fontSize: 12, color: muted }}>Last Updated: Feb {year}</div>
      </div>

      {page === 'home' && (
        <>
          <div style={{ padding: '64px 80px 48px', maxWidth: 900 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{ background: accent + '20', color: accent, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>✅ Updated for {year}</span>
              <span style={{ background: greenBg, color: green, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>Independently Reviewed</span>
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, letterSpacing: -1 }}>
              Top 10 Best {kw} Companies in {loc} ({year})
            </h1>
            <p style={{ fontSize: 17, color: muted, marginTop: 16, lineHeight: 1.7 }}>
              We researched and compared {competitors.length} {kw.toLowerCase()} companies based on pricing, customer reviews, insurance coverage, and service quality.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 24, fontSize: 13, color: muted }}>
              <span>📋 {competitors.length} Companies Reviewed</span>
              <span>⏱️ 47 Hours of Research</span>
              <span>👥 12,000+ Customer Surveys</span>
            </div>
          </div>

          <div style={{ margin: '0 80px', padding: '20px 24px', background: cardBg, borderRadius: 12, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>🏆 Quick Pick:</span>
            <span style={{ fontSize: 14 }}><strong>TruMove</strong> — Best overall for {kw.toLowerCase()}. AI-powered quotes, 4.9★ rating, full-value protection.</span>
            <div style={{ marginLeft: 'auto', background: green, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>Get Free Quote →</div>
          </div>

          <div style={{ padding: '0 80px 64px' }}>
            {competitors.map((c) => (
              <div key={c.rank} style={{
                padding: 28, marginBottom: 16, borderRadius: 12,
                border: c.highlight ? `2px solid ${accent}` : `1px solid ${border}`,
                background: c.highlight ? (darkMode ? '#1a1d2e' : '#fffbeb') : cardBg,
                position: 'relative',
              }}>
                {c.badge && (
                  <div style={{ position: 'absolute', top: -12, left: 24, background: accent, color: '#fff', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{c.badge}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: c.highlight ? accent : muted, minWidth: 48, textAlign: 'center', lineHeight: 1 }}>#{c.rank}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 22, fontWeight: 800 }}>{c.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= Math.floor(c.rating) ? accent : 'transparent'} color={accent} />)}
                        <span style={{ fontSize: 14, fontWeight: 700, marginLeft: 4 }}>{c.rating}</span>
                        <span style={{ fontSize: 12, color: muted }}>({c.reviews.toLocaleString()} reviews)</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: green, marginBottom: 6 }}>Pros</div>
                        {c.pros.map((p, i) => (
                          <div key={i} style={{ fontSize: 13, display: 'flex', gap: 6, marginBottom: 4 }}>
                            <CheckCircle2 size={14} color={green} style={{ marginTop: 2, flexShrink: 0 }} /> {p}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#ef4444', marginBottom: 6 }}>Cons</div>
                        {c.cons.map((con, i) => (
                          <div key={i} style={{ fontSize: 13, color: muted, display: 'flex', gap: 6, marginBottom: 4 }}>
                            <span style={{ color: '#ef4444', flexShrink: 0 }}>−</span> {con}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 140 }}>
                    <div style={{
                      background: c.highlight ? green : (darkMode ? '#ffffff15' : '#f1f5f9'),
                      color: c.highlight ? '#fff' : fg,
                      padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, textAlign: 'center', width: '100%',
                    }}>
                      {c.highlight ? 'Get Free Quote' : 'Visit Site'}
                    </div>
                    <span style={{ fontSize: 11, color: muted }}>Free · No obligation</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, background: cardBg }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>How We Rank</h2>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.7, maxWidth: 700 }}>
              Our rankings are based on a weighted scoring system: Customer Reviews (35%), Pricing Transparency (25%), Insurance & Protection (20%), Service Coverage (10%), and Technology & Tracking (10%). We update monthly and accept no payment for placement.
            </p>
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '64px 80px' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>How We Review Moving Companies</h2>
          <p style={{ fontSize: 15, color: muted, marginBottom: 40, lineHeight: 1.7, maxWidth: 700 }}>
            Our editorial team evaluates every company using a rigorous, multi-factor methodology. No company can pay for a higher ranking.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 48 }}>
            {[
              { title: 'Customer Reviews', weight: '35%', desc: 'We aggregate reviews from Google, BBB, Yelp, and proprietary surveys. Only verified moves count.' },
              { title: 'Pricing Transparency', weight: '25%', desc: 'We request and compare quotes, checking for hidden fees, binding estimates, and price accuracy.' },
              { title: 'Insurance & Protection', weight: '20%', desc: 'We verify FMCSA licensing, liability coverage, full-value protection options, and claims resolution rates.' },
              { title: 'Service Coverage', weight: '10%', desc: 'We evaluate geographic reach, specialty services (auto transport, storage), and response times.' },
              { title: 'Technology & Tracking', weight: '10%', desc: 'We assess online booking, GPS tracking, digital inventory tools, and communication quality.' },
              { title: 'Monthly Re-evaluation', weight: 'Ongoing', desc: 'Rankings are updated monthly as we collect new data, monitor complaints, and re-score all companies.' },
            ].map((item) => (
              <div key={item.title} style={{ padding: 24, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{item.title}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: accent, background: accent + '15', padding: '3px 10px', borderRadius: 999 }}>{item.weight}</span>
                </div>
                <p style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: 28, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Editorial Independence</h3>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>
              MovingReviews.com maintains full editorial independence. Companies cannot pay for rankings or influence our scores. We may earn a referral fee when you request a quote through our links, but this never affects our rankings.
            </p>
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '64px 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Reader Reviews & Ratings</h2>
              <p style={{ fontSize: 15, color: muted }}>Real experiences from verified customers across {loc}.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: accent, lineHeight: 1 }}>4.9</div>
              <div style={{ display: 'flex', gap: 2, justifyContent: 'center', margin: '6px 0' }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={accent} color={accent} />)}</div>
              <div style={{ fontSize: 12, color: muted }}>12,847 verified reviews</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 32, padding: 24, background: cardBg, borderRadius: 12, border: `1px solid ${border}` }}>
            {[
              { stars: 5, pct: 78 }, { stars: 4, pct: 14 }, { stars: 3, pct: 5 }, { stars: 2, pct: 2 }, { stars: 1, pct: 1 },
            ].map(r => (
              <div key={r.stars} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{r.stars}★</div>
                <div style={{ height: 6, borderRadius: 3, background: border, overflow: 'hidden' }}>
                  <div style={{ width: `${r.pct}%`, height: '100%', background: accent, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>{r.pct}%</div>
              </div>
            ))}
          </div>

          {[
            { name: 'Patricia L.', loc: loc, date: 'Jan 2026', rating: 5, title: 'Best moving experience ever', text: `TruMove made our ${kw.toLowerCase()} completely stress-free. The AI quote was within $50 of the final price and we could track our belongings the entire way.`, helpful: 47 },
            { name: 'David R.', loc: 'Houston, TX', date: 'Dec 2025', rating: 5, title: 'Accurate quotes, no surprises', text: 'After getting wildly different estimates from 5 other companies, TruMove\'s AI gave us an accurate price instantly. The movers arrived exactly on schedule.', helpful: 38 },
            { name: 'Michelle T.', loc: 'Miami, FL', date: 'Dec 2025', rating: 5, title: 'GPS tracking was a game-changer', text: 'Being able to see exactly where our stuff was during a cross-country move gave us so much peace of mind.', helpful: 31 },
            { name: 'Robert K.', loc: 'Phoenix, AZ', date: 'Nov 2025', rating: 4, title: 'Great service, minor delay', text: 'Overall excellent. Only 4 stars due to a one-day weather delay, but they communicated proactively and offered a discount.', helpful: 22 },
          ].map((review, i) => (
            <div key={i} style={{ padding: 24, borderRadius: 12, border: `1px solid ${border}`, background: cardBg, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: accent }}>{review.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{review.name}</div>
                    <div style={{ fontSize: 12, color: muted }}>{review.loc} · {review.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= review.rating ? accent : 'transparent'} color={accent} />)}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{review.title}</div>
              <p style={{ fontSize: 13, color: muted, lineHeight: 1.7 }}>{review.text}</p>
              <div style={{ marginTop: 12, fontSize: 12, color: muted }}>👍 {review.helpful} people found this helpful</div>
            </div>
          ))}
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '64px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Get Listed on MovingReviews</h2>
              <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, marginBottom: 32 }}>
                Are you a moving company? Submit your business for review. Our editorial team will evaluate your services using our standard methodology.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { step: '1', title: 'Submit Application', desc: 'Provide your company details, FMCSA/DOT number, and service areas.' },
                  { step: '2', title: 'Verification & Review', desc: 'We verify licensing, review customer feedback, and conduct a service evaluation.' },
                  { step: '3', title: 'Get Ranked', desc: 'Your company receives a score and placement based on our methodology.' },
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 999, background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{s.title}</div>
                      <p style={{ fontSize: 13, color: muted, marginTop: 2 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 32, padding: 20, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📊 Current Stats</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 13 }}>
                  <div><div style={{ fontWeight: 700 }}>2.4M+</div><div style={{ color: muted }}>Monthly visitors</div></div>
                  <div><div style={{ fontWeight: 700 }}>85,000+</div><div style={{ color: muted }}>Quotes generated</div></div>
                  <div><div style={{ fontWeight: 700 }}>4.8★</div><div style={{ color: muted }}>Trust rating</div></div>
                </div>
              </div>
            </div>
            <div style={{ padding: 32, borderRadius: 16, border: `1px solid ${border}`, background: cardBg }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Company Submission Form</div>
              {['Company Name', 'FMCSA / DOT Number', 'Contact Email', 'Phone Number', 'Headquarters City & State', 'Service Areas (states)', 'Years in Business', 'Website URL'].map(f => (
                <div key={f} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4, color: muted }}>{f}</label>
                  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '11px 14px', fontSize: 14 }}>{f}...</div>
                </div>
              ))}
              <div style={{ background: accent, color: '#fff', padding: 14, borderRadius: 8, textAlign: 'center', fontWeight: 700, fontSize: 15, marginTop: 8 }}>Submit for Review</div>
              <p style={{ fontSize: 11, color: muted, textAlign: 'center', marginTop: 10 }}>Free submission · Review takes 5-7 business days</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13, marginTop: 40 }}>
        <span>© {year} MovingReviews.com · Editorial Guidelines · Advertiser Disclosure</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span><span>Contact</span></div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export function WebsitePreviewBuilder({ selections, onBack }: WebsitePreviewBuilderProps) {
  const [template, setTemplate] = useState<TemplateStyle>('editorial-dark');
  const [darkMode, setDarkMode] = useState(true);
  const [isWebsite, setIsWebsite] = useState(selections.outputType === 'website');
  const [activePage, setActivePage] = useState<PageTab>('home');

  const content = getContent(selections);

  const renderTemplate = () => {
    const props = { content, page: activePage, darkMode };
    switch (template) {
      case 'editorial-dark': return <EditorialDark {...props} />;
      case 'clean-split-light': return <CleanSplitLight {...props} />;
      case 'enterprise-dark-form': return <EnterpriseDarkForm {...props} />;
      case 'promo-dark-gradient': return <PromoDarkGradient {...props} />;
      case 'corporate-light-video': return <CorporateLightVideo {...props} />;
      case 'top10-listicle': return <Top10Listicle {...props} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => { setIsWebsite(false); setActivePage('home'); }} className={cn("px-3 py-1.5 text-xs font-medium transition-colors", !isWebsite ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>Landing Page</button>
            <button onClick={() => { setIsWebsite(true); setActivePage('home'); }} className={cn("px-3 py-1.5 text-xs font-medium transition-colors", isWebsite ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>Website</button>
          </div>

          <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            {darkMode ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>

      {/* Template Picker */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
              template === t.id
                ? 'bg-foreground text-background border-foreground'
                : 'text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Website page tabs */}
      {isWebsite && (
        <div className="flex gap-1">
          {(['home', 'services', 'reviews', 'quote'] as PageTab[]).map(p => (
            <button
              key={p}
              onClick={() => setActivePage(p)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors",
                activePage === p ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p === 'quote' ? 'Quote Form' : p}
            </button>
          ))}
        </div>
      )}

      {/* Preview Canvas */}
      <div className="rounded-xl border border-border overflow-hidden">
        <ScaledPreview contentWidth={1440} scrollable>
          {renderTemplate()}
        </ScaledPreview>
      </div>
    </div>
  );
}
