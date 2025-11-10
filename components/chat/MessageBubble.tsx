"use client"

import { useState, useRef, useEffect } from 'react'
import { User, Bot, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '@/app/types/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
  status: 'pending' | 'completed'
  result?: string
}

interface MessageBubbleProps {
  message: Message
  toolCalls?: ToolCall[]
  showAvatar?: boolean
  isStreaming?: boolean
}

const MAX_HEIGHT = 200 // Maximum height in pixels before collapsing

export function MessageBubble({ message, toolCalls = [], showAvatar = true, isStreaming }: MessageBubbleProps) {
  const isUser = message.type === 'human'
  const isSystem = message.type === 'system'
  const contentRef = useRef<HTMLParagraphElement>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [needsCollapse, setNeedsCollapse] = useState(false)
  
  const messageContent = message.content || ''
  const hasContent = messageContent.trim() !== ''
  const hasToolCalls = toolCalls.length > 0 && toolCalls.some(tc => tc.name !== 'task')

  // Check if content needs collapsing (only for user messages)
  useEffect(() => {
    if (isUser && contentRef.current) {
      // Use setTimeout to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        if (contentRef.current) {
          const height = contentRef.current.scrollHeight
          if (height > MAX_HEIGHT) {
            setNeedsCollapse(true)
            setIsCollapsed(true)
          } else {
            setNeedsCollapse(false)
            setIsCollapsed(false)
          }
        }
      }, 0)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isUser, messageContent])

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
        "flex gap-3 w-full max-w-full overflow-x-hidden",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar - only show when showAvatar is true */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-4",
          !showAvatar && "bg-transparent",
          isUser 
            ? showAvatar && "bg-primary"
            : showAvatar && "bg-muted"
        )}
      >
        {showAvatar && (
          isUser ? (
            <User className="w-4 h-4 text-primary-foreground" />
          ) : (
            <Bot className="w-4 h-4 text-foreground/60" />
          )
        )}
      </div>
      
      {/* Message Content */}
      <div className="flex-0 flex-1 min-w-0 max-w-[70%]">
        {/* Message Bubble */}
        {hasContent && (
          <div
            className={cn(
              "rounded-lg px-3 py-2 break-words overflow-hidden",
              "w-fit max-w-full",
              isUser
                ? "bg-primary text-primary-foreground ml-auto mt-4"
                : "bg-card text-card-foreground border border-border/50 mt-4"
            )}
          >
            {isUser ? (
              <div className="space-y-2">
                <div className="relative">
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isCollapsed && needsCollapse ? "max-h-[150px]" : "max-h-none"
                    )}
                  >
                    <p 
                      ref={contentRef}
                      className="text-[15px] leading-relaxed whitespace-pre-wrap m-0"
                    >
                      {messageContent}
                    </p>
                  </div>
                  {isCollapsed && needsCollapse && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--primary)) 100%)'
                      }}
                    />
                  )}
                </div>
                {needsCollapse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                      "h-7 px-2 text-[13px] font-medium hover:bg-primary/20 transition-colors",
                      "text-primary-foreground/80 hover:text-primary-foreground"
                    )}
                  >
                    {isCollapsed ? (
                      <>
                        Show more
                        <ChevronDown className="ml-1 h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Show less
                        <ChevronUp className="ml-1 h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:tracking-tight prose-headings:font-semibold prose-p:text-[15px] prose-p:leading-relaxed prose-li:text-[15px] prose-li:leading-relaxed prose-p:m-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {messageContent}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-1.5 h-5 ml-1 bg-current animate-pulse rounded-sm" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Tool Calls (non-task tool calls) */}
        {hasToolCalls && (
          <div className="mt-2 flex flex-col gap-2 w-fit max-w-full">
            {toolCalls
              .filter(tc => tc.name !== 'task')
              .map((toolCall) => (
                <div
                  key={toolCall.id}
                  className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-[13px]"
                >
                  <div className="font-medium text-foreground/80 mb-1">
                    {toolCall.name}
                  </div>
                  {toolCall.status === 'completed' && toolCall.result && (
                    <div className="text-foreground/60 text-[12px] mt-1">
                      {toolCall.result.substring(0, 100)}
                      {toolCall.result.length > 100 ? '...' : ''}
                    </div>
                  )}
                  {toolCall.status === 'pending' && (
                    <div className="text-foreground/40 text-[12px] mt-1 italic">
                      Processing...
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

