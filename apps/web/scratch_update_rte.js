const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components/ui/rich-text-editor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const imports = `import { useEditor, EditorContent } from '@tiptap/react';
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
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: \`font-size: \${attributes.fontSize}\` };
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
`;

content = content.replace(/import { useEditor, EditorContent } from '@tiptap\/react';[\s\S]*?import Link from '@tiptap\/extension-link';/, imports);

// Now update MenuBar to include color and size pickers
const menuBarTools = `{/* Text Formatting */}
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
        </select>
      </div>
      <Divider />
      <ToolbarButton`;

content = content.replace(`{/* Text Formatting */}
      <ToolbarButton`, menuBarTools);

// Update extensions array
const extensionsStr = `extensions: [
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
    ],`;

content = content.replace(/extensions: \[[\s\S]*?HTMLAttributes: { class: 'rte-link' },\s*}),\s*\],/, extensionsStr);

fs.writeFileSync(filePath, content);
console.log("Rich Text Editor Updated!");
