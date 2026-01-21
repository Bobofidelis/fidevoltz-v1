"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Handshake, Heart, Rocket } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/ui/motion";

const services = [
  {
    icon: Cpu,
    title: "We Build For You",
    description: "Want to bring a project to life but lack the time or expertise? Our team of experts can build custom AI, IoT, Arduino, and electronics projects tailored to your needs.",
    action: "Request a Build",
    href: "/contact?type=service",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Handshake,
    title: "Partnerships & Sponsorships",
    description: "Let's collaborate! We're open to partnerships with brands, educational institutions, and tech companies to foster innovation and learning in the electronics community.",
    action: "Partner With Us",
    href: "/contact?type=partnership",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Heart,
    title: "Support Our Mission",
    description: "Help us keep providing free, high-quality tutorials and resources. Your donations and support enable us to create more content and reach more aspiring makers.",
    action: "Donate / Support",
    href: "/contact?type=donation",
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export function ServicesSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            More Than Just Tutorials
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover how we can work together to build the future of technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <FadeIn key={service.title} delay={index * 0.1}>
                <div className="group h-full bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className={`w-14 h-14 rounded-xl ${service.bg} ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-8 flex-grow leading-relaxed">
                    {service.description}
                  </p>
                  
                  <Link href={service.href}>
                    <Button className="w-full group/btn" variant="outline">
                      {service.action}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
