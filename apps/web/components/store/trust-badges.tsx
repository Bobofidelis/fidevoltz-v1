"use client";

import { Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";

export function TrustBadges() {
  const badges = [
    {
      icon: Truck,
      title: "Fast Nationwide Delivery",
      description: "Free shipping on orders over ₦50,000",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      icon: ShieldCheck,
      title: "Quality Tested Parts",
      description: "100% genuine & verified hardware",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      icon: CreditCard,
      title: "Secure Instant Checkout",
      description: "Bank transfer, cards, and USSD",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      icon: Headphones,
      title: "Maker & Tech Support",
      description: "Direct assistance from our engineers",
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {badges.map((b, i) => {
        const Icon = b.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-200"
          >
            <div className={`p-2.5 rounded-lg border ${b.color} shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                {b.title}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                {b.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
