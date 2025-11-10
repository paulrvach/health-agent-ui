"use client"

import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Square } from 'lucide-react'
import { useChat } from '@/context/ChatContext'

export function ChatInput() {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, stopStreaming, streamState } = useChat()

  // Load workout data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !streamState.isStreaming && !input) {
      try {
        const storedData = localStorage.getItem('pending-workout-query')
        if (storedData) {
          const workoutData = JSON.parse(storedData)
          
          // Build the complete message
          let finalMessage = workoutData.message || ''
          
          // Append summarized workout data instead of full rawData to avoid token limits
          if (workoutData.workout?.rawData && typeof workoutData.workout.rawData === 'object') {
            const rawData = workoutData.workout.rawData as Record<string, unknown>
            
            // Extract only key metrics to keep message size reasonable
            const summary: Record<string, unknown> = {}
            
            // Basic workout info
            if ('workout_name' in rawData) summary.workout_name = rawData.workout_name
            if ('workout_type' in rawData) summary.workout_type = rawData.workout_type
            if ('workout_tags' in rawData) summary.workout_tags = rawData.workout_tags
            if ('duration' in rawData) summary.duration = rawData.duration
            if ('start_at_timestamp' in rawData) summary.start_at_timestamp = rawData.start_at_timestamp
            
            // Key metrics from the main metrics object
            if ('metrics' in rawData && typeof rawData.metrics === 'object' && rawData.metrics !== null) {
              const metrics = rawData.metrics as Record<string, unknown>
              const keyMetrics: Record<string, unknown> = {}
              
              // Only include essential metrics
              const essentialMetrics = [
                'distance', 'distance_swimming', 'distance_running', 'distance_cycling',
                'calories_burned', 'heartrate', 'heartrate_max', 'heartrate_resting',
                'duration_active', 'swimming_lengths', 'steps', 'pace', 'speed'
              ]
              
              essentialMetrics.forEach(key => {
                if (key in metrics) {
                  keyMetrics[key] = metrics[key]
                }
              })
              
              if (Object.keys(keyMetrics).length > 0) {
                summary.key_metrics = keyMetrics
              }
            }
            
            // Lap count if available
            if ('laps' in rawData && Array.isArray(rawData.laps)) {
              summary.lap_count = rawData.laps.length
            }
            
            // Only add summary if we have meaningful data
            if (Object.keys(summary).length > 0) {
              finalMessage += `\n\nWorkout details:\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\``
            }
          }
          
          // Use setTimeout to avoid synchronous setState in effect
          setTimeout(() => {
            setInput(finalMessage)
            // Auto-focus the textarea
            textareaRef.current?.focus()
          }, 0)
          
          // Clean up localStorage after reading
          localStorage.removeItem('pending-workout-query')
        }
      } catch (e) {
        console.error('Failed to load workout data from localStorage:', e)
        // Clean up corrupted data
        localStorage.removeItem('pending-workout-query')
      }
    }
  }, [streamState.isStreaming, input])

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

