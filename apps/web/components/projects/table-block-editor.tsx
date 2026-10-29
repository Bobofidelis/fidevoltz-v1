"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SymbolPicker } from "@/components/ui/symbol-picker";
import { cn } from "@/lib/utils";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Columns3, Plus, Rows3, Trash2, X,
} from "lucide-react";

export type ColumnAlign = "left" | "center" | "right";

export interface TableBlockContent {
  title?: string;
  caption?: string;
  rows: string[][];
  align?: ColumnAlign[];
  headerRow?: boolean;
  headerColumn?: boolean;
  striped?: boolean;
}

export const DEFAULT_TABLE_CONTENT: TableBlockContent = {
  title: "",
  caption: "",
  rows: [
    ["Pin", "Function", "Notes"],
    ["", "", ""],
    ["", "", ""],
  ],
  align: ["left", "left", "left"],
  headerRow: true,
  headerColumn: false,
  striped: true,
};

const MAX_COLS = 12;

interface TableBlockEditorProps {
  content: TableBlockContent;
  onChange: (content: TableBlockContent) => void;
}

export function TableBlockEditor({ content, onChange }: TableBlockEditorProps) {
  const rows = content.rows?.length ? content.rows : DEFAULT_TABLE_CONTENT.rows;
  const colCount = Math.max(1, ...rows.map((r) => r.length));
  const align = Array.from({ length: colCount }, (_, i) => content.align?.[i] || "left");
  const lastFocused = useRef<{ el: HTMLTextAreaElement; r: number; c: number } | null>(null);

  const update = (patch: Partial<TableBlockContent>) => onChange({ ...content, rows, align, ...patch });

  // Keep every row the same width
  const normalize = (grid: string[][], cols = colCount) =>
    grid.map((r) => Array.from({ length: cols }, (_, i) => r[i] ?? ""));

  const setCell = (r: number, c: number, value: string) => {
    const next = normalize(rows).map((row) => [...row]);
    next[r][c] = value;
    update({ rows: next });
  };

  const insertRow = (at: number) => {
    const next = normalize(rows);
    next.splice(at, 0, Array(colCount).fill(""));
    update({ rows: next });
  };

  const removeRow = (r: number) => {
    if (rows.length <= 1) return;
    update({ rows: rows.filter((_, i) => i !== r) });
  };

  const moveRow = (r: number, dir: -1 | 1) => {
    const target = r + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[r], next[target]] = [next[target], next[r]];
    update({ rows: next });
  };

  const insertColumn = (at: number) => {
    if (colCount >= MAX_COLS) return;
    const next = normalize(rows).map((row) => {
      const copy = [...row];
      copy.splice(at, 0, "");
      return copy;
    });
    const nextAlign = [...align];
    nextAlign.splice(at, 0, "left");
    update({ rows: next, align: nextAlign });
  };

  const removeColumn = (c: number) => {
    if (colCount <= 1) return;
    update({
      rows: normalize(rows).map((row) => row.filter((_, i) => i !== c)),
      align: align.filter((_, i) => i !== c),
    });
  };

  const cycleAlign = (c: number) => {
    const order: ColumnAlign[] = ["left", "center", "right"];
    const nextAlign = [...align];
    nextAlign[c] = order[(order.indexOf(align[c]) + 1) % order.length];
    update({ align: nextAlign });
  };

  // Pasting a block copied from Excel / Google Sheets fills the grid from the focused cell
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, r: number, c: number) => {
    const text = e.clipboardData.getData("text/plain");
    if (!text.includes("\t") && !/\r?\n/.test(text.trim())) return;
    e.preventDefault();
    const pasted = text.replace(/\r?\n$/, "").split(/\r?\n/).map((line) => line.split("\t"));
    const neededCols = Math.min(MAX_COLS, Math.max(colCount, c + Math.max(...pasted.map((p) => p.length))));
    const next = normalize(rows, neededCols).map((row) => [...row]);
    pasted.forEach((line, dr) => {
      const rowIndex = r + dr;
      while (next.length <= rowIndex) next.push(Array(neededCols).fill(""));
      line.forEach((cell, dc) => {
        if (c + dc < neededCols) next[rowIndex][c + dc] = cell.trim();
      });
    });
    update({
      rows: next,
      align: Array.from({ length: neededCols }, (_, i) => align[i] || "left"),
    });
  };

  const insertSymbol = (sym: string) => {
    const target = lastFocused.current;
    if (!target) return;
    const { el, r, c } = target;
    const value = rows[r]?.[c] ?? "";
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    setCell(r, c, value.slice(0, start) + sym + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + sym.length, start + sym.length);
    });
  };

  const AlignIcon = (a: ColumnAlign) => (a === "center" ? AlignCenter : a === "right" ? AlignRight : AlignLeft);

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Table title (optional)</Label>
          <Input
            placeholder="e.g. Pin connections"
            value={content.title || ""}
            onChange={(e) => update({ title: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Caption / note under the table (optional)</Label>
          <Input
            placeholder="e.g. All voltages measured at 25 °C"
            value={content.caption || ""}
            onChange={(e) => update({ caption: e.target.value })}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={content.headerRow ?? true} onCheckedChange={(v) => update({ headerRow: v })} />
          Header row
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={!!content.headerColumn} onCheckedChange={(v) => update({ headerColumn: v })} />
          First column bold
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={content.striped ?? true} onCheckedChange={(v) => update({ striped: v })} />
          Striped rows
        </label>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-slate-600">Symbol:</span>
          <SymbolPicker onSelect={insertSymbol} className="border bg-white" />
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="w-20" />
              {Array.from({ length: colCount }).map((_, c) => {
                const Icon = AlignIcon(align[c]);
                return (
                  <th key={c} className="px-1 py-1 border-l min-w-[140px]">
                    <div className="flex items-center justify-center gap-0.5">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Insert column left" onClick={() => insertColumn(c)} disabled={colCount >= MAX_COLS}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title={`Align ${align[c]} (click to change)`} onClick={() => cycleAlign(c)}>
                        <Icon className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500" title="Delete column" onClick={() => removeColumn(c)} disabled={colCount <= 1}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {normalize(rows).map((row, r) => {
              const isHeader = r === 0 && (content.headerRow ?? true);
              return (
                <tr key={r} className={cn("border-t", isHeader && "bg-blue-50/60")}>
                  <td className="px-1 py-1 align-top">
                    <div className="flex flex-col items-center">
                      <div className="flex">
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" title="Move up" onClick={() => moveRow(r, -1)} disabled={r === 0}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" title="Move down" onClick={() => moveRow(r, 1)} disabled={r === rows.length - 1}>
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex">
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" title="Insert row below" onClick={() => insertRow(r + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500" title="Delete row" onClick={() => removeRow(r)} disabled={rows.length <= 1}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </td>
                  {row.map((cell, c) => (
                    <td key={c} className="border-l p-1 align-top">
                      <textarea
                        value={cell}
                        rows={Math.min(6, Math.max(1, cell.split("\n").length))}
                        placeholder={isHeader ? `Heading ${c + 1}` : ""}
                        onFocus={(e) => (lastFocused.current = { el: e.currentTarget, r, c })}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        onPaste={(e) => handlePaste(e, r, c)}
                        className={cn(
                          "w-full resize-y rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm leading-snug text-slate-900 placeholder:text-slate-400 hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100",
                          isHeader && "font-semibold",
                          align[c] === "center" && "text-center",
                          align[c] === "right" && "text-right"
                        )}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => insertRow(rows.length)}>
          <Rows3 className="h-4 w-4 mr-1.5" /> Add row
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => insertColumn(colCount)} disabled={colCount >= MAX_COLS}>
          <Columns3 className="h-4 w-4 mr-1.5" /> Add column
        </Button>
        <span className="text-xs text-slate-600">
          {rows.length} rows × {colCount} columns · Tip: copy cells from Excel/Google Sheets and paste into any cell.
          Use Enter for a new line inside a cell, and <code>$...$</code> for formulas.
        </span>
      </div>
    </div>
  );
}
