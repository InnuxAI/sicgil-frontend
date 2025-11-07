'use client'

import { FC, useState } from 'react'
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

// Language display names with color coding
const languageConfig: Record<string, { label: string; color: string }> = {
  javascript: { label: 'JavaScript', color: 'bg-yellow-500/20 text-yellow-500' },
  typescript: { label: 'TypeScript', color: 'bg-blue-500/20 text-blue-500' },
  python: { label: 'Python', color: 'bg-blue-400/20 text-blue-400' },
  java: { label: 'Java', color: 'bg-orange-500/20 text-orange-500' },
  cpp: { label: 'C++', color: 'bg-pink-500/20 text-pink-500' },
  c: { label: 'C', color: 'bg-blue-600/20 text-blue-600' },
  csharp: { label: 'C#', color: 'bg-purple-500/20 text-purple-500' },
  go: { label: 'Go', color: 'bg-cyan-500/20 text-cyan-500' },
  rust: { label: 'Rust', color: 'bg-orange-600/20 text-orange-600' },
  php: { label: 'PHP', color: 'bg-indigo-500/20 text-indigo-500' },
  ruby: { label: 'Ruby', color: 'bg-red-500/20 text-red-500' },
  swift: { label: 'Swift', color: 'bg-orange-400/20 text-orange-400' },
  kotlin: { label: 'Kotlin', color: 'bg-purple-400/20 text-purple-400' },
  bash: { label: 'Bash', color: 'bg-green-500/20 text-green-500' },
  shell: { label: 'Shell', color: 'bg-green-500/20 text-green-500' },
  sql: { label: 'SQL', color: 'bg-blue-300/20 text-blue-300' },
  json: { label: 'JSON', color: 'bg-gray-500/20 text-gray-400' },
  yaml: { label: 'YAML', color: 'bg-red-400/20 text-red-400' },
  html: { label: 'HTML', color: 'bg-orange-500/20 text-orange-500' },
  css: { label: 'CSS', color: 'bg-blue-500/20 text-blue-500' },
  markdown: { label: 'Markdown', color: 'bg-gray-500/20 text-gray-400' },
  text: { label: 'Plain Text', color: 'bg-gray-500/20 text-gray-400' }
}

const CodeBlock: FC<CodeBlockProps> = ({ children, className, inline }) => {
  const [copied, setCopied] = useState(false)
  const language = getLanguageFromClassName(className)
  const config = languageConfig[language] || languageConfig.text

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
    <div className="group relative my-4 overflow-hidden rounded-lg border border-accent/30 bg-[#1e1e1e]">
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
}

export default CodeBlock
