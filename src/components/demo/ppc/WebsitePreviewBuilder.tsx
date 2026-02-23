import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon, ArrowLeft, Star, CheckCircle2, Phone, MapPin, Shield, Clock, Users, Truck, Quote, Play, ChevronRight, Zap, Award, ArrowRight, Lock, BarChart3, Globe, Headphones, Check, X } from "lucide-react";
import ScaledPreview from "@/components/ui/ScaledPreview";
import { BuildSelections } from "./AnalyticsBuilderPanel";
import { cn } from "@/lib/utils";
import { AutomationModeSelector } from "./AutomationModeSelector";

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
//    Pure black bg, massive centered white typography, stark contrast,
//    floating portfolio-style image placeholders, minimal nav
// ══════════════════════════════════════════════════════════════════

function EditorialDark({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#000000' : '#fafaf9';
  const fg = darkMode ? '#ffffff' : '#0c0a09';
  const muted = darkMode ? '#737373' : '#a3a3a3';
  const border = darkMode ? '#1a1a1a' : '#e5e5e5';
  const cardBg = darkMode ? '#0a0a0a' : '#f5f5f4';
  const accentGlow = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Minimal nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 80px' }}>
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>TruMove</span>
        <div style={{ display: 'flex', gap: 32, fontSize: 13, color: muted, fontWeight: 500 }}>
          <span>Work</span><span>Services</span><span>About</span>
        </div>
        <div style={{ border: `1px solid ${darkMode ? '#333' : '#ccc'}`, padding: '10px 28px', borderRadius: 999, fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>Get in touch</div>
      </div>

      {page === 'home' && (
        <>
          {/* Floating image cards around hero — Ubernatural style */}
          <div style={{ position: 'relative', padding: '120px 80px 80px', textAlign: 'center', minHeight: 700 }}>
            {/* Floating cards */}
            {[
              { top: 40, left: 60, w: 200, h: 140, rotate: -4 },
              { top: 20, right: 80, w: 220, h: 150, rotate: 3 },
              { bottom: 100, left: 100, w: 180, h: 130, rotate: 2 },
              { bottom: 80, right: 120, w: 200, h: 140, rotate: -3 },
            ].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute',
                ...(pos.top !== undefined ? { top: pos.top } : {}),
                ...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
                ...(pos.left !== undefined ? { left: pos.left } : {}),
                ...(pos.right !== undefined ? { right: pos.right } : {}),
                width: pos.w, height: pos.h,
                background: `linear-gradient(135deg, ${darkMode ? '#111' : '#e8e8e8'}, ${darkMode ? '#1a1a1a' : '#f0f0f0'})`,
                borderRadius: 12,
                transform: `rotate(${pos.rotate}deg)`,
                border: `1px solid ${border}`,
                opacity: 0.7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: muted, letterSpacing: 2,
              }}>
                <Truck size={24} style={{ opacity: 0.3 }} />
              </div>
            ))}

            {/* Center logo mark */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: darkMode ? '#fff' : '#000', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={20} color={darkMode ? '#000' : '#fff'} />
              </div>
            </div>

            <h1 style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3, maxWidth: 900, margin: '0 auto' }}>
              {content.headline.split(' in ')[0]}
              <br />
              <span style={{ color: muted }}>in {content.headline.split(' in ')[1] || 'Your City'}</span>
            </h1>
            <p style={{ fontSize: 18, color: muted, marginTop: 28, maxWidth: 520, margin: '28px auto 0', lineHeight: 1.7 }}>
              Need the best movers in the shortest timeframe? There's no one who does this better than us.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 40 }}>
              <div style={{ background: fg, color: bg, padding: '16px 36px', borderRadius: 999, fontSize: 15, fontWeight: 600 }}>Let's move</div>
              <div style={{ border: `1px solid ${darkMode ? '#333' : '#ccc'}`, padding: '16px 36px', borderRadius: 999, fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>How It Works <ArrowRight size={16} /></div>
            </div>
          </div>

          {/* Works / Portfolio section */}
          <div style={{ padding: '0 80px 80px' }}>
            <div style={{ fontSize: 12, color: muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Our Moves</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 40 }}>Recent Projects</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { title: 'Corporate HQ', tag: 'Commercial · 2025', h: 320 },
                { title: 'Beachside Villa', tag: 'Residential · 2025', h: 280 },
                { title: 'Tech Campus', tag: 'Enterprise · 2024', h: 300 },
              ].map(p => (
                <div key={p.title} style={{ background: cardBg, borderRadius: 16, overflow: 'hidden', border: `1px solid ${border}` }}>
                  <div style={{ height: p.h, background: `linear-gradient(180deg, ${darkMode ? '#111' : '#e8e8e8'}, ${darkMode ? '#0d0d0d' : '#f3f3f3'})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={32} style={{ opacity: 0.15 }} />
                  </div>
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{p.tag}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works — numbered steps */}
          <div style={{ padding: '80px 80px', borderTop: `1px solid ${border}` }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div style={{ fontSize: 12, color: muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Process</div>
              <h2 style={{ fontSize: 42, fontWeight: 700 }}>How It Works</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
              {[
                { n: '01', title: 'Request a Quote', desc: 'Tell us your origin, destination, and timeline. Get an AI-powered estimate in under 60 seconds.' },
                { n: '02', title: 'We Plan Everything', desc: 'Our team handles packing, logistics, scheduling, and insurance. Zero effort on your part.' },
                { n: '03', title: 'Relax & Track', desc: 'Real-time GPS tracking on every shipment. Know exactly where your belongings are, 24/7.' },
              ].map(s => (
                <div key={s.n} style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 999, border: `1px solid ${darkMode ? '#333' : '#ccc'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{s.n}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.title}</div>
                  <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats band */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: `1px solid ${border}` }}>
            {content.stats.map((s, i) => (
              <div key={s.label} style={{ padding: '48px 40px', textAlign: 'center', borderRight: i < 3 ? `1px solid ${border}` : 'none' }}>
                <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -2 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 8, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ padding: '100px 80px', textAlign: 'center', borderTop: `1px solid ${border}` }}>
            <h2 style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2, maxWidth: 700, margin: '0 auto', lineHeight: 1.1 }}>Ready to make your move?</h2>
            <p style={{ fontSize: 16, color: muted, marginTop: 20 }}>Let's create something remarkable together.</p>
            <div style={{ marginTop: 40, display: 'inline-block', background: fg, color: bg, padding: '18px 48px', borderRadius: 999, fontSize: 16, fontWeight: 600 }}>Get Started →</div>
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '80px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 12, color: muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>What We Do</div>
            <h2 style={{ fontSize: 48, fontWeight: 700 }}>Our Services</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: <Truck size={24} />, title: 'Long Distance', desc: 'Coast-to-coast relocation with guaranteed delivery windows and full GPS tracking.' },
              { icon: <MapPin size={24} />, title: 'Local Moving', desc: 'Same-day and next-day local moves with professional crews and premium equipment.' },
              { icon: <Globe size={24} />, title: 'International', desc: 'Door-to-door international moves with customs brokerage and destination services.' },
              { icon: <Shield size={24} />, title: 'Packing & Crating', desc: 'Custom packing solutions using museum-quality materials for maximum protection.' },
              { icon: <Lock size={24} />, title: 'Climate Storage', desc: '24/7 monitored, climate-controlled storage facilities in every major city.' },
              { icon: <Zap size={24} />, title: 'Auto Transport', desc: 'Open and enclosed vehicle shipping with real-time tracking and full insurance.' },
            ].map(s => (
              <div key={s.title} style={{ padding: 36, borderRadius: 16, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ opacity: 0.5, marginBottom: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '80px 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 12, color: muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Testimonials</div>
            <h2 style={{ fontSize: 48, fontWeight: 700 }}>What clients say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              ...content.testimonials,
              { name: 'Maria G.', location: 'Phoenix', text: 'The entire experience felt curated. Like someone actually cared about where my things ended up.' },
              { name: 'David R.', location: 'Seattle', text: 'GPS tracking gave us total peace of mind during our cross-country move. Would recommend to anyone.' },
              { name: 'Linda T.', location: 'Chicago', text: 'Relocated our entire office in one weekend. Zero downtime. The team was incredible.' },
              { name: 'Robert K.', location: 'Denver', text: 'Their AI quote was within $30 of the final price. No surprises, no hidden fees.' },
            ].map((t, i) => (
              <div key={i} style={{ padding: 36, borderRadius: 16, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ fontSize: 48, lineHeight: 1, opacity: 0.1, marginBottom: 8 }}>"</div>
                <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: darkMode ? '#222' : '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>{t.name[0]}</div>
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
        <div style={{ padding: '80px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
          <div>
            <div style={{ fontSize: 12, color: muted, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Contact</div>
            <h2 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>Let's talk.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: muted }}>Tell us about your move and we'll respond with a personalized plan within 24 hours. No pressure, no hidden fees.</p>
            <div style={{ marginTop: 48 }}>
              <div style={{ fontSize: 12, color: muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Or call directly</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>(800) 555-MOVE</div>
            </div>
          </div>
          <div style={{ padding: 40, borderRadius: 20, border: `1px solid ${border}`, background: cardBg }}>
            {['Full Name', 'Email', 'Phone', 'Moving From', 'Moving To', 'Preferred Date'].map(f => (
              <div key={f} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: muted }}>{f}</label>
                <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 16px', fontSize: 14 }} />
              </div>
            ))}
            <div style={{ background: fg, color: bg, padding: 16, borderRadius: 999, textAlign: 'center', fontWeight: 700, fontSize: 15, marginTop: 8 }}>Submit Request →</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '40px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 12 }}>
        <span>© 2025 TruMove</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span><span>Instagram</span></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 2. CLEAN SPLIT LIGHT — Pixel.ai-inspired
//    White bg, teal accent, split hero with CTA card, feature bullets,
//    browser mockup, "How it works" section, clean & airy
// ══════════════════════════════════════════════════════════════════

function CleanSplitLight({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0f172a' : '#ffffff';
  const fg = darkMode ? '#f1f5f9' : '#0f172a';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const accent = '#0d9488';
  const accentLight = darkMode ? '#0d948825' : '#f0fdfa';
  const cardBg = darkMode ? '#1e293b' : '#f8fafc';
  const border = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>TruMove</span>
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: muted, fontWeight: 500 }}>
          <span>Features</span><span>Pricing</span><span>Reviews</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: muted }}>Log in</span>
          <div style={{ background: accent, color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Get Started →</div>
        </div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero: split layout with CTA card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, padding: '80px 64px 60px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${accent}40`, color: accent, padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: accent }} /> Now available
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5 }}>
                {content.headline.split(' in ')[0]},<br />
                <span style={{ color: accent }}>All With a Quote</span>
              </h1>
              <p style={{ fontSize: 17, color: muted, marginTop: 20, lineHeight: 1.7 }}>
                Launch your move in minutes. Watch us handle everything from packing to delivery.
              </p>
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Live estimates in minutes, not days', 'AI-generated routes & optimal pricing', 'Full GPS tracking 24/7', 'Works across all 48 states'].map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                    <div style={{ color: accent }}><CheckCircle2 size={16} /></div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 32, fontSize: 12, color: muted, letterSpacing: 1, textTransform: 'uppercase' }}>Trusted by teams at</div>
              <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                {content.logos.map(l => <span key={l} style={{ fontSize: 14, fontWeight: 600, color: muted, opacity: 0.5 }}>{l}</span>)}
              </div>
            </div>
            {/* CTA Card */}
            <div style={{ padding: 36, borderRadius: 16, border: `1px solid ${border}`, background: cardBg, boxShadow: darkMode ? 'none' : '0 8px 32px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Get your free estimate</h3>
              <p style={{ fontSize: 14, color: muted, marginBottom: 24 }}>AI-powered quotes in under 60 seconds.</p>
              {['Moving From', 'Moving To', 'Move Date', 'Home Size'].map(f => (
                <div key={f} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: muted, marginBottom: 4 }}>{f}</div>
                  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 16px', fontSize: 14 }}>{f}...</div>
                </div>
              ))}
              <div style={{ background: accent, color: '#fff', padding: 14, borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 15, marginTop: 8 }}>Get Instant Quote</div>
            </div>
          </div>

          {/* How it Works — with browser mockup */}
          <div style={{ padding: '80px 64px', background: cardBg }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800 }}>How it Works</h2>
              <p style={{ fontSize: 16, color: muted, marginTop: 8 }}>Describe your move and watch TruMove build everything in real time.</p>
            </div>
            {/* Browser mockup */}
            <div style={{ maxWidth: 900, margin: '0 auto', borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden', background: bg, boxShadow: darkMode ? 'none' : '0 12px 48px rgba(0,0,0,0.08)' }}>
              <div style={{ padding: '10px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: '#ef4444' }} />
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: '#f59e0b' }} />
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: '#22c55e' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ fontSize: 12, color: muted, background: cardBg, padding: '4px 16px', borderRadius: 6, border: `1px solid ${border}` }}>trumove.com</span>
                </div>
              </div>
              <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${darkMode ? '#1e293b' : '#f0fdfa'}, ${darkMode ? '#0f172a' : '#ffffff'})` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 999, background: accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Play size={24} fill="#fff" color="#fff" />
                  </div>
                  <div style={{ fontSize: 14, color: muted }}>Platform Demo — See TruMove in action</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features grid */}
          <div style={{ padding: '80px 64px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800 }}>Everything you need</h2>
              <p style={{ fontSize: 16, color: muted, marginTop: 8 }}>One platform. Zero hassle.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { icon: <Zap size={20} />, title: 'AI Instant Quotes', desc: 'Machine learning estimates within $50 accuracy.' },
                { icon: <MapPin size={20} />, title: 'GPS Tracking', desc: 'Real-time location of every shipment, updated every 30s.' },
                { icon: <Shield size={20} />, title: 'Full Protection', desc: 'Comprehensive coverage up to $100K per shipment.' },
                { icon: <Clock size={20} />, title: 'Guaranteed Dates', desc: 'We hit our delivery windows 99.2% of the time.' },
                { icon: <Users size={20} />, title: 'Dedicated Team', desc: 'Personal move coordinator from start to finish.' },
                { icon: <Headphones size={20} />, title: '24/7 Support', desc: 'Live help anytime via chat, phone, or email.' },
              ].map(f => (
                <div key={f.title} style={{ padding: 28, borderRadius: 14, border: `1px solid ${border}`, background: cardBg }}>
                  <div style={{ color: accent, marginBottom: 16 }}>{f.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                  <p style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>Comprehensive moving solutions</h2>
            <p style={{ fontSize: 15, color: muted, marginTop: 8, maxWidth: 480, margin: '8px auto 0' }}>From packing to delivery, we handle every aspect of your move.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { emoji: '🚛', title: 'Long Distance', desc: 'Coast-to-coast with guaranteed delivery windows' },
              { emoji: '📦', title: 'Packing', desc: 'Professional packing with custom crating' },
              { emoji: '🏢', title: 'Commercial', desc: 'Office moves with minimal downtime' },
              { emoji: '🔒', title: 'Storage', desc: 'Climate-controlled, 24/7 monitored' },
              { emoji: '🚗', title: 'Auto Transport', desc: 'Open and enclosed vehicle shipping' },
              { emoji: '🌍', title: 'International', desc: 'Door-to-door with customs support' },
            ].map(s => (
              <div key={s.title} style={{ padding: 28, borderRadius: 14, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{s.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>{s.desc}</p>
                <div style={{ color: accent, fontSize: 13, fontWeight: 600, marginTop: 16, display: 'flex', alignItems: 'center', gap: 4 }}>Learn more <ChevronRight size={14} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>Loved by thousands</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16 }}>{[1,2,3,4,5].map(s => <Star key={s} size={18} fill={accent} color={accent} />)}</div>
            <div style={{ fontSize: 14, color: muted, marginTop: 8 }}>4.9/5 from 12,847 verified reviews</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[...content.testimonials, { name: 'Maria G.', location: 'Phoenix', text: 'The AI quote was within $30 of the final price. No surprises.' }, { name: 'David R.', location: 'Seattle', text: 'GPS tracking gave us total peace of mind during our cross-country move.' }].map((t, i) => (
              <div key={i} style={{ padding: 28, borderRadius: 14, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={accent} color={accent} />)}</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>Get your estimate</h2>
            <p style={{ fontSize: 15, color: muted, marginTop: 8 }}>AI-powered estimates in under 60 seconds.</p>
          </div>
          {['Full Name', 'Email', 'Phone', 'Moving From', 'Moving To', 'Move Date'].map(f => (
            <div key={f} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: muted }}>{f}</label>
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 16px', fontSize: 14 }}>{f}...</div>
            </div>
          ))}
          <div style={{ background: accent, color: '#fff', padding: 14, borderRadius: 10, textAlign: 'center', fontWeight: 700, marginTop: 16 }}>{content.cta} →</div>
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
// 3. ENTERPRISE DARK FORM — Designers System / Ceros-inspired
//    Dark slate (not black), teal/cyan accent, glassmorphic cards,
//    gradient text, product dashboard mockup, icon features,
//    numbered how-it-works, image gallery, testimonials wall
// ══════════════════════════════════════════════════════════════════

function EnterpriseDarkForm({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0b1120' : '#f8fafc';
  const fg = darkMode ? '#e2e8f0' : '#0f172a';
  const muted = darkMode ? '#64748b' : '#94a3b8';
  const accent = '#06b6d4';
  const accentDim = darkMode ? '#06b6d420' : '#06b6d415';
  const cardBg = darkMode ? '#111827' : '#ffffff';
  const cardBorder = darkMode ? '#1e293b' : '#e2e8f0';
  const glassCard = darkMode ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.8)';
  const glowBg = darkMode ? 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.08) 0%, transparent 60%)' : 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.05) 0%, transparent 60%)';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 64px', borderBottom: `1px solid ${cardBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${accent}, #0891b2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>TruMove</span>
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: muted }}>
          <span>Features</span><span>Pricing</span><span>Company</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: muted }}>Log in</span>
          <div style={{ background: `linear-gradient(135deg, ${accent}, #0891b2)`, color: '#fff', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, boxShadow: `0 4px 20px ${accent}30` }}>Get Started</div>
        </div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero with glow */}
          <div style={{ position: 'relative', textAlign: 'center', padding: '100px 64px 40px', backgroundImage: glowBg }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentDim, border: `1px solid ${accent}30`, color: accent, padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 32 }}>
              <Zap size={14} /> Now available — AI-Powered Moving
            </div>
            <h1 style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2, maxWidth: 800, margin: '0 auto' }}>
              {content.headline.split(' in ')[0]}
              <br />
              <span style={{ background: `linear-gradient(135deg, ${accent}, #22d3ee, #0891b2)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                in {content.headline.split(' in ')[1] || 'Your City'}
              </span>
            </h1>
            <p style={{ fontSize: 17, color: muted, marginTop: 20, maxWidth: 560, margin: '20px auto 0', lineHeight: 1.7 }}>
              {content.subheadline}. Get an AI-powered estimate in under 60 seconds — no phone calls, no waiting.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36 }}>
              <div style={{ background: `linear-gradient(135deg, ${accent}, #0891b2)`, color: '#fff', padding: '16px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700, boxShadow: `0 4px 24px ${accent}30` }}>{content.cta} →</div>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div style={{ margin: '40px 64px 0', borderRadius: 20, border: `1px solid ${cardBorder}`, overflow: 'hidden', background: cardBg, boxShadow: darkMode ? `0 24px 80px -20px ${accent}10` : '0 20px 60px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: 999, background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: 999, background: '#22c55e' }} />
              </div>
              <span style={{ fontSize: 12, color: muted, marginLeft: 8 }}>trumove.com/dashboard</span>
            </div>
            <div style={{ height: 380, display: 'flex', padding: 24, gap: 20, background: darkMode ? '#0d1424' : '#f8fafc' }}>
              {/* Sidebar */}
              <div style={{ width: 180, background: cardBg, borderRadius: 12, border: `1px solid ${cardBorder}`, padding: 16 }}>
                {['Dashboard', 'Moves', 'Tracking', 'Quotes', 'Reports'].map((item, i) => (
                  <div key={item} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 13, color: i === 0 ? accent : muted, background: i === 0 ? accentDim : 'transparent', marginBottom: 2, fontWeight: i === 0 ? 600 : 400 }}>{item}</div>
                ))}
              </div>
              {/* Main content */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${cardBorder}`, padding: 20 }}>
                  <div style={{ fontSize: 12, color: muted, marginBottom: 8 }}>Active Moves</div>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>24</div>
                  <div style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>↑ 12% from last month</div>
                </div>
                <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${cardBorder}`, padding: 20 }}>
                  <div style={{ fontSize: 12, color: muted, marginBottom: 8 }}>Revenue</div>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>$142K</div>
                  <div style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>↑ 8% from last month</div>
                </div>
                <div style={{ gridColumn: '1 / -1', background: cardBg, borderRadius: 12, border: `1px solid ${cardBorder}`, padding: 20 }}>
                  <div style={{ fontSize: 12, color: muted, marginBottom: 16 }}>Monthly Performance</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                    {[40, 65, 55, 80, 70, 90, 75, 95, 85, 100, 88, 92].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(180deg, ${accent}, ${accent}60)`, borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo strip */}
          <div style={{ textAlign: 'center', padding: '48px 64px' }}>
            <div style={{ fontSize: 12, color: muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20, fontWeight: 600 }}>Trusted by industry leaders</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
              {content.logos.map(l => <span key={l} style={{ fontSize: 15, fontWeight: 700, color: muted, opacity: 0.4 }}>{l}</span>)}
            </div>
          </div>

          {/* Features — icon cards with glow borders */}
          <div style={{ padding: '48px 64px 80px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 12, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Platform Features</div>
              <h2 style={{ fontSize: 40, fontWeight: 800 }}>Precision at speed,<br />without the grind</h2>
              <p style={{ fontSize: 16, color: muted, marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>Break free from the endless loop of manual quotes and estimates.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { icon: <Zap size={20} />, title: 'Instant Quotes', desc: 'AI-powered pricing in seconds, not hours.' },
                { icon: <MapPin size={20} />, title: 'Live Tracking', desc: 'GPS updates every 30 seconds on every truck.' },
                { icon: <Shield size={20} />, title: 'Full Coverage', desc: 'Comprehensive insurance up to $100,000.' },
                { icon: <BarChart3 size={20} />, title: 'Analytics', desc: 'Deep insights into every move and route.' },
              ].map(f => (
                <div key={f.title} style={{ padding: 28, borderRadius: 16, border: `1px solid ${cardBorder}`, background: glassCard, backdropFilter: 'blur(8px)' }}>
                  <div style={{ color: accent, marginBottom: 16 }}>{f.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                  <p style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>{f.desc}</p>
                  <div style={{ color: accent, fontSize: 13, fontWeight: 600, marginTop: 16, display: 'flex', alignItems: 'center', gap: 4 }}>Learn more <ChevronRight size={14} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works — numbered */}
          <div style={{ padding: '80px 64px', borderTop: `1px solid ${cardBorder}` }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 12, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>How It Works</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, maxWidth: 500 }}>Three simple steps to your perfect move</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { n: 1, title: 'Get Your Quote', desc: 'Enter your details and receive an AI-powered estimate in under 60 seconds.' },
                { n: 2, title: 'We Plan & Pack', desc: 'Our team handles scheduling, packing, loading, and logistics from end to end.' },
                { n: 3, title: 'Track & Receive', desc: 'Follow your belongings in real-time and receive them at your new home.' },
              ].map(s => (
                <div key={s.n}>
                  <div style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: accent, marginBottom: 20 }}>{s.n}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                  <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials wall — Designers System style */}
          <div style={{ padding: '80px 64px', borderTop: `1px solid ${cardBorder}` }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800 }}>See what customers say</h2>
              <p style={{ fontSize: 15, color: muted, marginTop: 8 }}>Real feedback from verified moves across the country.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { name: 'Desirae Workman', text: 'Exceptional partner. TruMove consistently delivers outstanding results, our preferred choice.' },
                { name: 'Jordyn Phillips', text: 'Reliable, results-driven. Company consistently delivers top-notch service, exceeding expectations.' },
                { name: 'Kianna Rosser', text: 'Exceeding expectations, every time. TruMove has proven to be the go-to choice for excellence.' },
                { name: 'Marilyn Ekstrom', text: 'Reliable, responsive. Company always exceeds our expectations, a dependable partner.' },
                { name: 'Corey Stanton', text: 'Trustworthy partner. Company consistently provides outstanding results and service.' },
                { name: 'Roger Lipshutz', text: 'Outstanding results, every time. TruMove is our preferred choice for quality and excellence.' },
              ].map((t, i) => (
                <div key={i} style={{ padding: 24, borderRadius: 16, border: `1px solid ${cardBorder}`, background: glassCard, backdropFilter: 'blur(8px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 999, background: accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: accent }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: accent }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: muted }}>@{t.name.split(' ')[0].toLowerCase()}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: muted, lineHeight: 1.7 }}>{t.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding: '80px 64px', backgroundImage: glowBg }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Start today</div>
                <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15 }}>Ready to join the<br />movement with AI?</h2>
                <p style={{ fontSize: 15, color: muted, marginTop: 16, lineHeight: 1.7 }}>From estimates to real-time tracking — our AI-powered platform handles everything.</p>
                <div style={{ marginTop: 28, display: 'inline-block', background: `linear-gradient(135deg, ${accent}, #0891b2)`, color: '#fff', padding: '16px 36px', borderRadius: 12, fontSize: 15, fontWeight: 700, boxShadow: `0 4px 24px ${accent}30` }}>Get Started →</div>
              </div>
              <div style={{ height: 280, borderRadius: 20, background: `linear-gradient(135deg, ${darkMode ? '#111827' : '#ecfeff'}, ${darkMode ? '#0d1424' : '#f0fdfa'})`, border: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={48} style={{ opacity: 0.15 }} />
              </div>
            </div>
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Solutions</div>
            <h2 style={{ fontSize: 40, fontWeight: 800 }}>Enterprise-grade moving solutions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: <Truck size={20} />, title: 'Long Distance', desc: 'Coast-to-coast with guaranteed windows and full GPS tracking.' },
              { icon: <MapPin size={20} />, title: 'Local Moves', desc: 'Same-day professional crews with premium equipment.' },
              { icon: <Globe size={20} />, title: 'International', desc: 'Customs, freight, and full destination services.' },
              { icon: <Shield size={20} />, title: 'Packing & Crating', desc: 'Museum-quality materials for maximum protection.' },
              { icon: <Lock size={20} />, title: 'Storage', desc: 'Climate-controlled, 24/7 monitored facilities.' },
              { icon: <Zap size={20} />, title: 'Auto Transport', desc: 'Open and enclosed nationwide vehicle shipping.' },
            ].map(s => (
              <div key={s.title} style={{ padding: 28, borderRadius: 16, border: `1px solid ${cardBorder}`, background: glassCard }}>
                <div style={{ color: accent, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>See what customers say</h2>
            <p style={{ fontSize: 15, color: muted, marginTop: 8 }}>Real feedback from verified customers.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { name: 'Sarah M.', text: 'Seamless experience from quote to delivery. The AI estimate was spot-on.', role: 'VP People Ops' },
              { name: 'James K.', text: 'Best moving company we\'ve ever used. Professional, on-time, and careful.', role: 'Operations Lead' },
              { name: 'Maria G.', text: 'The AI quote was within $30 of the final price. No surprises.', role: 'HR Director' },
              { name: 'David R.', text: 'GPS tracking gave us total peace of mind during our cross-country move.', role: 'CTO' },
              { name: 'Linda T.', text: 'Relocated our entire office in one weekend. Zero downtime.', role: 'Facilities Manager' },
              { name: 'Robert K.', text: 'International relocation handled flawlessly — customs, housing, everything.', role: 'Global Mobility' },
            ].map((t, i) => (
              <div key={i} style={{ padding: 24, borderRadius: 16, border: `1px solid ${cardBorder}`, background: glassCard }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: accent }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: accent }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: muted }}>{t.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: muted, lineHeight: 1.7 }}>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '64px 64px', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>Request a demo</h2>
            <p style={{ fontSize: 15, color: muted, marginTop: 8 }}>See our enterprise platform in action.</p>
          </div>
          <div style={{ padding: 32, borderRadius: 20, border: `1px solid ${cardBorder}`, background: cardBg }}>
            {['Company Name', 'Contact Name', 'Email', 'Phone', 'Number of Employees', 'Origin', 'Destination'].map(f => (
              <div key={f} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: muted }}>{f}</label>
                <div style={{ background: bg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '12px 16px', fontSize: 14 }}>{f}...</div>
              </div>
            ))}
            <div style={{ background: `linear-gradient(135deg, ${accent}, #0891b2)`, color: '#fff', padding: 14, borderRadius: 10, textAlign: 'center', fontWeight: 700, marginTop: 8 }}>Request Demo →</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '40px 64px', borderTop: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={12} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>TruMove</span>
        </div>
        <div style={{ fontSize: 12, color: muted }}>© 2025 TruMove. All rights reserved.</div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: muted }}><span>Privacy</span><span>Terms</span></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 4. PROMO DARK GRADIENT — Madgicx-inspired
//    Dark navy bg, purple/pink gradient accents, bold urgency headlines,
//    promo banner, product screenshot showcase, social proof
// ══════════════════════════════════════════════════════════════════

function PromoDarkGradient({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0a0118' : '#faf5ff';
  const fg = darkMode ? '#f3e8ff' : '#1e1b4b';
  const muted = darkMode ? '#a78bfa' : '#7c3aed';
  const mutedText = darkMode ? '#94a3b8' : '#64748b';
  const purple = '#8b5cf6';
  const pink = '#ec4899';
  const indigo = '#6366f1';
  const cardBg = darkMode ? '#110827' : '#ffffff';
  const border = darkMode ? '#1e1547' : '#e9d5ff';
  const gradientText = `linear-gradient(135deg, ${purple}, ${pink}, ${indigo})`;
  const gradientBg = `linear-gradient(135deg, ${purple}, ${indigo})`;
  const glowShadow = `0 4px 32px ${purple}30`;

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Promo banner — urgency */}
      <div style={{ background: gradientBg, textAlign: 'center', padding: '10px', fontSize: 13, color: '#fff', fontWeight: 600 }}>
        🚨 $60 off your first move — Use code TRUMOVE60 at checkout
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 64px' }}>
        <span style={{ fontSize: 18, fontWeight: 800 }}>TruMove</span>
        <div style={{ background: gradientBg, color: '#fff', padding: '10px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, boxShadow: glowShadow }}>
          Start Free Trial (+$60 Off)
        </div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero — massive centered text with gradient */}
          <div style={{ textAlign: 'center', padding: '100px 64px 60px', position: 'relative' }}>
            {/* Glow */}
            <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${purple}12 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h1 style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, letterSpacing: -2, textTransform: 'uppercase', maxWidth: 900, margin: '0 auto' }}>
                The World's Smartest AI Platform for Moving —{' '}
                <span style={{ background: gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Get $60 Off
                </span>
              </h1>
              <p style={{ fontSize: 18, color: mutedText, marginTop: 24, maxWidth: 600, margin: '24px auto 0', lineHeight: 1.6 }}>
                If you're still planning moves manually, you're already losing. Other movers are quoting 10× faster with AI.
              </p>
              <div style={{ marginTop: 40 }}>
                <div style={{ display: 'inline-block', background: gradientBg, color: '#fff', padding: '18px 48px', borderRadius: 12, fontSize: 17, fontWeight: 800, boxShadow: glowShadow }}>
                  👉 Start Your 7-Day Free Trial (+$60 Off)
                </div>
                <div style={{ fontSize: 13, color: mutedText, marginTop: 12 }}>Get Lifetime access · No credit card required</div>
              </div>
            </div>
          </div>

          {/* Product screenshot showcase */}
          <div style={{ margin: '0 64px 60px', borderRadius: 20, overflow: 'hidden', border: `1px solid ${border}`, boxShadow: `0 24px 80px -20px ${purple}15` }}>
            <div style={{ height: 420, background: `linear-gradient(180deg, ${darkMode ? '#110827' : '#faf5ff'}, ${darkMode ? '#0a0118' : '#f5f3ff'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {/* Simulated dashboard */}
              <div style={{ width: '85%', height: '85%', borderRadius: 16, border: `1px solid ${border}`, background: cardBg, overflow: 'hidden', boxShadow: `0 0 80px ${purple}10` }}>
                <div style={{ padding: '12px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: '#ef4444' }} />
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: '#f59e0b' }} />
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: '#22c55e' }} />
                  </div>
                </div>
                <div style={{ padding: 24, display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>15 recommendations are waiting</div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {['All', 'Priority', 'Savings'].map(tab => (
                        <div key={tab} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, background: tab === 'All' ? `${purple}20` : 'transparent', color: tab === 'All' ? purple : mutedText, fontWeight: 600 }}>{tab}</div>
                      ))}
                    </div>
                    {[
                      { name: 'Ann C.', action: 'Set budget $5 to $7.2', time: '2 hours ago' },
                      { name: 'Matthew C.', action: 'Set budget $5 to $7.2', time: '3 hours ago' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${border}` }}>
                        <div style={{ width: 28, height: 28, borderRadius: 999, background: `${purple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: purple }}>{item.name[0]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: mutedText }}>{item.action} · {item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ width: 200, background: darkMode ? '#1a0f2e' : '#faf5ff', borderRadius: 12, padding: 16, border: `1px solid ${border}` }}>
                    <div style={{ fontSize: 12, color: mutedText, marginBottom: 8 }}>Savings This Month</div>
                    <div style={{ fontSize: 28, fontWeight: 900, background: gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>$2,340</div>
                    <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4 }}>↑ 20% from avg</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '0 64px 80px' }}>
            {content.stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: 28, borderRadius: 16, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ fontSize: 36, fontWeight: 900, background: gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: mutedText, marginTop: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Mid-page CTA */}
          <div style={{ margin: '0 64px 80px', padding: 48, borderRadius: 20, background: gradientBg, textAlign: 'center', boxShadow: glowShadow }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>Don't miss your $60 savings</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 12 }}>Join 50,000+ movers already using AI to save time and money.</p>
            <div style={{ marginTop: 28, display: 'inline-block', background: '#fff', color: indigo, padding: '16px 40px', borderRadius: 12, fontSize: 16, fontWeight: 800 }}>Claim Your Discount →</div>
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 44, fontWeight: 900 }}>What's <span style={{ background: gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Included</span></h2>
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
            <h2 style={{ fontSize: 44, fontWeight: 900 }}>💜 Loved by <span style={{ background: gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>50,000+</span> Movers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              ...content.testimonials,
              { name: 'Maria G.', location: 'Phoenix', text: 'The promo was real — saved $800 on our cross-country move!' },
              { name: 'Robert L.', location: 'Chicago', text: 'Everything handled with care. Will absolutely use again.' },
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
            <div style={{ display: 'inline-flex', background: `${purple}20`, color: purple, padding: '8px 20px', borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 16, border: `1px solid ${purple}30` }}>🔥 $60 Off Expires Soon</div>
            <h2 style={{ fontSize: 40, fontWeight: 900 }}>Lock In Your <span style={{ background: gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Savings</span></h2>
          </div>
          <div style={{ padding: 32, borderRadius: 20, border: `1px solid ${border}`, background: cardBg, boxShadow: glowShadow }}>
            {['Full Name', 'Email', 'Phone', 'Moving From', 'Moving To', 'Move Date'].map(f => (
              <div key={f} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: mutedText }}>{f}</label>
                <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 16px', fontSize: 14 }}>{f}...</div>
              </div>
            ))}
            <div style={{ background: gradientBg, color: '#fff', padding: 16, borderRadius: 12, textAlign: 'center', fontWeight: 800, fontSize: 16, marginTop: 8, boxShadow: glowShadow }}>🎉 Get Quote — Save $60</div>
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
//    Light bg, blue/orange accent, trust bar, awards row, video demo,
//    split hero with form, professional SaaS feel, feature comparison
// ══════════════════════════════════════════════════════════════════

function CorporateLightVideo({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0f172a' : '#ffffff';
  const fg = darkMode ? '#f1f5f9' : '#1e293b';
  const muted = darkMode ? '#94a3b8' : '#64748b';
  const accent = '#2563eb';
  const accentBg = darkMode ? '#2563eb12' : '#eff6ff';
  const orange = '#f59e0b';
  const cardBg = darkMode ? '#1e293b' : '#f8fafc';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const heroBg = darkMode ? '#0c1628' : '#eef2ff';

  return (
    <div style={{ background: bg, color: fg, fontFamily: "'Inter', system-ui, sans-serif", minHeight: 900 }}>
      {/* Top promo bar */}
      <div style={{ background: `linear-gradient(90deg, ${accent}, #1d4ed8)`, textAlign: 'center', padding: '10px', fontSize: 13, color: '#fff', fontWeight: 600 }}>
        🎉 Start your FREE 14-Day Trial today!
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 64px', background: bg }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: fg }}>🚛 TruMove</span>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: muted, fontWeight: 500 }}>
          <span>Platform</span><span>Solutions</span><span>Pricing</span><span>Resources</span>
        </div>
        <div style={{ border: `2px solid ${fg}`, padding: '10px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700 }}>Login to App</div>
      </div>

      {page === 'home' && (
        <>
          {/* Hero — split with badge + video */}
          <div style={{ background: heroBg, padding: '80px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${orange}20`, border: `1px solid ${orange}40`, padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: darkMode ? orange : '#92400e', marginBottom: 24 }}>
                ⚡ Power Up Your Business:
              </div>
              <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.15, letterSpacing: -1 }}>
                Elevate Your Marketing and Sales with TruMove's All-in-One Platform!
              </h1>
              <div style={{ marginTop: 32, background: accent, color: '#fff', padding: '18px 36px', borderRadius: 10, fontSize: 16, fontWeight: 800, display: 'inline-block', textAlign: 'center' }}>
                14 DAY FREE TRIAL
                <div style={{ fontSize: 12, fontWeight: 400, marginTop: 2, opacity: 0.8 }}>No obligations, no contracts, cancel at any time</div>
              </div>
            </div>
            {/* Video placeholder */}
            <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              <div style={{ height: 320, background: `linear-gradient(135deg, ${darkMode ? '#1e293b' : '#e0e7ff'}, ${darkMode ? '#0f172a' : '#eff6ff'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: 72, height: 72, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${accent}40` }}>
                  <Play size={28} fill="#fff" color="#fff" />
                </div>
              </div>
            </div>
          </div>

          {/* Awards row */}
          <div style={{ textAlign: 'center', padding: '48px 64px', borderBottom: `1px solid ${border}` }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24, color: muted }}>Awards</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
              {[
                { icon: '🏆', label: 'Leader\nWinter 2025' },
                { icon: '🥇', label: 'Momentum\nLeader' },
                { icon: '⭐', label: 'Users\nLove Us' },
                { icon: '🏅', label: 'Capterra\nShortlist' },
                { icon: '📊', label: 'Top 20\nFastest Growing' },
              ].map(a => (
                <div key={a.label} style={{ width: 100, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{a.icon}</div>
                  <div style={{ fontSize: 11, color: muted, whiteSpace: 'pre-line', lineHeight: 1.3, fontWeight: 600 }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Value prop section */}
          <div style={{ padding: '80px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${border}`, background: cardBg }}>
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${darkMode ? '#1e293b' : '#f0f4ff'}, ${darkMode ? '#0f172a' : '#e8edff'})` }}>
                <div style={{ textAlign: 'center' }}>
                  <Play size={32} style={{ color: accent, marginBottom: 8 }} />
                  <div style={{ fontSize: 13, color: muted }}>Watch Demo</div>
                </div>
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2 }}>We're In The Business Of Helping You Grow</h2>
              <p style={{ fontSize: 15, color: muted, marginTop: 16, lineHeight: 1.7 }}>
                TruMove is the first-ever all-in-one platform that gives you the tools, support, and resources you need to succeed.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 28 }}>
                {[
                  { val: '50,000+', label: 'Moves Completed' },
                  { val: '4.9/5', label: 'Avg Rating' },
                  { val: '48', label: 'States' },
                  { val: '24/7', label: 'Support' },
                ].map(s => (
                  <div key={s.label} style={{ padding: 16, borderRadius: 10, border: `1px solid ${border}`, background: cardBg }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: accent }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature comparison */}
          <div style={{ padding: '48px 64px 80px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800 }}>Why teams switch to TruMove</h2>
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
                ['24/7 Support', true, false, false],
              ].map(([feature, a, b, c], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: `1px solid ${border}` }}>
                  <div style={{ padding: '12px 24px', fontSize: 14 }}>{feature as string}</div>
                  {[a, b, c].map((val, j) => (
                    <div key={j} style={{ padding: '12px 24px', textAlign: 'center' }}>
                      {val ? <Check size={18} color="#22c55e" /> : <X size={18} color="#ef4444" style={{ opacity: 0.4 }} />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {page === 'services' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>All-In-One Moving Platform</h2>
            <p style={{ fontSize: 15, color: muted, marginTop: 8 }}>Everything you need to run and grow your moving business.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: <BarChart3 size={24} />, title: 'CRM & Pipeline', desc: 'Manage leads, deals, and customer relationships in one place.' },
              { icon: <Zap size={24} />, title: 'AI Quoting', desc: 'Instant, accurate estimates powered by machine learning.' },
              { icon: <MapPin size={24} />, title: 'GPS Dispatch', desc: 'Real-time tracking and route optimization for every truck.' },
              { icon: <Globe size={24} />, title: 'Marketing Suite', desc: 'Built-in ads, landing pages, and email automation.' },
              { icon: <Users size={24} />, title: 'Team Management', desc: 'Scheduling, performance tracking, and crew assignments.' },
              { icon: <Headphones size={24} />, title: 'Customer Portal', desc: 'Self-service tracking, payments, and communication.' },
            ].map(s => (
              <div key={s.title} style={{ padding: 28, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ color: accent, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'reviews' && (
        <div style={{ padding: '64px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>Trusted by 5,000+ Companies</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { name: 'Sarah M.', role: 'CEO, FastTrack Moving', text: 'TruMove replaced 5 different tools for us. Revenue up 40% in 6 months.' },
              { name: 'James K.', role: 'Owner, Pacific Movers', text: 'The AI quoting alone saves us 20 hours per week. Game changer.' },
              { name: 'Maria G.', role: 'Marketing Dir', text: 'Built-in marketing automation helped us scale from 50 to 200 moves/month.' },
              { name: 'David R.', role: 'Operations Manager', text: 'GPS dispatch reduced our fuel costs by 18%. ROI was immediate.' },
            ].map((t, i) => (
              <div key={i} style={{ padding: 28, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>{[1,2,3,4,5].map(s => <Star key={s} size={14} fill={accent} color={accent} />)}</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: muted }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'quote' && (
        <div style={{ padding: '64px 64px', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>Start Your Free Trial</h2>
            <p style={{ fontSize: 15, color: muted, marginTop: 8 }}>14 days free. No credit card required.</p>
          </div>
          <div style={{ padding: 32, borderRadius: 16, border: `1px solid ${border}`, background: cardBg }}>
            {['Company Name', 'Full Name', 'Email', 'Phone'].map(f => (
              <div key={f} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: muted }}>{f}</label>
                <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '12px 16px', fontSize: 14 }}>{f}...</div>
              </div>
            ))}
            <div style={{ background: accent, color: '#fff', padding: 16, borderRadius: 8, textAlign: 'center', fontWeight: 800, fontSize: 16, marginTop: 8 }}>Start Free Trial →</div>
          </div>
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
// 6. TOP 10 LISTICLE — Review/ranking site
// ══════════════════════════════════════════════════════════════════

function Top10Listicle({ content, page, darkMode }: { content: ReturnType<typeof getContent>; page: PageTab; darkMode: boolean }) {
  const bg = darkMode ? '#0f1117' : '#ffffff';
  const fg = darkMode ? '#e5e7eb' : '#111827';
  const muted = darkMode ? '#6b7280' : '#9ca3af';
  const accent = '#4f46e5';
  const green = '#22c55e';
  const greenBg = darkMode ? '#22c55e15' : '#f0fdf4';
  const cardBg = darkMode ? '#1a1d27' : '#f9fafb';
  const border = darkMode ? '#2a2d37' : '#e5e7eb';

  const competitors = [
    { rank: 1, name: 'TruMove', rating: 4.9, reviews: 12847, badge: "Editor's Choice", highlight: true, pros: ['AI-powered instant quotes', 'Real-time GPS tracking', 'Full-value protection'], cons: ['Premium pricing', 'Minimum 3-day notice'] },
    { rank: 2, name: 'SafeShip Movers', rating: 4.6, reviews: 8932, badge: 'Best Value', highlight: false, pros: ['Competitive pricing', 'Flexible scheduling'], cons: ['Limited tracking', 'No packing service'] },
    { rank: 3, name: 'QuickHaul Express', rating: 4.5, reviews: 7654, badge: null, highlight: false, pros: ['Fast delivery times', 'Good communication'], cons: ['Higher damage rates', 'No storage options'] },
    { rank: 4, name: 'PrimeRoute Logistics', rating: 4.4, reviews: 6543, badge: null, highlight: false, pros: ['Nationwide coverage', 'Military discounts'], cons: ['Slow customer service', 'Limited insurance'] },
    { rank: 5, name: 'HomeBase Movers', rating: 4.3, reviews: 5678, badge: null, highlight: false, pros: ['Great for local moves', 'Weekend availability'], cons: ['No long-distance', 'Small trucks only'] },
    { rank: 6, name: 'CrossCountry Pros', rating: 4.2, reviews: 4987, badge: null, highlight: false, pros: ['Experienced crews', 'Good reviews'], cons: ['No AI quoting', 'Limited availability'] },
    { rank: 7, name: 'EasyLoad Moving', rating: 4.0, reviews: 4234, badge: null, highlight: false, pros: ['Simple booking', 'Transparent pricing'], cons: ['Basic insurance', 'No specialty items'] },
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
              MovingReviews.com maintains full editorial independence. Companies cannot pay for rankings or influence our scores.
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
            { name: 'Patricia L.', loc: loc, date: 'Jan 2026', rating: 5, title: 'Best moving experience ever', text: `TruMove made our ${kw.toLowerCase()} completely stress-free. The AI quote was within $50 of the final price.`, helpful: 47 },
            { name: 'David R.', loc: 'Houston, TX', date: 'Dec 2025', rating: 5, title: 'Accurate quotes, no surprises', text: 'After getting wildly different estimates from 5 other companies, TruMove\'s AI gave us an accurate price instantly.', helpful: 38 },
            { name: 'Michelle T.', loc: 'Miami, FL', date: 'Dec 2025', rating: 5, title: 'GPS tracking was a game-changer', text: 'Being able to see exactly where our stuff was during a cross-country move gave us so much peace of mind.', helpful: 31 },
            { name: 'Robert K.', loc: 'Phoenix, AZ', date: 'Nov 2025', rating: 4, title: 'Great service, minor delay', text: 'Overall excellent. Only 4 stars due to a one-day weather delay, but they communicated proactively.', helpful: 22 },
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
                Are you a moving company? Submit your business for review.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { step: '1', title: 'Submit Application', desc: 'Provide your company details, FMCSA/DOT number, and service areas.' },
                  { step: '2', title: 'Verification & Review', desc: 'We verify licensing, review customer feedback, and evaluate your service.' },
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
            </div>
            <div style={{ padding: 32, borderRadius: 16, border: `1px solid ${border}`, background: cardBg }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Company Submission Form</div>
              {['Company Name', 'FMCSA / DOT Number', 'Contact Email', 'Phone', 'Headquarters', 'Service Areas', 'Years in Business', 'Website URL'].map(f => (
                <div key={f} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4, color: muted }}>{f}</label>
                  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '11px 14px', fontSize: 14 }}>{f}...</div>
                </div>
              ))}
              <div style={{ background: accent, color: '#fff', padding: 14, borderRadius: 8, textAlign: 'center', fontWeight: 700, fontSize: 15, marginTop: 8 }}>Submit for Review</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '48px 80px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 13, marginTop: 40 }}>
        <span>© {year} MovingReviews.com · Editorial Guidelines</span>
        <div style={{ display: 'flex', gap: 24 }}><span>Privacy</span><span>Terms</span><span>Contact</span></div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export function WebsitePreviewBuilder({ selections, onBack }: WebsitePreviewBuilderProps) {
  const [template, setTemplate] = useState<TemplateStyle>('editorial-dark');
  const [darkMode, setDarkMode] = useState(false);
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
          <AutomationModeSelector />
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
