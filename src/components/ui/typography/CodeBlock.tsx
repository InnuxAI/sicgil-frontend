'use client'

import { FC, useState, memo, useMemo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: string
  className?: string
  inline?: boolean
}

// Language detection from className (e.g., "language-python")
const getLanguageFromClassName = (className?: string): string => {
  if (!className) return 'text'
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : 'text'
}

// Language display names with color coding using theme colors
const languageConfig: Record<string, { label: string; color: string }> = {
  javascript: { label: 'JavaScript', color: 'bg-brand/20 text-brand' },
  typescript: { label: 'TypeScript', color: 'bg-primary-accent/20 text-primary-accent' },
  python: { label: 'Python', color: 'bg-primary-accent/30 text-primary-accent' },
  java: { label: 'Java', color: 'bg-brand/30 text-brand' },
  cpp: { label: 'C++', color: 'bg-accent/20 text-accent-foreground' },
  c: { label: 'C', color: 'bg-primary-accent/40 text-primary-accent' },
  csharp: { label: 'C#', color: 'bg-accent/30 text-accent-foreground' },
  go: { label: 'Go', color: 'bg-primary-accent/20 text-primary-accent' },
  rust: { label: 'Rust', color: 'bg-brand/25 text-brand' },
  php: { label: 'PHP', color: 'bg-accent/25 text-accent-foreground' },
  ruby: { label: 'Ruby', color: 'bg-destructive/20 text-destructive' },
  swift: { label: 'Swift', color: 'bg-brand/30 text-brand' },
  kotlin: { label: 'Kotlin', color: 'bg-accent/20 text-accent-foreground' },
  bash: { label: 'Bash', color: 'bg-positive/20 text-positive' },
  shell: { label: 'Shell', color: 'bg-positive/20 text-positive' },
  sql: { label: 'SQL', color: 'bg-primary-accent/25 text-primary-accent' },
  json: { label: 'JSON', color: 'bg-muted/20 text-muted-foreground' },
  yaml: { label: 'YAML', color: 'bg-destructive/25 text-destructive' },
  html: { label: 'HTML', color: 'bg-brand/20 text-brand' },
  css: { label: 'CSS', color: 'bg-primary-accent/20 text-primary-accent' },
  markdown: { label: 'Markdown', color: 'bg-muted/20 text-muted-foreground' },
  text: { label: 'Plain Text', color: 'bg-muted/20 text-muted-foreground' }
}

const CodeBlock: FC<CodeBlockProps> = memo(({ children, className, inline }) => {
  const [copied, setCopied] = useState(false)
  
  // Memoize language detection
  const language = useMemo(() => getLanguageFromClassName(className), [className])
  const config = useMemo(() => languageConfig[language] || languageConfig.text, [language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Inline code (no syntax highlighting, just styled)
  if (inline) {
    return (
      <code className="relative whitespace-pre-wrap rounded-sm bg-background-secondary/50 px-1.5 py-0.5 font-mono text-xs">
        {children}
      </code>
    )
  }

  // Block code with syntax highlighting
  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-accent/30 bg-background-secondary">
      {/* Header with language badge and copy button */}
      <div className="flex items-center justify-between border-b border-accent/30 bg-background-secondary/30 px-4 py-2">
        <span
          className={cn(
            'rounded-md px-2 py-1 text-xs font-semibold uppercase',
            config.color
          )}
        >
          {config.label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-primary/60 transition-colors hover:bg-accent/50 hover:text-primary"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content with syntax highlighting and line numbers */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.813rem',
            lineHeight: '1.5'
          }}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: '#858585',
            userSelect: 'none'
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
            }
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  )
})

CodeBlock.displayName = 'CodeBlock'

export default CodeBlock
