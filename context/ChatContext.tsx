"use client"

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useQueryState } from 'nuqs'
import { streamAgent } from '@/lib/agent-stream'
import type { Message, ChatThread, StreamState, TodoItem, FileItem, SubAgent } from '@/app/types/types'
import { toast } from 'sonner'

interface ChatContextType {
  messages: Message[]
  streamState: StreamState
  currentThread: ChatThread | null
  todos: TodoItem[]
  files: Record<string, string>
  subAgents: SubAgent[]
  selectedFile: FileItem | null
  selectedSubAgent: SubAgent | null
  sidebarCollapsed: boolean
  isLoadingThreadState: boolean
  sendMessage: (content: string) => Promise<void>
  stopStreaming: () => void
  clearChat: () => void
  setSelectedFile: (file: FileItem | null) => void
  setSelectedSubAgent: (agent: SubAgent | null) => void
  toggleSidebar: () => void
  threadId: string | null
  setThreadId: (id: string | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [urlThreadId, setUrlThreadId] = useQueryState('threadId')
  const [messages, setMessages] = useState<Message[]>([])
  const [streamState, setStreamState] = useState<StreamState>({
    isStreaming: false,
    currentMessage: '',
    error: null,
  })
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [streamingInterval, setStreamingInterval] = useState<NodeJS.Timeout | null>(null)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [files, setFiles] = useState<Record<string, string>>({})
  const [subAgents, setSubAgents] = useState<SubAgent[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [selectedSubAgent, setSelectedSubAgent] = useState<SubAgent | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoadingThreadState, setIsLoadingThreadState] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  // Initialize thread - use URL param or localStorage
  useEffect(() => {
    const storedThreadId = localStorage.getItem('chat-thread-id')
    const threadId = urlThreadId || storedThreadId || generateThreadId()
    
    if (!urlThreadId && threadId) {
      setUrlThreadId(threadId)
    }
    
    localStorage.setItem('chat-thread-id', threadId)
    
    setCurrentThread({
      id: threadId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }, [])

  const generateThreadId = () => {
    return `thread_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  // Save thread state to localStorage whenever it changes
  useEffect(() => {
    if (!currentThread?.id) return

    const threadData = {
      id: currentThread.id,
      messages,
      todos,
      files,
      createdAt: currentThread.createdAt,
      updatedAt: Date.now(),
    }

    console.log('[LocalStorage] Saving thread state:', currentThread.id, {
      messageCount: messages.length,
      todoCount: todos.length,
      fileCount: Object.keys(files).length,
    })

    localStorage.setItem(`thread_${currentThread.id}`, JSON.stringify(threadData))

    // Also save to thread list for history
    const existingThreads = JSON.parse(localStorage.getItem('thread_list') || '[]')
    const threadIndex = existingThreads.findIndex((t: any) => t.id === currentThread.id)
    
    const threadSummary = {
      id: currentThread.id,
      title: messages[0]?.content.substring(0, 50) || 'New conversation',
      messageCount: messages.length,
      updatedAt: Date.now(),
    }

    if (threadIndex >= 0) {
      existingThreads[threadIndex] = threadSummary
    } else {
      existingThreads.unshift(threadSummary)
    }

    // Keep only last 50 threads
    localStorage.setItem('thread_list', JSON.stringify(existingThreads.slice(0, 50)))
  }, [currentThread?.id, messages, todos, files])

  // Load thread state from localStorage when thread changes
  useEffect(() => {
    if (!urlThreadId) {
      setIsLoadingThreadState(false)
      return
    }

    console.log('[LocalStorage] Loading thread state:', urlThreadId)
    setIsLoadingThreadState(true)

    try {
      const savedData = localStorage.getItem(`thread_${urlThreadId}`)
      
      if (savedData) {
        const threadData = JSON.parse(savedData)
        console.log('[LocalStorage] Restored thread state:', {
          messageCount: threadData.messages?.length,
          todoCount: threadData.todos?.length,
          fileCount: Object.keys(threadData.files || {}).length,
        })

        setMessages(threadData.messages || [])
        setTodos(threadData.todos || [])
        setFiles(threadData.files || {})
        
        setCurrentThread({
          id: threadData.id,
          messages: threadData.messages || [],
          createdAt: threadData.createdAt,
          updatedAt: threadData.updatedAt,
        })
      } else {
        console.log('[LocalStorage] No saved state found for thread:', urlThreadId)
      }
    } catch (error) {
      console.error('[LocalStorage] Error loading thread state:', error)
    } finally {
      setIsLoadingThreadState(false)
    }
  }, [urlThreadId])

  const sendMessage = useCallback(async (content: string) => {
    if (!currentThread || streamState.isStreaming) return

    const userMessage: Message = {
      type: 'human',
      content,
      id: `msg_${Date.now()}`,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setStreamState({
      isStreaming: true,
      currentMessage: '',
      error: null,
    })

    const controller = new AbortController()
    setAbortController(controller)

    try {
      await streamAgent({
        threadId: currentThread.id,
        inputMessages: [...messages, userMessage],
        signal: controller.signal,
        callbacks: {
          onMessages: (newMessages) => {
            console.log('[ChatContext] onMessages called with:', newMessages)
            
            // Get all messages (even without content) to track progress
            newMessages.forEach(msg => {
              console.log(`[ChatContext] Message: type=${msg.type}, name=${msg.name}, hasContent=${!!msg.content}, contentLength=${msg.content?.length || 0}`)
            })
            
            // Look for the final AI message or tool message with content
            const allMessages = [...newMessages]
            
            // First try to find AI messages with actual text content
            let displayMessage = allMessages.reverse().find(m => 
              m.type === 'ai' && m.content && m.content.trim().length > 0
            )
            
            // If no AI message with content, look for completed tool messages from sub-agents
            if (!displayMessage) {
              displayMessage = allMessages.find(m => 
                m.type === 'tool' && m.name === 'task' && m.content && m.content.trim().length > 0
              )
            }
            
            if (displayMessage) {
              const fullContent = displayMessage.content
              console.log('[ChatContext] Got new content, starting character streaming:', fullContent.length, 'chars')
              
              // Clear any existing streaming interval
              if (streamingInterval) {
                clearInterval(streamingInterval)
                setStreamingInterval(null)
              }
              
              // Start character-by-character streaming
              setStreamState(prev => {
                // If this is new content, start streaming it
                if (prev.currentMessage !== fullContent) {
                  return {
                    ...prev,
                    currentMessage: '',
                  }
                }
                return prev
              })
              
              // Animate the content character by character
              let charIndex = 0
              const intervalId = setInterval(() => {
                charIndex += 5 // Stream 5 characters at a time for smooth speed
                
                if (charIndex >= fullContent.length) {
                  clearInterval(intervalId)
                  setStreamingInterval(null)
                  setStreamState(prev => ({
                    ...prev,
                    currentMessage: fullContent,
                  }))
                } else {
                  setStreamState(prev => ({
                    ...prev,
                    currentMessage: fullContent.substring(0, charIndex),
                  }))
                }
              }, 8) // 8ms between updates for smooth animation
              
              setStreamingInterval(intervalId)
            }
          },
          onTodos: (newTodos) => {
            console.log('[ChatContext] onTodos called with:', newTodos)
            setTodos(newTodos)
          },
          onFiles: (newFiles) => {
            console.log('[ChatContext] onFiles called with:', Object.keys(newFiles))
            setFiles(newFiles)
          },
          onMetadata: (metadata) => {
            console.log('[ChatContext] onMetadata called:', metadata)
            
            // Handle sub-agent metadata from tool_calls
            if (metadata.subAgent) {
              const agentInfo = metadata.subAgent as any
              const metadataType = metadata.type as string | undefined
              console.log('[ChatContext] Processing sub-agent:', agentInfo, 'type:', metadataType)
              
              if (metadataType === 'start') {
                // New sub-agent starting
                const subAgent: SubAgent = {
                  id: agentInfo.id || `agent_${Date.now()}`,
                  name: agentInfo.name || 'Unknown Agent',
                  status: 'thinking',
                  steps: [
                    {
                      id: `step_${Date.now()}`,
                      description: agentInfo.description || 'Processing task...',
                      status: 'running',
                      timestamp: Date.now(),
                    }
                  ],
                  progress: 0,
                  startTime: Date.now(),
                }
                
                console.log('[ChatContext] Adding new sub-agent:', subAgent)
                setSubAgents(prev => [...prev, subAgent])
                setSelectedSubAgent(subAgent)
                
                // Create a todo item for this sub-agent task
                const todo: TodoItem = {
                  id: agentInfo.id,
                  content: agentInfo.description,
                  status: 'in_progress',
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                }
                
                console.log('[ChatContext] Creating todo from sub-agent:', todo)
                setTodos(prev => {
                  // Check if todo already exists
                  if (prev.find(t => t.id === todo.id)) {
                    console.log('[ChatContext] Todo already exists, skipping:', todo.id)
                    return prev
                  }
                  return [...prev, todo]
                })
                
                // Add a system message to the chat to notify user
                const systemMessage: Message = {
                  type: 'system',
                  content: `🤖 **${agentInfo.name}** is working on: ${agentInfo.description}`,
                  id: `system_${Date.now()}`,
                  timestamp: Date.now(),
                }
                setMessages(prev => [...prev, systemMessage])
                
              } else if (metadataType === 'complete') {
                // Sub-agent completing
                console.log('[ChatContext] Marking sub-agent as completed:', agentInfo.id)
                
                const completedAgent = subAgents.find(a => a.id === agentInfo.id)
                
                setSubAgents(prev => prev.map(agent => {
                  if (agent.id === agentInfo.id) {
                    return {
                      ...agent,
                      status: 'completed',
                      progress: 100,
                      endTime: Date.now(),
                      steps: agent.steps.map(step => ({
                        ...step,
                        status: 'completed' as const,
                        output: agentInfo.result,
                      }))
                    }
                  }
                  return agent
                }))
                
                // Mark the corresponding todo as completed
                setTodos(prev => {
                  console.log('[ChatContext] Updating todo status to completed:', agentInfo.id)
                  return prev.map(todo => {
                    if (todo.id === agentInfo.id) {
                      console.log('[ChatContext] Found matching todo, marking completed')
                      return {
                        ...todo,
                        status: 'completed',
                        updatedAt: Date.now(),
                      }
                    }
                    return todo
                  })
                })
                
                // Add completion notification to chat
                if (completedAgent) {
                  const completionMessage: Message = {
                    type: 'system',
                    content: `✅ **${completedAgent.name}** completed task`,
                    id: `system_complete_${Date.now()}`,
                    timestamp: Date.now(),
                  }
                  setMessages(prev => [...prev, completionMessage])
                }
              }
            }
          },
          onError: (error) => {
            console.error('Stream error:', error)
            setStreamState(prev => ({
              ...prev,
              error: error.message,
            }))
            toast.error('Failed to get response', {
              description: error.message,
            })
          },
          onEnd: () => {
            console.log('[ChatContext] Stream ended, saving message')
            
            // Clear any streaming interval
            if (streamingInterval) {
              clearInterval(streamingInterval)
              setStreamingInterval(null)
            }
            
            setStreamState(prev => {
              if (prev.currentMessage) {
                const aiMessage: Message = {
                  type: 'ai',
                  content: prev.currentMessage,
                  id: `msg_${Date.now()}`,
                  timestamp: Date.now(),
                }
                setMessages(prevMessages => [...prevMessages, aiMessage])
              }
              
              return {
                isStreaming: false,
                currentMessage: '',
                error: null,
              }
            })
            setAbortController(null)
            
            console.log('[ChatContext] Stream complete - state is up to date from callbacks')
          },
        },
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      setStreamState({
        isStreaming: false,
        currentMessage: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [currentThread, messages, streamState.isStreaming])

  const stopStreaming = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    
    if (streamingInterval) {
      clearInterval(streamingInterval)
      setStreamingInterval(null)
    }
    
    setStreamState({
      isStreaming: false,
      currentMessage: '',
      error: null,
    })
  }, [abortController, streamingInterval])

  const clearChat = useCallback(() => {
    console.log('[ChatContext] Clearing chat and creating new thread')
    
    // Clean up any active streaming
    if (streamingInterval) {
      clearInterval(streamingInterval)
      setStreamingInterval(null)
    }
    
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    
    setMessages([])
    setTodos([])
    setFiles({})
    setSubAgents([])
    setSelectedSubAgent(null)
    
    const newThreadId = generateThreadId()
    localStorage.setItem('chat-thread-id', newThreadId)
    setUrlThreadId(newThreadId)
    
    const newThread = {
      id: newThreadId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    
    setCurrentThread(newThread)
    
    // Save empty thread to localStorage
    localStorage.setItem(`thread_${newThreadId}`, JSON.stringify(newThread))
    
    setStreamState({
      isStreaming: false,
      currentMessage: '',
      error: null,
    })
  }, [setUrlThreadId, streamingInterval, abortController])

  return (
    <ChatContext.Provider
      value={{
        messages,
        streamState,
        currentThread,
        todos,
        files,
        subAgents,
        selectedFile,
        selectedSubAgent,
        sidebarCollapsed,
        isLoadingThreadState,
        sendMessage,
        stopStreaming,
        clearChat,
        setSelectedFile,
        setSelectedSubAgent,
        toggleSidebar,
        threadId: urlThreadId,
        setThreadId: setUrlThreadId,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

