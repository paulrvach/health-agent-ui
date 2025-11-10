import type { Message, TodoItem, ChatThread } from '@/app/types/types'

export interface ThreadSummary {
  id: string
  title: string
  messageCount: number
  updatedAt: number
}

export interface ThreadData {
  id: string
  messages: Message[]
  todos: TodoItem[]
  files: Record<string, string>
  createdAt: number
  updatedAt: number
  title?: string
}

const THREAD_PREFIX = 'thread_'
const THREAD_LIST_KEY = 'thread_list'
const CURRENT_THREAD_KEY = 'chat-thread-id'

export function getThreadList(): ThreadSummary[] {
  try {
    if (typeof window === 'undefined') return []
    const list = localStorage.getItem(THREAD_LIST_KEY)
    return list ? JSON.parse(list) : []
  } catch (error) {
    console.error('[Thread Storage] Error reading thread list:', error)
    return []
  }
}

export function getThread(threadId: string): ThreadData | null {
  try {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(`${THREAD_PREFIX}${threadId}`)
    if (!data) return null
    return JSON.parse(data) as ThreadData
  } catch (error) {
    console.error('[Thread Storage] Error reading thread:', threadId, error)
    return null
  }
}

export function saveThread(threadData: ThreadData): void {
  try {
    if (typeof window === 'undefined') return
    
    // Save thread data
    localStorage.setItem(`${THREAD_PREFIX}${threadData.id}`, JSON.stringify(threadData))
    
    // Update thread list
    const list = getThreadList()
    const threadIndex = list.findIndex(t => t.id === threadData.id)
    
    // Generate title from first user message
    const firstUserMessage = threadData.messages.find(m => m.type === 'human')
    const title = firstUserMessage?.content.substring(0, 50) || 'New conversation'
    
    const summary: ThreadSummary = {
      id: threadData.id,
      title,
      messageCount: threadData.messages.length,
      updatedAt: threadData.updatedAt,
    }
    
    if (threadIndex >= 0) {
      list[threadIndex] = summary
    } else {
      list.unshift(summary)
    }
    
    // Keep only last 50 threads
    const trimmedList = list.slice(0, 50)
    localStorage.setItem(THREAD_LIST_KEY, JSON.stringify(trimmedList))
    
    // Clean up threads that are no longer in the list
    const savedThreadIds = new Set(trimmedList.map(t => t.id))
    list.forEach(thread => {
      if (!savedThreadIds.has(thread.id)) {
        localStorage.removeItem(`${THREAD_PREFIX}${thread.id}`)
      }
    })
    
    console.log('[Thread Storage] Saved thread:', threadData.id, {
      messageCount: threadData.messages.length,
      title
    })
  } catch (error) {
    console.error('[Thread Storage] Error saving thread:', error)
  }
}

export function deleteThread(threadId: string): void {
  try {
    if (typeof window === 'undefined') return
    
    // Remove thread data
    localStorage.removeItem(`${THREAD_PREFIX}${threadId}`)
    
    // Remove from thread list
    const list = getThreadList()
    const updated = list.filter(t => t.id !== threadId)
    localStorage.setItem(THREAD_LIST_KEY, JSON.stringify(updated))
    
    console.log('[Thread Storage] Deleted thread:', threadId)
  } catch (error) {
    console.error('[Thread Storage] Error deleting thread:', error)
  }
}

export function clearAllThreads(): void {
  try {
    if (typeof window === 'undefined') return
    
    const list = getThreadList()
    list.forEach(thread => {
      localStorage.removeItem(`${THREAD_PREFIX}${thread.id}`)
    })
    localStorage.removeItem(THREAD_LIST_KEY)
    localStorage.removeItem(CURRENT_THREAD_KEY)
    
    console.log('[Thread Storage] Cleared all threads')
  } catch (error) {
    console.error('[Thread Storage] Error clearing threads:', error)
  }
}

export function getCurrentThreadId(): string | null {
  try {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(CURRENT_THREAD_KEY)
  } catch (error) {
    console.error('[Thread Storage] Error getting current thread ID:', error)
    return null
  }
}

export function setCurrentThreadId(threadId: string): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(CURRENT_THREAD_KEY, threadId)
  } catch (error) {
    console.error('[Thread Storage] Error setting current thread ID:', error)
  }
}

