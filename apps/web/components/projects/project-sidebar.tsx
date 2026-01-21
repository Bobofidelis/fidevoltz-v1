"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Share2, ShoppingCart, Download, ExternalLink } from "lucide-react";

interface ProjectSidebarProps {
  project: any;
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  const components = project.components || [];
  const attachments = project.attachments || [];

  return (
    <div className="space-y-6">
      {/* Components Needed */}
      {components.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              Components Needed
            </h3>
            <ul className="space-y-3 mb-6">
              {components.map((comp: any, index: number) => (
                <li key={index} className="flex items-start justify-between text-sm text-slate-700">
                  <div className="flex gap-2">
                     <span className="text-blue-600 font-bold">•</span>
                     <span>{comp.name}</span>
                  </div>
                  <span className="text-slate-500 text-xs bg-slate-100 px-2 py-0.5 rounded-full">x{comp.quantity}</span>
                </li>
              ))}
            </ul>
            {/* Future: Add to Cart functionality if products linked */}
            {/* <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Buy Components Kit
            </Button> */}
          </CardContent>
        </Card>
      )}

      {/* Attachments & Files */}
      {attachments.length > 0 && (
        <Card>
          <CardContent className="p-4">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Download className="h-4 w-4 text-green-600" />
              Downloads & Files
            </h3>
            <ul className="space-y-3">
               {attachments.map((att: any, index: number) => (
                  <li key={index}>
                     <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg border hover:bg-slate-50 transition-colors group">
                        <div className="bg-slate-100 p-2 rounded text-slate-500 group-hover:text-blue-600 transition-colors">
                           <Download className="h-4 w-4" />
                        </div>
                        <div>
                           <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {att.name || "Download File"}
                           </p>
                           <p className="text-xs text-slate-500 uppercase">{att.type}</p>
                        </div>
                     </a>
                  </li>
               ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Build Service CTA */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
        <CardContent className="p-5">
          <h3 className="text-lg font-bold mb-2">Want us to build this?</h3>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Don't have the time or tools? Our team of experts can build this custom project for you to your exact specs.
          </p>
          <Link href={`/contact?type=service&project=${project.slug}`}>
            <Button variant="secondary" className="w-full font-semibold">
              Request Build Service
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Share */}
      <Button className="w-full" variant="outline" onClick={() => {
         navigator.clipboard.writeText(window.location.href);
         // You might want to add a toast here ideally
      }}>
        <Share2 className="h-4 w-4 mr-2" />
        Share Project
      </Button>
    </div>
  );
}
