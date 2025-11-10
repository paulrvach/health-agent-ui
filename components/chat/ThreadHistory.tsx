"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, MessageSquare, Trash2, Calendar } from 'lucide-react'
import { getThreadList, deleteThread, type ThreadSummary } from '@/lib/thread-storage'
import { useChat } from '@/context/ChatContext'
import { cn } from '@/lib/utils'

export function ThreadHistory() {
  const [open, setOpen] = useState(false)
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const { threadId, setThreadId } = useChat()

  useEffect(() => {
    if (open) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setThreads(getThreadList())
      }, 0)
    }
  }, [open])

  const handleSelectThread = (id: string) => {
    if (id !== threadId) {
      setThreadId(id)
      setOpen(false)
    }
  }

  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteThread(id)
    setThreads(getThreadList())
    
    // If deleted thread was current thread, clear it
    if (id === threadId) {
      setThreadId(null)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-accent/50 h-9 px-4">
          <History className="h-4 w-4" />
          <span className="text-[15px]">History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[17px]">Conversation History</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-foreground/40" />
              </div>
              <p className="text-[15px] text-foreground/60">
                No conversation history yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={cn(
                    "rounded-xl p-4 cursor-pointer transition-all hover:bg-accent/40 group",
                    thread.id === threadId ? "bg-accent/50" : "bg-card"
                  )}
                  onClick={() => handleSelectThread(thread.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-medium truncate mb-1">
                        {thread.title || 'Untitled conversation'}
                      </h3>
                      <div className="flex items-center gap-3 text-[13px] text-foreground/60">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{thread.messageCount} messages</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(thread.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => handleDeleteThread(thread.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

