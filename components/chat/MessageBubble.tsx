"use client"

import { User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '@/app/types/types'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.type === 'human'
  const isSystem = message.type === 'system'

  // System messages - centered notifications
  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-muted/50 px-4 py-2 text-[13px] text-foreground/60 font-medium">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({children}) => <span>{children}</span>,
              strong: ({children}) => <span className="font-semibold text-foreground">{children}</span>
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex gap-4 mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
        </div>
      )}
      
      <div
        className={cn(
          "rounded-2xl px-5 py-3.5 max-w-[75%] break-words",
          isUser
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-card text-card-foreground shadow-sm border border-border/50"
        )}
      >
        {isUser ? (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:tracking-tight prose-headings:font-semibold prose-p:text-[15px] prose-p:leading-relaxed prose-li:text-[15px] prose-li:leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-5 ml-1 bg-current animate-pulse rounded-sm" />
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center">
          <User className="w-5 h-5 text-foreground/60" />
        </div>
      )}
    </div>
  )
}

