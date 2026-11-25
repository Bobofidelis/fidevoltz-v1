"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** The only interactive part of a code block: everything else is rendered on the server */
export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); the code stays selectable by hand
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Code copied" : "Copy code"}
      className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
