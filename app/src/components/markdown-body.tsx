import ReactMarkdown from "react-markdown";

// Renders Explanation/model-answer bodies with real headings, bold, and lists — plain
// `whitespace-pre-line` text can't show structure like "## Pathophysiology" as an actual
// heading, it just prints the literal "##" characters.
export function MarkdownBody({ children }: { children: string }) {
  return (
    <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
      <ReactMarkdown
        components={{
          h1: (props) => <h3 className="text-foreground font-serif font-semibold text-base mt-5 mb-1.5 first:mt-0" {...props} />,
          h2: (props) => <h3 className="text-foreground font-serif font-semibold text-base mt-5 mb-1.5 first:mt-0" {...props} />,
          h3: (props) => <h4 className="text-foreground font-semibold text-sm uppercase tracking-wide mt-4 mb-1 first:mt-0" {...props} />,
          p: (props) => <p className="mb-2.5 last:mb-0" {...props} />,
          strong: (props) => <strong className="text-foreground font-semibold" {...props} />,
          em: (props) => <em className="italic" {...props} />,
          ul: (props) => <ul className="list-disc pl-5 space-y-1 mb-2.5" {...props} />,
          ol: (props) => <ol className="list-decimal pl-5 space-y-1 mb-2.5" {...props} />,
          li: (props) => <li {...props} />,
          blockquote: (props) => (
            <blockquote className="border-l-2 border-primary/30 pl-3 italic text-muted-foreground/90" {...props} />
          ),
          hr: () => <hr className="border-border my-4" />,
          code: (props) => <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
