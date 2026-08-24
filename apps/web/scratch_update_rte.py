import sys

with open("components/ui/rich-text-editor.tsx", "r", encoding="utf-8") as f:
    content = f.read()

imports = """import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';

// Custom FontSize Extension
export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});
"""

# Replace imports
start = content.find("import { useEditor")
end = content.find("import {", start + 1)
content = content[:start] + imports + content[end:]

# Add toolbar buttons
menu_bar = """{/* Text Formatting */}
      <div className="flex items-center gap-1 bg-white border rounded px-1 py-0.5">
        <input 
          type="color" 
          onChange={e => editor.chain().focus().setColor(e.target.value).run()} 
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
          title="Text Color"
        />
        <select 
          onChange={e => {
            if (e.target.value === '') editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(e.target.value).run();
          }}
          value={editor.getAttributes('textStyle').fontSize || ''}
          className="h-6 text-xs border-0 bg-transparent focus:ring-0 text-slate-700 w-16"
          title="Font Size"
        >
          <option value="">Size</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="30px">30px</option>
          <option value="36px">36px</option>
        </select>
      </div>
      <Divider />
      <ToolbarButton"""

content = content.replace("{/* Text Formatting */}\n      <ToolbarButton", menu_bar)

# Update extensions array
extensions_start = content.find("extensions: [")
extensions_end = content.find("],", extensions_start) + 2

extensions_str = """extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        bulletList: {
          HTMLAttributes: { class: 'rte-ul' },
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          HTMLAttributes: { class: 'rte-ol' },
          keepMarks: true,
          keepAttributes: true,
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'rte-link' },
      }),
    ],"""

content = content[:extensions_start] + extensions_str + content[extensions_end:]

with open("components/ui/rich-text-editor.tsx", "w", encoding="utf-8") as f:
    f.write(content)
