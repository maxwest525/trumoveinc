import { useEffect } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Calculator, Calendar, HelpCircle } from 'lucide-react';
import SiteShell from '@/components/layout/SiteShell';
import trudyAvatar from '@/assets/trudy-avatar.png';

const helpCards = [
  { icon: Calculator, title: 'Moving Quotes', desc: 'Get an instant estimate for your upcoming move.' },
  { icon: MapPin, title: 'Shipment Tracking', desc: 'Check the real-time status of your shipment.' },
  { icon: Calendar, title: 'Scheduling', desc: 'Book or reschedule your moving date.' },
  { icon: HelpCircle, title: 'General FAQ', desc: 'Answers to common questions about our services.' },
];

export default function CustomerService() {
  useEffect(() => {
    if (!document.querySelector('script[src*="elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <SiteShell>
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-32 pb-16 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <img
              src={trudyAvatar}
              alt="Trudy – Virtual Customer Service Rep"
              className="mx-auto mb-6 h-28 w-28 rounded-full border-4 border-primary/30 shadow-lg object-cover"
            />
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Meet <span className="text-primary">Trudy</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Your 24/7 virtual customer service representative. Ask about quotes, tracking, scheduling, or anything else — Trudy's here to help.
            </p>
          </div>
        </section>

        {/* Embedded widget – prominent center placement */}
        <section className="py-12 px-4">
          <div className="mx-auto max-w-2xl flex flex-col items-center">
            <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-xl flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>Talk to Trudy</span>
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Click the chat widget in the bottom-right corner to start talking with Trudy.
              </p>
            </div>
          </div>
        </section>

        {/* What Trudy can help with */}
        <section className="py-16 px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-center text-foreground mb-10">What Trudy Can Help With</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {helpCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <card.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fallback contact */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Prefer a Human?</h2>
            <p className="text-muted-foreground mb-8">Our team is always ready to help.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+16097277647"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition-opacity"
              >
                <Phone className="w-4 h-4" /> Call (609) 727-7647
              </a>
              <a
                href="mailto:support@trumove.com"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
              >
                <Mail className="w-4 h-4" /> Email Support
              </a>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
