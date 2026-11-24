"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MessageCircle,
  Package,
  RotateCcw,
  Search,
  Send,
  Truck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

export interface FaqSection {
  name: string;
  questions: { q: string; a: string }[];
}

const QUICK_LINKS = [
  { href: "/track-order", icon: Package, title: "Track an order", text: "See where your order is with your order ID." },
  { href: "/orders", icon: UserRound, title: "My orders", text: "Sign in to see every order you've placed." },
  { href: "/shipping", icon: Truck, title: "Shipping & delivery", text: "Delivery costs, free delivery and timelines." },
  { href: "/returns", icon: RotateCcw, title: "Returns & refunds", text: "How to return an item or report a fault." },
  { href: "/projects", icon: BookOpen, title: "Tutorials", text: "Step-by-step guides for your next build." },
  { href: "/contact", icon: MessageCircle, title: "Contact us", text: "Business enquiries and bulk orders." },
];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function HelpCenter({ faqs, whatsappUrl }: { faqs: FaqSection[]; whatsappUrl?: string | null }) {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return faqs;
    return faqs
      .map((s) => ({ ...s, questions: s.questions.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q)) }))
      .filter((s) => s.questions.length > 0);
  }, [faqs, query]);
  const matches = filtered.reduce((n, s) => n + s.questions.length, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 text-white">
        <div className="container px-4 md:px-6 lg:px-8 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-slate-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">Help Center</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">How can we help?</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-200">
            Answers about orders, delivery, returns and our tutorials. Can&apos;t find what you need? Send us a message and we&apos;ll get back to you.
          </p>
          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions, e.g. delivery, returns, payment"
              aria-label="Search help questions"
              className="h-12 w-full rounded-xl border-0 bg-white pl-11 pr-4 text-base text-slate-900 shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </section>

      <div className="container px-4 md:px-6 lg:px-8 py-8 md:py-10 space-y-10">
        <section aria-labelledby="quick-links-heading">
          <h2 id="quick-links-heading" className="sr-only">Quick links</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ href, icon: Icon, title, text }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 font-semibold text-slate-900 group-hover:text-blue-700">
                      {title}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-600">{text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <section aria-labelledby="faq-heading">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="faq-heading" className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
              {query && (
                <span className="text-sm text-slate-600" aria-live="polite">
                  {matches} {matches === 1 ? "result" : "results"}
                </span>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <p className="font-semibold text-slate-900">No questions match &ldquo;{query}&rdquo;</p>
                <p className="mt-1 text-slate-600">Try another word, or send us a message and we&apos;ll answer you directly.</p>
                <button type="button" onClick={() => setQuery("")} className="mt-4 text-sm font-semibold text-blue-700 hover:underline">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filtered.map((section) => (
                  <div key={section.name}>
                    {filtered.length > 1 && (
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">{section.name}</h3>
                    )}
                    <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {section.questions.map((f) => (
                        // Native disclosure: the answer is always in the page, so search engines can read it
                        <details key={f.q} className="group" open={!!query}>
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-slate-900 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                            {f.q}
                            <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                          </summary>
                          <div className="whitespace-pre-line px-5 pb-5 text-slate-700 leading-relaxed">{f.a}</div>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-sm text-slate-600">
              Looking for our policies? Read about{" "}
              <Link href="/shipping" className="font-medium text-blue-700 hover:underline">shipping</Link>,{" "}
              <Link href="/returns" className="font-medium text-blue-700 hover:underline">returns</Link> and{" "}
              <Link href="/privacy-policy" className="font-medium text-blue-700 hover:underline">privacy</Link>.
            </p>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Contact support">
            <SupportForm email={session?.user?.email} signedIn={!!session?.user} />
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-slate-900">Prefer WhatsApp?</span>
                  <span className="block text-sm text-slate-600">Chat with us for quick questions.</span>
                </span>
              </a>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function SupportForm({ email, signedIn }: { email?: string | null; signedIn: boolean }) {
  const [guestEmail, setGuestEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const replyTo = (email || guestEmail).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) return toast.error("Please enter a valid email address.");
    if (subject.trim().length < 5) return toast.error("Please give your message a subject of at least 5 characters.");
    if (message.trim().length < 10) return toast.error("Please tell us a little more (at least 10 characters).");

    setSending(true);
    try {
      const body = { subject: subject.trim(), description: message.trim(), priority: "MEDIUM" };
      const res = await fetch(signedIn ? "/api/support/tickets" : "/api/support/tickets/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signedIn ? body : { ...body, userEmail: replyTo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "We couldn't send your message. Please try again.");
      setSentTo(replyTo);
      setSubject("");
      setMessage("");
      setGuestEmail("");
    } catch (err: any) {
      toast.error(err.message || "We couldn't send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sentTo) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-white p-6" role="status">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-bold text-slate-900">Message sent</h2>
        <p className="mt-1 text-slate-700">
          Thanks for reaching out. We&apos;ll reply to <span className="font-medium text-slate-900">{sentTo}</span> as soon as we can.
        </p>
        {signedIn && (
          <Link href="/dashboard/my-tickets" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
            Follow your request in My Tickets <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
        <button type="button" onClick={() => setSentTo(null)} className="mt-4 block text-sm font-medium text-slate-600 hover:text-slate-900">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Send us a message</h2>
        <p className="mt-1 text-sm text-slate-600">Questions about an order, a product or a tutorial. We reply by email.</p>
      </div>

      {signedIn ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Replying to <span className="font-medium text-slate-900">{email}</span>
        </p>
      ) : (
        <div className="space-y-1.5">
          <label htmlFor="help-email" className="text-sm font-medium text-slate-800">Your email</label>
          <input id="help-email" type="email" autoComplete="email" required value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="help-subject" className="text-sm font-medium text-slate-800">Subject</label>
        <input id="help-subject" required minLength={5} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Order not delivered yet" className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="help-message" className="text-sm font-medium text-slate-800">Message</label>
        <textarea id="help-message" required minLength={10} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Include your order ID if it's about an order." className={`${inputClass} resize-y`} />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        {sending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
