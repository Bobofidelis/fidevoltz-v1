"use client";

import { useEditor, EditorContent } from '@tiptap/react';
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
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading1, Heading2, Heading3, Quote,
  Link as LinkIcon, Undo, Redo, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const ToolbarButton = ({ 
  onClick, 
  active = false, 
  disabled = false, 
  title, 
  children 
}: { 
  onClick: () => void; 
  active?: boolean; 
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "h-8 w-8 rounded",
      active ? 'bg-slate-700 text-white hover:bg-slate-700' : 'hover:bg-slate-200 text-slate-700'
    )}
  >
    {children}
  </Button>
);

const Divider = () => <div className="w-px h-6 bg-slate-300 mx-1 self-center" />;

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-slate-50 rounded-t-md">
      {/* Text Formatting */}
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
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        active={editor.isActive('heading', { level: 4 })}
        title="Heading 4"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={setLink}
        active={editor.isActive('link')}
        title="Add Link"
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
};

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
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
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'rte-editor focus:outline-none min-h-[200px] p-4',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className={cn("border rounded-md bg-white overflow-hidden shadow-sm", className)}>
      {/* Scoped styles for TipTap editor content */}
      <style>{`
        .rte-editor h2 { font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.75rem; color: #1e293b; }
        .rte-editor h3 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #1e293b; }
        .rte-editor h4 { font-size: 1.1rem; font-weight: 700; margin: 0.75rem 0 0.5rem; color: #1e293b; }
        .rte-editor p { margin: 0.5rem 0; line-height: 1.75; }
        .rte-editor p:first-child { margin-top: 0; }
        .rte-editor strong { font-weight: 700; }
        .rte-editor em { font-style: italic; }
        .rte-editor u { text-decoration: underline; }
        .rte-editor s { text-decoration: line-through; }
        .rte-editor ul.rte-ul, .rte-editor ul { list-style-type: disc !important; padding-left: 1.75rem !important; margin: 0.75rem 0; }
        .rte-editor ol.rte-ol, .rte-editor ol { list-style-type: decimal !important; padding-left: 1.75rem !important; margin: 0.75rem 0; }
        .rte-editor li { margin: 0.3rem 0; line-height: 1.6; display: list-item !important; }
        .rte-editor li p { margin: 0; }
        .rte-editor blockquote { border-left: 4px solid #6366f1; padding: 0.75rem 1rem; margin: 1rem 0; background: #f8f8ff; color: #4b5563; font-style: italic; border-radius: 0 0.5rem 0.5rem 0; }
        .rte-editor a.rte-link { color: #2563eb; text-decoration: underline; }
        .rte-editor a.rte-link:hover { color: #1d4ed8; }
        .rte-editor hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5rem 0; }
        .rte-editor code { background: #f1f5f9; color: #e11d48; border-radius: 0.25rem; padding: 0.1rem 0.3rem; font-size: 0.875em; font-family: monospace; }
        .rte-editor pre { background: #1e293b; color: #f8fafc; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; overflow-x: auto; }
        .rte-editor .ProseMirror-focused { outline: none; }
      `}</style>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {!editor?.getText() && placeholder && (
        <div className="pointer-events-none absolute px-4 pt-4 text-slate-400 text-sm">{placeholder}</div>
      )}
    </div>
  );
}
