import type { Message, TodoItem } from "@/app/types/types"

type StreamCallbacks = {
  onMessages?: (messages: Message[]) => void
  onTodos?: (todos: TodoItem[]) => void
  onFiles?: (files: Record<string, string>) => void
  onMetadata?: (metadata: Record<string, unknown>) => void
  onError?: (error: Error) => void
  onEnd?: () => void
}

type StreamOptions = {
  threadId: string
  inputMessages: Message[]
  signal?: AbortSignal
  callbacks?: StreamCallbacks
}

type InvokeOptions = {
  threadId: string
  inputMessages: Message[]
}

type SSEEvent = {
  event: string
  data: string
}

const TEXT_DECODER = new TextDecoder()

function toLangChainMessages(messages: Message[]) {
  return messages.map((message) => {
    // Build message according to LangChain schema
    const baseMessage: Record<string, unknown> = {
      content: message.content, // Required field
      type: message.type, // Required: "human", "ai", "system", "tool"
      additional_kwargs: message.additional_kwargs || {},
      response_metadata: {},
      name: message.name || null,
      id: message.id || null,
    }
    
    // Add tool-specific fields if it's a tool message
    if (message.type === 'tool' && message.tool_call_id) {
      baseMessage.tool_call_id = message.tool_call_id
      baseMessage.status = 'success'
    }
    
    console.log('[toLangChainMessages] Converted message:', baseMessage)
    return baseMessage
  })
}

async function parseStream(
  response: Response,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
) {
  if (!response.body) {
    throw new Error("Streamed response missing body")
  }

  const reader = response.body.getReader()
  let buffer = ""
  let eventCount = 0

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel()
        break
      }

      const { value, done } = await reader.read()
      
      if (done) {
        console.log(`Stream complete. Processed ${eventCount} events. Buffer remaining: ${buffer.length} chars`)
        break
      }
      
      const chunk = TEXT_DECODER.decode(value, { stream: true })
      buffer += chunk

      // Process complete events (delimited by \r\n\r\n or \n\n)
      const delimiter = buffer.includes("\r\n\r\n") ? "\r\n\r\n" : "\n\n"
      const delimiterLength = delimiter.length
      
      let doubleNewlineIndex: number
      while ((doubleNewlineIndex = buffer.indexOf(delimiter)) !== -1) {
        const eventText = buffer.substring(0, doubleNewlineIndex)
        buffer = buffer.substring(doubleNewlineIndex + delimiterLength)
        
        if (eventText.trim().length === 0) continue
        
        const parsed = parseSSEEvent(eventText)
        if (parsed) {
          eventCount++
          handleSSEEvent(parsed, callbacks)
        }
      }
    }

    // Process any remaining complete events in buffer
    if (buffer.trim().length > 0) {
      const delimiter = buffer.includes("\r\n\r\n") ? "\r\n\r\n" : "\n\n"
      const remainingEvents = buffer.split(delimiter).filter(s => s.trim().length > 0)
      
      for (const eventText of remainingEvents) {
        const parsed = parseSSEEvent(eventText)
        if (parsed) {
          eventCount++
          handleSSEEvent(parsed, callbacks)
        }
      }
    }
  } catch (error) {
    if (signal?.aborted) {
      return
    }
    throw error
  }

  callbacks.onEnd?.()
}

function parseSSEEvent(chunk: string): SSEEvent | null {
  // Handle both \r\n and \n line endings
  const lines = chunk.split(/\r?\n/)
  let event = "message"
  const dataLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("event:")) {
      event = trimmed.slice(6).trim()
    } else if (trimmed.startsWith("data:")) {
      dataLines.push(trimmed.slice(5).trim())
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  return {
    event,
    data: dataLines.join("\n"),
  }
}

function handleSSEEvent(event: SSEEvent, callbacks: StreamCallbacks) {
  console.log('[SSE Event]', event.event, event.data.substring(0, 200))
  
  if (event.event === "end") {
    console.log('[SSE] Stream ended')
    callbacks.onEnd?.()
    return
  }

  if (event.event === "metadata") {
    try {
      const metadata = JSON.parse(event.data)
      console.log('[SSE Metadata]', metadata)
      callbacks.onMetadata?.(metadata)
    } catch (error) {
      console.error('[SSE Metadata Parse Error]', error)
      callbacks.onError?.(
        error instanceof Error ? error : new Error("Failed to parse metadata"),
      )
    }
    return
  }

  if (event.event === "error") {
    console.error('[SSE Error]', event.data)
    callbacks.onError?.(new Error(event.data))
    return
  }

  if (event.event !== "data") {
    console.log('[SSE Unknown Event]', event.event)
    return
  }

  try {
    const payload = JSON.parse(event.data)
    console.log('[SSE Data Payload]', payload)
    dispatchPayload(payload, callbacks)
  } catch (error) {
    console.error('[SSE Data Parse Error]', error, event.data)
    callbacks.onError?.(
      error instanceof Error ? error : new Error("Failed to parse stream data"),
    )
  }
}

type PayloadValue = {
  messages?: unknown
  todos?: unknown
  files?: unknown
  [key: string]: unknown
}

function dispatchPayload(payload: Record<string, unknown>, callbacks: StreamCallbacks) {
  console.log('[Dispatch Payload] Full payload:', JSON.stringify(payload, null, 2))
  console.log('[Dispatch Payload] Keys:', Object.keys(payload))
  
  for (const [key, value] of Object.entries(payload)) {
    console.log(`[Dispatch] Processing key: ${key}`, value)
    
    if (!value || typeof value !== "object") {
      console.log(`[Dispatch] Skipping ${key} - not an object`)
      continue
    }

    const payloadValue = value as PayloadValue

    // Check if this key itself contains the data structures
    if (key === 'todos' || 'todos' in payloadValue) {
      const todosData = key === 'todos' ? value : payloadValue.todos
      console.log('[Dispatch] Found todos:', todosData)
      const todos = extractTodos(todosData)
      if (todos) {
        console.log('[Dispatch] Calling onTodos with:', todos.length, 'todos')
        callbacks.onTodos?.(todos)
      } else {
        console.log('[Dispatch] Todos extracted as null')
      }
    }

    if (key === 'files' || 'files' in payloadValue) {
      const filesData = key === 'files' ? value : payloadValue.files
      console.log('[Dispatch] Found files:', filesData)
      const files = extractFiles(filesData)
      if (files) {
        console.log('[Dispatch] Calling onFiles with:', Object.keys(files).length, 'files')
        callbacks.onFiles?.(files)
      }
    }

    if ("messages" in payloadValue) {
      console.log('[Dispatch] Found messages:', payloadValue.messages)
      const messages = extractMessages(payloadValue.messages)
      if (messages.length > 0) {
        console.log('[Dispatch] Calling onMessages with:', messages.length, 'messages')
        callbacks.onMessages?.(messages)
        
        // Extract sub-agents from tool_calls in messages
        messages.forEach(message => {
          // Check for new task tool calls (sub-agent starting)
          // LangChain puts tool_calls in the message root, not in additional_kwargs
          if (message.type === 'ai') {
            const toolCalls = (message as Message & { tool_calls?: Array<Record<string, unknown>> }).tool_calls
            
            console.log('[Dispatch] Checking message for tool_calls:', {
              hasToolCalls: !!toolCalls,
              toolCallsLength: toolCalls?.length,
              messageType: message.type,
            })
            
            if (toolCalls && Array.isArray(toolCalls)) {
              console.log('[Dispatch] Found tool_calls array:', toolCalls)
              
              toolCalls.forEach(toolCall => {
                console.log('[Dispatch] Processing tool call:', toolCall.name, toolCall.args)
                
                // Capture ALL task tool calls (not just specific agent types)
                if (toolCall.name === 'task' && toolCall.args && typeof toolCall.args === 'object') {
                  console.log('[Dispatch] Found sub-agent task:', toolCall)
                  const args = toolCall.args as Record<string, unknown>
                  const subAgentInfo = {
                    id: toolCall.id,
                    name: (typeof args.subagent_type === 'string' ? args.subagent_type : null) ||
                          (typeof args.agent_type === 'string' ? args.agent_type : null) ||
                          'agent',
                    description: (typeof args.description === 'string' ? args.description : null) ||
                                 (typeof args.task === 'string' ? args.task : null) ||
                                 'Processing...',
                    status: 'thinking' as const,
                  }
                  console.log('[Dispatch] Sending subAgent metadata:', subAgentInfo)
                  callbacks.onMetadata?.({ subAgent: subAgentInfo, type: 'start' })
                }
              })
            }
          }
          
          // Check for tool response messages (sub-agent completing)
          if (message.type === 'tool' && message.name === 'task' && message.tool_call_id) {
            console.log('[Dispatch] Sub-agent task completed:', message.tool_call_id)
            callbacks.onMetadata?.({ 
              subAgent: {
                id: message.tool_call_id,
                status: 'completed',
                result: message.content,
              },
              type: 'complete'
            })
          }
        })
      }
    }
  }
}

type MessageWrapper = {
  value?: Message[]
}

type TodoWrapper = {
  value?: TodoItem[]
  items?: TodoItem[]
}

type FileData = {
  content?: string | string[]
}

function extractMessages(raw: unknown): Message[] {
  console.log('[Extract Messages] Raw input type:', typeof raw, Array.isArray(raw))
  
  if (Array.isArray(raw)) {
    console.log('[Extract Messages] Is array, length:', raw.length)
    console.log('[Extract Messages] Array contents:', raw.map(m => ({ type: m.type, contentLength: m.content?.length })))
    return raw
  }
  if (raw && typeof raw === "object" && "value" in raw) {
    const wrapper = raw as MessageWrapper
    console.log('[Extract Messages] Is wrapper, has value:', Array.isArray(wrapper.value))
    if (Array.isArray(wrapper.value)) {
      console.log('[Extract Messages] Wrapper value length:', wrapper.value.length)
      return wrapper.value
    }
  }
  console.log('[Extract Messages] Returning empty array')
  return []
}

function extractTodos(raw: unknown): TodoItem[] | null {
  console.log('[Extract Todos] Raw input:', raw)
  
  if (!raw) {
    console.log('[Extract Todos] Raw is null/undefined')
    return null
  }

  if (Array.isArray(raw)) {
    console.log('[Extract Todos] Raw is array, returning:', raw.length, 'items')
    return raw
  }

  if (raw && typeof raw === "object") {
    const wrapper = raw as TodoWrapper
    console.log('[Extract Todos] Raw is object with keys:', Object.keys(wrapper))
    
    if (Array.isArray(wrapper.value)) {
      console.log('[Extract Todos] Found wrapper.value array:', wrapper.value.length, 'items')
      return wrapper.value
    }
    if (Array.isArray(wrapper.items)) {
      console.log('[Extract Todos] Found wrapper.items array:', wrapper.items.length, 'items')
      return wrapper.items
    }
  }

  console.log('[Extract Todos] No valid todos found, returning null')
  return null
}

function extractFiles(raw: unknown): Record<string, string> | null {
  if (!raw || typeof raw !== "object") return null

  const files: Record<string, string> = {}
  for (const [path, data] of Object.entries(raw)) {
    if (!data || typeof data !== "object") continue

    const fileData = data as FileData
    const content = Array.isArray(fileData.content)
      ? fileData.content.join("\n")
      : typeof fileData.content === "string"
        ? fileData.content
        : ""

    files[path] = content
  }

  return files
}

export async function streamAgent({
  threadId,
  inputMessages,
  signal,
  callbacks = {},
}: StreamOptions) {
  // Use local API proxy to avoid CORS issues
  const url = `/api/coach/stream`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          messages: toLangChainMessages(inputMessages),
        },
        configurable: {
          thread_id: threadId,
        },
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Stream request failed with status ${response.status}`)
    }

    await parseStream(response, callbacks, signal)
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return
    }
    callbacks.onError?.(
      error instanceof Error ? error : new Error("Streaming request failed"),
    )
  }
}

export async function invokeAgent({ threadId, inputMessages }: InvokeOptions) {
  // Use local API proxy to avoid CORS issues
  const url = `/api/coach/invoke`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: {
        messages: toLangChainMessages(inputMessages),
      },
      configurable: {
        thread_id: threadId,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Invoke request failed with status ${response.status}`)
  }

  return response.json()
}

