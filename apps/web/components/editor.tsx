"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Editor({ value, onChange, className }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg border border-slate-200 max-w-full h-auto my-4',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Image URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md bg-white", className)}>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-slate-50 rounded-t-md">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') ? 'bg-slate-200' : '')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') ? 'bg-slate-200' : '')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(editor.isActive('underline') ? 'bg-slate-200' : '')}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(editor.isActive('heading', { level: 1 }) ? 'bg-slate-200' : '')}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : '')}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') ? 'bg-slate-200' : '')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') ? 'bg-slate-200' : '')}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive('blockquote') ? 'bg-slate-200' : '')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(editor.isActive('codeBlock') ? 'bg-slate-200' : '')}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={cn(editor.isActive('link') ? 'bg-slate-200' : '')}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          title="Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
