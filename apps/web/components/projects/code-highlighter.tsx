// Light build of the syntax highlighter with only the languages tutorials use.
// The full build ships ~300 languages to every reader, which made tutorial pages slow.
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import './code-dark.css';
import arduino from 'react-syntax-highlighter/dist/esm/languages/prism/arduino';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import ini from 'react-syntax-highlighter/dist/esm/languages/prism/ini';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import matlab from 'react-syntax-highlighter/dist/esm/languages/prism/matlab';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

const LANGUAGES: Record<string, unknown> = {
  arduino, bash, c, cpp, css, ini, java, javascript, json, jsx, markdown, markup, matlab, python, rust, sql, tsx, typescript, yaml,
};
for (const [name, def] of Object.entries(LANGUAGES)) SyntaxHighlighter.registerLanguage(name, def);

const ALIASES: Record<string, string> = {
  'c++': 'cpp', ino: 'arduino', sh: 'bash', shell: 'bash', zsh: 'bash', js: 'javascript', ts: 'typescript',
  py: 'python', html: 'markup', xml: 'markup', svg: 'markup', yml: 'yaml', md: 'markdown', rs: 'rust', m: 'matlab',
};

export function resolveLanguage(language?: string | null): string {
  const lang = (language || '').toLowerCase().trim();
  const resolved = ALIASES[lang] || lang;
  return resolved in LANGUAGES ? resolved : 'text';
}

export function CodeHighlighter({
  language,
  code,
  className,
  rounded = false,
}: {
  language?: string | null;
  code: string;
  className?: string;
  rounded?: boolean;
}) {
  return (
    <SyntaxHighlighter
      // Colours come from code-dark.css classes instead of an inline style on every token,
      // which made long tutorials several hundred KB heavier
      useInlineStyles={false}
      language={resolveLanguage(language)}
      PreTag="div"
      className={['code-dark', className].filter(Boolean).join(' ')}
      customStyle={rounded ? undefined : { margin: 0, borderRadius: 0, background: '#1e1e1e' }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
