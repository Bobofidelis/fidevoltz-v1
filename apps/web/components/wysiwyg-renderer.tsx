export interface WysiwygNode {
  type: string;
  content?: WysiwygNode[];
  text?: string;
  attrs?: Record<string, any>;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

export interface WysiwygContent {
  type: "doc";
  content: WysiwygNode[];
}

interface WysiwygRendererProps {
  content: WysiwygContent | string | any;
}

function renderNode(node: WysiwygNode, index: number): React.ReactNode {
  const { type, content, text, attrs, marks } = node;

  // Handle text nodes
  if (type === "text" && text) {
    let textElement: React.ReactNode = text;
    
    // Apply marks (bold, italic, etc.)
    if (marks) {
      marks.forEach((mark) => {
        if (mark.type === "bold") {
          textElement = <strong key={`mark-${index}`}>{textElement}</strong>;
        } else if (mark.type === "italic") {
          textElement = <em key={`mark-${index}`}>{textElement}</em>;
        } else if (mark.type === "code") {
          textElement = <code key={`mark-${index}`} className="px-1.5 py-0.5 bg-slate-100 rounded text-sm">{textElement}</code>;
        }
      });
    }
    
    return textElement;
  }

  // Handle block nodes
  const children = content?.map((child, i) => renderNode(child, i));

  switch (type) {
    case "doc":
      return <div key={index}>{children}</div>;
      
    case "paragraph":
      return <p key={index} className="mb-4 text-slate-700 leading-relaxed">{children}</p>;
      
    case "heading":
      const level = attrs?.level || 1;
      const headingClasses = {
        1: "text-4xl font-bold text-slate-900 mb-6 mt-8",
        2: "text-3xl font-bold text-slate-900 mb-4 mt-8",
        3: "text-2xl font-semibold text-slate-900 mb-3 mt-6",
        4: "text-xl font-semibold text-slate-900 mb-2 mt-4",
        5: "text-lg font-semibold text-slate-900 mb-2 mt-4",
        6: "text-base font-semibold text-slate-900 mb-2 mt-4",
      };
      const headingClass = headingClasses[level as keyof typeof headingClasses];
      
      if (level === 1) return <h1 key={index} className={headingClass}>{children}</h1>;
      if (level === 2) return <h2 key={index} className={headingClass}>{children}</h2>;
      if (level === 3) return <h3 key={index} className={headingClass}>{children}</h3>;
      if (level === 4) return <h4 key={index} className={headingClass}>{children}</h4>;
      if (level === 5) return <h5 key={index} className={headingClass}>{children}</h5>;
      return <h6 key={index} className={headingClass}>{children}</h6>;
      
    case "bulletList":
      return <ul key={index} className="list-disc list-inside mb-4 space-y-2 text-slate-700">{children}</ul>;
      
    case "orderedList":
      return <ol key={index} className="list-decimal list-inside mb-4 space-y-2 text-slate-700">{children}</ol>;
      
    case "listItem":
      return <li key={index} className="ml-4">{children}</li>;
      
    case "codeBlock":
      const language = attrs?.language || "text";
      return (
        <pre key={index} className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4">
          <code className={`language-${language}`}>{children}</code>
        </pre>
      );
      
    case "blockquote":
      return (
        <blockquote key={index} className="border-l-4 border-slate-300 pl-4 italic text-slate-600 mb-4">
          {children}
        </blockquote>
      );
      
    case "horizontalRule":
      return <hr key={index} className="my-8 border-slate-200" />;
      
    default:
      return <div key={index}>{children}</div>;
  }
}

export function WysiwygRenderer({ content }: WysiwygRendererProps) {
  // Handle HTML string content (from database)
  if (typeof content === 'string') {
    return (
      <div 
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  
  // Handle structured WYSIWYG content (from editor)
  if (content && typeof content === 'object' && content.content) {
    return (
      <div className="prose prose-slate max-w-none">
        {content.content.map((node: WysiwygNode, index: number) => renderNode(node, index))}
      </div>
    );
  }
  
  // Fallback for empty or invalid content
  return (
    <div className="prose prose-slate max-w-none">
      <p className="text-slate-500 italic">No content available.</p>
    </div>
  );
}
