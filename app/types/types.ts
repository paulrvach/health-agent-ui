export interface Message {
  type: "human" | "ai" | "system" | "tool"
  content: string
  id?: string
  tool_call_id?: string
  name?: string
  additional_kwargs?: Record<string, unknown>
  timestamp?: number
}

export interface TodoItem {
  id: string
  content: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  createdAt?: number
  updatedAt?: number
  dependencies?: string[]
  assignee?: string
  priority?: "low" | "medium" | "high"
}

export interface FileItem {
  path: string
  content: string
  type: "code" | "markdown" | "text" | "json" | "other"
  language?: string
  size?: number
  lastModified?: number
}

export interface SubAgentStep {
  id: string
  description: string
  status: "pending" | "running" | "completed" | "failed"
  timestamp: number
  output?: string
}

export interface SubAgent {
  id: string
  name: string
  status: "idle" | "thinking" | "acting" | "completed" | "failed"
  steps: SubAgentStep[]
  progress?: number
  startTime?: number
  endTime?: number
}

export interface ChatThread {
  id: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  title?: string
  todos?: TodoItem[]
  files?: Record<string, string>
}

export interface StreamState {
  isStreaming: boolean
  currentMessage: string
  error: string | null
}

