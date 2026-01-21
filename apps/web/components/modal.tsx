"use client";

import { Dialog, DialogOverlay, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function Modal({ children, title }: { children: React.ReactNode; title?: string }) {
  const router = useRouter();

  function onDismiss() {
    router.back();
  }

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={onDismiss}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">{title || "Modal"}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
