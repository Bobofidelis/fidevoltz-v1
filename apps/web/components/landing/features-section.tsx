"use client";

import { Code, ShoppingBag, Users, Rocket, BookOpen, Zap, Award, TrendingUp } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

const features = [
  {
    icon: Code,
    title: "Interactive Tutorials",
    description: "Step-by-step guides with code examples, circuit diagrams, and video walkthroughs. Learn by doing with real projects.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    gradient: "from-blue-500 to-cyan-500",
    size: "large", // Takes up more space
  },
  {
    icon: ShoppingBag,
    title: "Component Store",
    description: "Quality electronics components delivered fast.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    gradient: "from-purple-500 to-pink-500",
    size: "medium",
  },
  {
    icon: Award,
    title: "Certifications",
    description: "Earn recognized certificates.",
    gradient: "from-amber-500 to-orange-500",
    size: "small",
  },
  {
    icon: Users,
    title: "Global Community",
    description: "Connect with 50k+ makers worldwide. Share projects, get help, and collaborate.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    gradient: "from-green-500 to-emerald-500",
    size: "medium",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your learning journey.",
    gradient: "from-red-500 to-rose-500",
    size: "small",
  },
  {
    icon: Rocket,
    title: "Project Showcase",
    description: "Share your creations and get inspired by thousands of community projects.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
    gradient: "from-indigo-500 to-purple-500",
    size: "medium",
  },
  {
    icon: BookOpen,
    title: "Learning Paths",
    description: "Structured courses from beginner to expert level.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
    gradient: "from-teal-500 to-cyan-500",
    size: "medium",
  },
  {
    icon: Zap,
    title: "Quick Start",
    description: "Begin in minutes.",
    gradient: "from-yellow-500 to-amber-500",
    size: "small",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            A complete ecosystem for electronics enthusiasts, from learning to building.
          </p>
        </div>

        {/* True Bento Grid - Asymmetric Layout */}
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Stack vertically */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <FadeIn key={feature.title} delay={index * 0.05}>
                  <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${feature.gradient} p-6 min-h-[160px] flex flex-col justify-end transition-all hover:scale-[1.02] shadow-lg`}>
                    {feature.image && (
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url('${feature.image}')` }}
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Icon className="h-8 w-8 text-white mb-3" />
                      <h3 className="text-xl font-bold text-white mb-1">{feature.title}</h3>
                      <p className="text-white/90 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Desktop: True Bento Grid */}
          <div className="hidden md:grid grid-cols-12 gap-4 auto-rows-[140px]">
            {/* Large Feature - Interactive Tutorials */}
            <FadeIn delay={0} className="col-span-6 row-span-3">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 p-8 h-full flex flex-col justify-end transition-all hover:scale-[1.01] shadow-xl hover:shadow-2xl">
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <div 
                    className="absolute inset-0 bg-cover bg-center scale-110 group-hover:scale-100 transition-transform duration-700"
                    style={{ backgroundImage: `url('${features[0].image}')` }}
                  />
                </div>
                <div className="relative">
                  <Code className="h-12 w-12 text-white mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-3">{features[0].title}</h3>
                  <p className="text-white/90 text-lg max-w-md">{features[0].description}</p>
                </div>
                <div className="absolute top-8 right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              </div>
            </FadeIn>

            {/* Medium Feature - Component Store */}
            <FadeIn delay={0.1} className="col-span-3 row-span-2">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 h-full flex flex-col justify-end transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl">
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${features[1].image}')` }}
                  />
                </div>
                <div className="relative">
                  <ShoppingBag className="h-10 w-10 text-white mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">{features[1].title}</h3>
                  <p className="text-white/90 text-sm">{features[1].description}</p>
                </div>
              </div>
            </FadeIn>

            {/* Small Feature - Certifications */}
            <FadeIn delay={0.15} className="col-span-3 row-span-1">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 h-full flex items-center gap-4 transition-all hover:scale-[1.02] shadow-lg">
                <Award className="h-10 w-10 text-white flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{features[2].title}</h3>
                  <p className="text-white/90 text-sm">{features[2].description}</p>
                </div>
              </div>
            </FadeIn>

            {/* Medium Feature - Community */}
            <FadeIn delay={0.2} className="col-span-4 row-span-2">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 p-6 h-full flex flex-col justify-end transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl">
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${features[3].image}')` }}
                  />
                </div>
                <div className="relative">
                  <Users className="h-10 w-10 text-white mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">{features[3].title}</h3>
                  <p className="text-white/90 text-sm">{features[3].description}</p>
                </div>
              </div>
            </FadeIn>

            {/* Small Feature - Track Progress */}
            <FadeIn delay={0.25} className="col-span-2 row-span-1">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 to-rose-500 p-6 h-full flex flex-col justify-center transition-all hover:scale-[1.02] shadow-lg">
                <TrendingUp className="h-10 w-10 text-white mb-2" />
                <h3 className="text-lg font-bold text-white mb-1">{features[4].title}</h3>
                <p className="text-white/90 text-xs">{features[4].description}</p>
              </div>
            </FadeIn>

            {/* Medium Feature - Project Showcase */}
            <FadeIn delay={0.3} className="col-span-4 row-span-2">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 p-6 h-full flex flex-col justify-end transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl">
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${features[5].image}')` }}
                  />
                </div>
                <div className="relative">
                  <Rocket className="h-10 w-10 text-white mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">{features[5].title}</h3>
                  <p className="text-white/90 text-sm">{features[5].description}</p>
                </div>
              </div>
            </FadeIn>

            {/* Medium Feature - Learning Paths */}
            <FadeIn delay={0.35} className="col-span-4 row-span-2">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 p-6 h-full flex flex-col justify-end transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl">
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${features[6].image}')` }}
                  />
                </div>
                <div className="relative">
                  <BookOpen className="h-10 w-10 text-white mb-3" />
                  <h3 className="text-2xl font-bold text-white mb-2">{features[6].title}</h3>
                  <p className="text-white/90 text-sm">{features[6].description}</p>
                </div>
              </div>
            </FadeIn>

            {/* Small Feature - Quick Start */}
            <FadeIn delay={0.4} className="col-span-2 row-span-1">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 to-amber-500 p-6 h-full flex flex-col justify-center transition-all hover:scale-[1.02] shadow-lg">
                <Zap className="h-10 w-10 text-white mb-2" />
                <h3 className="text-lg font-bold text-white mb-1">{features[7].title}</h3>
                <p className="text-white/90 text-xs">{features[7].description}</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
