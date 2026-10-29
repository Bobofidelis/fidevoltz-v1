"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export const symbolGroups = {
  "Electronics": ["Ω", "µ", "Ʊ", "℧", "⏚", "⎓", "⎍", "∿"],
  "Math": ["±", "×", "÷", "√", "∞", "≈", "≠", "≤", "≥", "∑", "∫", "∂", "π", "Δ", "∇"],
  "Units": ["°", "²", "³", "⁴", "⁻¹", "₀", "₁", "₂", "₃", "ₙ"],
  "Arrows": ["→", "←", "↑", "↓", "↔", "⇒", "⇐", "⇔"],
  "Greek": ["α", "β", "γ", "δ", "ε", "θ", "λ", "μ", "ρ", "σ", "τ", "φ", "ω"],
  "Subscripts": ["₀", "₁", "₂", "₃", "₄", "₅", "ₙ", "ₓ"],
  "Superscripts": ["⁰", "¹", "²", "³", "⁴", "⁵", "ⁿ", "⁻"],
};

interface SymbolPickerProps {
  onSelect: (symbol: string) => void;
  className?: string;
}

export function SymbolPicker({ onSelect, className }: SymbolPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Insert Symbol (Ω, µ, ±, etc.)"
          className={cn("h-8 w-8 rounded hover:bg-slate-200 text-slate-700", className)}
        >
          <span className="font-serif font-bold text-base leading-none">Ω</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 max-h-80 overflow-y-auto" align="start">
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider pb-1 border-b">
            Insert Symbol
          </div>
          {Object.entries(symbolGroups).map(([group, symbols]) => (
            <div key={group}>
              <div className="text-xs font-medium text-slate-600 mb-1.5">{group}</div>
              <div className="grid grid-cols-8 gap-1">
                {symbols.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => onSelect(sym)}
                    className="h-7 w-7 flex items-center justify-center text-sm font-medium rounded hover:bg-slate-100 hover:text-blue-600 text-slate-800 border border-slate-200 transition-colors"
                    title={sym}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500 pt-1 border-t">
            Tip: LaTeX also works, e.g. <code>$10\,k\Omega$</code> or <code>$V_{'{'}CC{'}'}$</code>
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface SymbolInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
}

/** Text input with a symbol picker that inserts at the cursor position */
export function SymbolInput({ value, onValueChange, className, ...props }: SymbolInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const insert = (sym: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + sym + value.slice(end);
    onValueChange(next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + sym.length, start + sym.length);
    });
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn("pr-9", className)}
        {...props}
      />
      <SymbolPicker onSelect={insert} className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7" />
    </div>
  );
}
