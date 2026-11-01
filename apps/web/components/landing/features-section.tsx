import Link from "next/link";
import { BookOpen, ShoppingBag, ListChecks, Download, Wrench, MessageCircle, ArrowRight, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PUBLIC_PRODUCT_STATUSES } from "@/lib/catalog";

interface FeatureCard {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  /** tailwind classes that place the card in the bento grid */
  span: string;
  /** photo behind the card (real content from the site) */
  image?: string | null;
  /** used when there is no photo */
  gradient: string;
  badge?: string;
}

// The cards are links: tutorials, BOMs and code all live inside the Tutorials section; custom builds
// and help go to the contact form. The photos and counts come from your own latest tutorial/product.
export async function FeaturesSection() {
  let tutorialImage: string | null = null;
  let productImage: string | null = null;
  let tutorials = 0;
  let products = 0;

  try {
    const [latestTutorial, latestProduct, tutorialCount, productCount] = await Promise.all([
      prisma.projectPost.findFirst({
        // An empty image field is stored as "" (not null), so both must be excluded
        where: { status: "PUBLISHED", AND: [{ featuredImage: { not: null } }, { featuredImage: { not: "" } }] },
        orderBy: { publishedAt: "desc" },
        select: { featuredImage: true },
      }),
      prisma.product.findFirst({
        where: { status: { in: PUBLIC_PRODUCT_STATUSES }, AND: [{ image: { not: null } }, { image: { not: "" } }] },
        orderBy: { createdAt: "desc" },
        select: { image: true },
      }),
      prisma.projectPost.count({ where: { status: "PUBLISHED" } }),
      prisma.product.count({ where: { status: { in: PUBLIC_PRODUCT_STATUSES } } }),
    ]);
    tutorialImage = latestTutorial?.featuredImage ?? null;
    productImage = latestProduct?.image ?? null;
    tutorials = tutorialCount;
    products = productCount;
  } catch {
    // The section still renders without photos or counts
  }

  const cards: FeatureCard[] = [
    {
      title: "Step-by-Step Tutorials",
      description: "Complete builds with wiring, code and clear explanations, from your first LED to full IoT systems.",
      href: "/projects",
      cta: "Start learning",
      icon: BookOpen,
      span: "sm:col-span-2 lg:row-span-2",
      image: tutorialImage,
      gradient: "from-blue-600 to-indigo-700",
      badge: tutorials > 0 ? `${tutorials} tutorials` : undefined,
    },
    {
      title: "Component Store",
      description: "Microcontrollers, sensors and tools, tested and delivered across Nigeria.",
      href: "/store",
      cta: "Shop components",
      icon: ShoppingBag,
      span: "sm:col-span-2",
      image: productImage,
      gradient: "from-purple-600 to-fuchsia-700",
      badge: products > 0 ? `${products} in the store` : undefined,
    },
    {
      title: "Bills of Materials",
      description: "Every project lists the exact parts you need, ready to add to your cart.",
      href: "/projects",
      cta: "See projects",
      icon: ListChecks,
      span: "",
      gradient: "from-emerald-500 to-teal-700",
    },
    {
      title: "Code & Downloads",
      description: "Copy working code from the page and download the project files.",
      href: "/projects",
      cta: "See projects",
      icon: Download,
      span: "",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Custom Builds",
      description: "No time or tools? Our engineers can build your project to your exact specs.",
      href: "/contact?type=service",
      cta: "Request a build",
      icon: Wrench,
      span: "sm:col-span-2",
      gradient: "from-rose-500 to-pink-700",
    },
    {
      title: "Help From Engineers",
      description: "Ask questions under any tutorial, or reach our team directly for support.",
      href: "/contact",
      cta: "Contact the team",
      icon: MessageCircle,
      span: "sm:col-span-2",
      gradient: "from-cyan-600 to-sky-700",
    },
  ];

  return (
    <section className="py-8 md:py-10 bg-white">
      <div className="container px-4 md:px-6 lg:px-8">
        <div className="mb-5">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Everything You Need to Build</h2>
          <p className="text-slate-700">From learning the circuit to getting the parts in your hands. Pick where to start.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:auto-rows-[minmax(11rem,auto)]">
          {cards.map((card) => {
            const Icon = card.icon;
            const hasImage = !!card.image;
            return (
              <Link
                key={card.title}
                href={card.href}
                className={`group relative isolate flex min-h-[11rem] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${card.span}`}
              >
                {hasImage && (
                  <>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 -z-20 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url('${card.image}')` }}
                    />
                    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/90 via-slate-900/55 to-slate-900/25" />
                  </>
                )}

                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  {card.badge && (
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">{card.badge}</span>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-bold leading-tight">{card.title}</h3>
                  <p className="mt-1 max-w-md text-sm leading-snug text-white/90">{card.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                    {card.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
