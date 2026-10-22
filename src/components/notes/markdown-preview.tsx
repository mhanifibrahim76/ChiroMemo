"use client";

import { useMemo } from "react";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const renderedContent = useMemo(() => {
    if (!content || content.trim().length === 0) {
      return null;
    }

    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-2 list-disc pl-6 space-y-1">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushCodeBlock = () => {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${elements.length}`}
            className="my-3 overflow-x-auto rounded-md bg-muted p-4 text-xs font-mono text-foreground"
          >
            <code>{codeBlockContent.join("\n")}</code>
          </pre>
        );
        inCodeBlock = false;
        codeBlockContent = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks ```
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          flushList();
          inCodeBlock = true;
          codeBlockContent = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Unordered lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        listItems.push(line.trim().slice(2));
        continue;
      } else {
        flushList();
      }

      // Headings
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="mt-4 mb-2 text-2xl font-bold tracking-tight">
            {renderInline(line.slice(2))}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="mt-4 mb-2 text-xl font-semibold tracking-tight">
            {renderInline(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="mt-3 mb-1.5 text-lg font-medium">
            {renderInline(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={i}
            className="my-2 border-l-4 border-primary/40 pl-4 italic text-sm text-muted-foreground"
          >
            {renderInline(line.slice(2))}
          </blockquote>
        );
      } else if (line.trim().length === 0) {
        // Blank line
        elements.push(<div key={i} className="h-2" />);
      } else {
        // Regular paragraph
        elements.push(
          <p key={i} className="my-1.5 text-sm leading-relaxed text-foreground/90">
            {renderInline(line)}
          </p>
        );
      }
    }

    flushList();
    flushCodeBlock();

    return elements;
  }, [content]);

  if (!renderedContent) {
    return (
      <div className="py-12 text-center text-sm italic text-muted-foreground">
        Nothing to preview yet. Switch to &ldquo;Write&rdquo; tab and start typing your notes.
      </div>
    );
  }

  return <div className="space-y-1">{renderedContent}</div>;
}

/** Parses inline markdown: bold **text**, italic *text*, code `code`, and links [title](url) */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold: **bold**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *italic*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(
        <em key={key++} className="italic">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:opacity-80"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Plain text until next token
    const nextSpecial = remaining.search(/[`*\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // First char is special but didn't match a pattern
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}

