export interface ThreadSummary {
  id: string
  title: string
  messageCount: number
  updatedAt: number
}

export function getThreadList(): ThreadSummary[] {
  try {
    const list = localStorage.getItem('thread_list')
    return list ? JSON.parse(list) : []
  } catch (error) {
    console.error('Error reading thread list:', error)
    return []
  }
}

export function deleteThread(threadId: string): void {
  try {
    // Remove thread data
    localStorage.removeItem(`thread_${threadId}`)
    
    // Remove from thread list
    const list = getThreadList()
    const updated = list.filter(t => t.id !== threadId)
    localStorage.setItem('thread_list', JSON.stringify(updated))
    
    console.log('[Thread Storage] Deleted thread:', threadId)
  } catch (error) {
    console.error('Error deleting thread:', error)
  }
}

export function clearAllThreads(): void {
  try {
    const list = getThreadList()
    list.forEach(thread => {
      localStorage.removeItem(`thread_${thread.id}`)
    })
    localStorage.removeItem('thread_list')
    localStorage.removeItem('chat-thread-id')
    
    console.log('[Thread Storage] Cleared all threads')
  } catch (error) {
    console.error('Error clearing threads:', error)
  }
}

