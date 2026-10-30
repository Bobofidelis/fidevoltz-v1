"use client";

import Link from "next/link";
import { BookOpen, ShoppingBag, ListChecks, Download, Wrench, MessageCircle, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

// Only things the platform actually does today
const features = [
  {
    icon: BookOpen,
    title: "Step-by-Step Tutorials",
    description: "Complete builds with wiring, code and explanations, from your first LED to IoT systems.",
    href: "/projects",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: ShoppingBag,
    title: "Component Store",
    description: "Microcontrollers, sensors and tools, tested and delivered across Nigeria.",
    href: "/store",
    color: "bg-purple-100 text-purple-700",
  },
  {
    icon: ListChecks,
    title: "Bills of Materials",
    description: "Every project lists the exact parts you need, ready to add to your cart.",
    href: "/projects",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Download,
    title: "Code & Downloads",
    description: "Copy working code straight from the page and download project files.",
    href: "/projects",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: Wrench,
    title: "Custom Builds",
    description: "No time or tools? Our engineers can build your project to your exact specs.",
    href: "/contact?type=service",
    color: "bg-rose-100 text-rose-700",
  },
  {
    icon: MessageCircle,
    title: "Help From Engineers",
    description: "Ask questions under any tutorial or reach our team directly for support.",
    href: "/contact",
    color: "bg-cyan-100 text-cyan-700",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-8 md:py-10 bg-white">
      <div className="container px-4 md:px-6">
        <div className="mb-5">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            Everything You Need to Build
          </h2>
          <p className="text-slate-700">From learning the circuit to getting the parts in your hands.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={feature.title} delay={index * 0.05}>
                <Link
                  href={feature.href}
                  className="group flex h-full gap-3.5 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {feature.title}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </h3>
                    <p className="mt-0.5 text-sm leading-snug text-slate-700">{feature.description}</p>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
