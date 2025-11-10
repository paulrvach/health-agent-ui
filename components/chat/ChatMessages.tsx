"use client"

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { StreamingIndicator } from './StreamingIndicator'
import { useChat } from '@/context/ChatContext'
import { Brain } from 'lucide-react'

export function ChatMessages() {
  const { messages, streamState } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamState.currentMessage])

  if (messages.length === 0 && !streamState.isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-lg">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10" style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-[28px] font-semibold tracking-tight">Welcome to AI Coach</h2>
            <p className="text-[15px] text-foreground/60 leading-relaxed">
              Ask me anything about your fitness journey, workout techniques, injury prevention, or get personalized training advice.
            </p>
          </div>
          <div className="space-y-3 text-left pt-4">
            <div className="text-[13px] font-semibold text-foreground/60 uppercase tracking-wide">Suggestions</div>
            <div className="space-y-2">
              <div className="text-[15px] bg-card hover:bg-accent/30 rounded-xl px-5 py-3.5 cursor-pointer transition-colors shadow-sm border border-border/50">
                What exercises can help improve my flexibility?
              </div>
              <div className="text-[15px] bg-card hover:bg-accent/30 rounded-xl px-5 py-3.5 cursor-pointer transition-colors shadow-sm border border-border/50">
                How can I prevent lower back pain during squats?
              </div>
              <div className="text-[15px] bg-card hover:bg-accent/30 rounded-xl px-5 py-3.5 cursor-pointer transition-colors shadow-sm border border-border/50">
                Create a workout plan for building strength
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 px-4" ref={scrollRef}>
      <div className="max-w-4xl mx-auto py-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {streamState.isStreaming && streamState.currentMessage && (
          <MessageBubble
            message={{
              type: 'ai',
              content: streamState.currentMessage,
              id: 'streaming',
            }}
            isStreaming
          />
        )}
        
        {streamState.isStreaming && !streamState.currentMessage && (
          <StreamingIndicator />
        )}
        
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

