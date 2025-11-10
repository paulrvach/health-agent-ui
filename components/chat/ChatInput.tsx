"use client"

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Square } from 'lucide-react'
import { useChat } from '@/context/ChatContext'

export function ChatInput() {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, stopStreaming, streamState } = useChat()

  const handleSubmit = async () => {
    if (!input.trim() || streamState.isStreaming) return

    await sendMessage(input.trim())
    setInput('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  return (
    <div className="border-t bg-background/95 backdrop-blur-sm p-5">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask your AI coach anything..."
          disabled={streamState.isStreaming}
          className="flex-1 min-h-[52px] max-h-[200px] resize-none rounded-2xl border border-border/50 bg-background px-5 py-3.5 text-[15px] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          rows={1}
        />
        {streamState.isStreaming ? (
          <Button
            size="icon"
            variant="destructive"
            onClick={stopStreaming}
            className="flex-shrink-0 h-[52px] w-[52px] rounded-2xl shadow-sm"
          >
            <Square className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="flex-shrink-0 h-[52px] w-[52px] rounded-2xl shadow-sm"
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
      </div>
      <p className="text-[13px] text-foreground/50 text-center mt-3">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  )
}

