"use client"

import { useEffect, useRef, useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { StreamingIndicator } from './StreamingIndicator'
import { useChat } from '@/context/ChatContext'
import { Brain } from 'lucide-react'
import type { Message } from '@/app/types/types'

interface ProcessedMessage {
  message: Message
  toolCalls: Array<{
    id: string
    name: string
    args: Record<string, unknown>
    status: 'pending' | 'completed'
    result?: string
  }>
  showAvatar: boolean
}

export function ChatMessages() {
  const { messages, streamState, isLoadingThreadState } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamState.currentMessage])

  // Process messages to group AI messages with their tool calls (similar to deep-agents-ui)
  const processedMessages = useMemo<ProcessedMessage[]>(() => {
    const messageMap = new Map<string, ProcessedMessage>()

    messages.forEach((message: Message) => {
      if (message.type === 'ai') {
        const toolCallsInMessage: Array<{
          id: string
          name: string
          args: Record<string, unknown>
        }> = []

        // Extract tool calls from various possible locations
        if (message.additional_kwargs?.tool_calls && Array.isArray(message.additional_kwargs.tool_calls)) {
          message.additional_kwargs.tool_calls.forEach((toolCall: unknown) => {
            if (toolCall && typeof toolCall === 'object' && 'name' in toolCall) {
              toolCallsInMessage.push({
                id: (toolCall as { id?: string }).id || `tool-${Math.random()}`,
                name: String((toolCall as { name: string }).name),
                args: ((toolCall as { args?: Record<string, unknown> }).args || {}) as Record<string, unknown>
              })
            }
          })
        }

        // Also check for tool_calls at message root (LangChain format)
        const messageWithToolCalls = message as Message & { tool_calls?: Array<Record<string, unknown>> }
        if (messageWithToolCalls.tool_calls && Array.isArray(messageWithToolCalls.tool_calls)) {
          messageWithToolCalls.tool_calls.forEach((toolCall) => {
            if (toolCall && typeof toolCall === 'object' && 'name' in toolCall) {
              toolCallsInMessage.push({
                id: String(toolCall.id || `tool-${Math.random()}`),
                name: String(toolCall.name),
                args: (toolCall.args || {}) as Record<string, unknown>
              })
            }
          })
        }

        const toolCallsWithStatus = toolCallsInMessage.map(toolCall => ({
          ...toolCall,
          status: 'pending' as const
        }))

        messageMap.set(message.id || `msg-${Math.random()}`, {
          message,
          toolCalls: toolCallsWithStatus,
          showAvatar: false // Will be set based on previous message
        })
      } else if (message.type === 'tool') {
        // Find the corresponding AI message and update tool call status
        const toolCallId = message.tool_call_id
        if (toolCallId) {
          for (const [, data] of messageMap.entries()) {
            const toolCallIndex = data.toolCalls.findIndex(tc => tc.id === toolCallId)
            if (toolCallIndex !== -1) {
              data.toolCalls[toolCallIndex] = {
                ...data.toolCalls[toolCallIndex],
                status: 'completed',
                result: message.content
              }
              break
            }
          }
        }
      } else if (message.type === 'human' || message.type === 'system') {
        messageMap.set(message.id || `msg-${Math.random()}`, {
          message,
          toolCalls: [],
          showAvatar: false // Will be set based on previous message
        })
      }
    })

    // Set showAvatar based on whether previous message has different type
    const processedArray = Array.from(messageMap.values())
    return processedArray.map((data, index) => {
      const prevMessage = index > 0 ? processedArray[index - 1].message : null
      return {
        ...data,
        showAvatar: data.message.type !== prevMessage?.type
      }
    })
  }, [messages])

  const hasMessages = processedMessages.length > 0 || streamState.isStreaming

  if (!hasMessages && !isLoadingThreadState) {
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
    <ScrollArea className="flex-1 w-full">
      <div className="px-4 lg:px-6 py-4">
        {isLoadingThreadState && (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
        
        {!isLoadingThreadState && (
          <div className="max-w-4xl mx-auto space-y-1">
            {processedMessages.map((data) => (
              <MessageBubble
                key={data.message.id || `msg-${Math.random()}`}
                message={data.message}
                toolCalls={data.toolCalls}
                showAvatar={data.showAvatar}
              />
            ))}
            
            {streamState.isStreaming && streamState.currentMessage && (
              <MessageBubble
                message={{
                  type: 'ai',
                  content: streamState.currentMessage,
                  id: 'streaming',
                }}
                toolCalls={[]}
                showAvatar={processedMessages.length === 0 || processedMessages[processedMessages.length - 1]?.message.type !== 'ai'}
                isStreaming
              />
            )}
            
            {streamState.isStreaming && !streamState.currentMessage && (
              <div className="flex items-center justify-center gap-2 py-4 text-foreground/60">
                <StreamingIndicator />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

