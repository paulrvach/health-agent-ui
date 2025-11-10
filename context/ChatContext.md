# ChatContext Documentation

## Overview

`ChatContext` is a React context provider that manages the complete state and functionality for a chat interface with AI agent streaming capabilities. It handles message management, thread persistence, real-time streaming, sub-agent coordination, todos, files, and UI state.

## Features

- **Message Management**: Handles human, AI, system, and tool messages
- **Real-time Streaming**: Character-by-character streaming animation for AI responses
- **Thread Persistence**: Automatic saving and loading of chat threads from localStorage
- **URL Synchronization**: Thread IDs are synchronized with URL query parameters
- **Sub-Agent Coordination**: Tracks and manages multiple sub-agents working on tasks
- **Todo Management**: Automatically creates and updates todos from sub-agent tasks
- **File Management**: Tracks files generated or referenced during conversations
- **Stream Control**: Ability to stop ongoing streams
- **Debounced Saving**: Prevents excessive localStorage writes during rapid state changes

## API Reference

### ChatProvider

The main context provider component that wraps your application.

```tsx
<ChatProvider>
  {children}
</ChatProvider>
```

### useChat Hook

Hook to access the chat context. Must be used within a `ChatProvider`.

```tsx
const {
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
  threadId,
  setThreadId,
} = useChat()
```

## Context Properties

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `messages` | `Message[]` | Array of all messages in the current thread |
| `streamState` | `StreamState` | Current streaming state (isStreaming, currentMessage, error) |
| `currentThread` | `ChatThread \| null` | The currently active chat thread |
| `todos` | `TodoItem[]` | List of todo items created from sub-agent tasks |
| `files` | `Record<string, string>` | Map of file paths to file contents |
| `subAgents` | `SubAgent[]` | Array of active sub-agents |
| `selectedFile` | `FileItem \| null` | Currently selected file for viewing |
| `selectedSubAgent` | `SubAgent \| null` | Currently selected sub-agent |
| `sidebarCollapsed` | `boolean` | Whether the sidebar is collapsed |
| `isLoadingThreadState` | `boolean` | Whether thread state is being loaded from storage |
| `threadId` | `string \| null` | Current thread ID (synced with URL) |

### Methods

#### `sendMessage(content: string): Promise<void>`

Sends a message to the AI agent and initiates streaming.

- **Parameters:**
  - `content`: The message text to send
- **Behavior:**
  - Adds user message to messages array
  - Saves thread state immediately
  - Initiates streaming via `streamAgent`
  - Handles character-by-character streaming animation
  - Updates todos, files, and sub-agents from stream callbacks
  - Saves final message when streaming completes

**Example:**
```tsx
await sendMessage("Analyze my workout data")
```

#### `stopStreaming(): void`

Stops an ongoing stream.

- **Behavior:**
  - Aborts the fetch request
  - Clears streaming interval
  - Resets stream state

**Example:**
```tsx
<button onClick={stopStreaming}>Stop</button>
```

#### `clearChat(): void`

Clears the current chat and creates a new thread.

- **Behavior:**
  - Clears all messages, todos, files, and sub-agents
  - Generates a new thread ID
  - Updates URL with new thread ID
  - Saves empty thread to localStorage

**Example:**
```tsx
<button onClick={clearChat}>New Chat</button>
```

#### `setSelectedFile(file: FileItem | null): void`

Sets the currently selected file for viewing.

**Example:**
```tsx
setSelectedFile({ path: 'workout.py', content: '...', type: 'code' })
```

#### `setSelectedSubAgent(agent: SubAgent | null): void`

Sets the currently selected sub-agent.

**Example:**
```tsx
setSelectedSubAgent(subAgents[0])
```

#### `toggleSidebar(): void`

Toggles the sidebar collapsed state.

**Example:**
```tsx
<button onClick={toggleSidebar}>Toggle Sidebar</button>
```

#### `setThreadId(id: string | null): void`

Sets the current thread ID and updates the URL.

- **Note:** This will trigger loading the thread state from localStorage

**Example:**
```tsx
setThreadId('thread_1234567890_abc123')
```

## Type Definitions

### Message

```typescript
interface Message {
  type: "human" | "ai" | "system" | "tool"
  content: string
  id?: string
  tool_call_id?: string
  name?: string
  additional_kwargs?: Record<string, unknown>
  timestamp?: number
}
```

### StreamState

```typescript
interface StreamState {
  isStreaming: boolean
  currentMessage: string
  error: string | null
}
```

### TodoItem

```typescript
interface TodoItem {
  id: string
  content: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  createdAt?: number
  updatedAt?: number
  dependencies?: string[]
  assignee?: string
  priority?: "low" | "medium" | "high"
}
```

### SubAgent

```typescript
interface SubAgent {
  id: string
  name: string
  status: "idle" | "thinking" | "acting" | "completed" | "failed"
  steps: SubAgentStep[]
  progress?: number
  startTime?: number
  endTime?: number
}
```

### ChatThread

```typescript
interface ChatThread {
  id: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  title?: string
  todos?: TodoItem[]
  files?: Record<string, string>
}
```

## Thread Management

### Thread Initialization

Threads are initialized in the following priority order:
1. URL query parameter (`?threadId=...`)
2. localStorage (`chat-thread-id`)
3. Newly generated thread ID

### Thread Persistence

Threads are automatically saved to localStorage with the following behavior:

- **Debounced Saving**: Changes are batched and saved after 500ms of inactivity
- **Stream Protection**: Threads are not saved during active streaming to prevent data loss
- **Immediate Saving**: User messages and stream completion trigger immediate saves
- **Storage Key**: Threads are stored as `thread_{threadId}` in localStorage

### Thread Loading

When a thread ID changes (via URL or `setThreadId`):

1. Checks if thread is already loaded (prevents unnecessary reloads)
2. Skips loading if currently streaming (prevents overwriting in-progress messages)
3. Loads messages, todos, and files from localStorage
4. Updates `isLoadingThreadState` flag during loading

## Streaming Behavior

### Character-by-Character Animation

The context implements a smooth character-by-character streaming animation:

- **Speed**: 5 characters per update, every 8ms (~625 characters/second)
- **State**: Streaming content is stored in `streamState.currentMessage`
- **Completion**: When streaming completes, the full message is added to `messages` array

### Stream Callbacks

The `streamAgent` function provides several callbacks:

- **`onMessages`**: Receives new messages from the agent
  - Finds AI messages with content
  - Falls back to tool messages if no AI message found
  - Initiates character streaming animation

- **`onTodos`**: Receives updated todo list
  - Directly updates the todos state

- **`onFiles`**: Receives updated file map
  - Directly updates the files state

- **`onMetadata`**: Receives metadata about sub-agents
  - Handles sub-agent start events (creates sub-agent, todo, and system message)
  - Handles sub-agent completion events (updates status, marks todo complete)

- **`onError`**: Handles streaming errors
  - Updates stream state with error
  - Shows toast notification

- **`onEnd`**: Called when streaming completes
  - Adds final AI message to messages array
  - Saves thread state
  - Clears streaming state

## Sub-Agent Management

### Sub-Agent Lifecycle

1. **Start**: When a sub-agent starts (`metadataType === 'start'`):
   - Creates a new `SubAgent` object with status `'thinking'`
   - Creates a corresponding `TodoItem` with status `'in_progress'`
   - Adds a system message to notify the user
   - Sets the sub-agent as selected

2. **Completion**: When a sub-agent completes (`metadataType === 'complete'`):
   - Updates sub-agent status to `'completed'`
   - Sets progress to 100%
   - Marks all steps as completed
   - Updates corresponding todo to `'completed'`
   - Adds completion notification message

### Sub-Agent Metadata

Sub-agents are identified by metadata with the following structure:

```typescript
{
  subAgent: {
    id: string
    name: string
    description: string
    result?: string | unknown  // Only on completion
  },
  type: 'start' | 'complete'
}
```

## Usage Examples

### Basic Setup

```tsx
// app/layout.tsx or app/coach/page.tsx
import { ChatProvider } from '@/context/ChatContext'

export default function Layout({ children }) {
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  )
}
```

### Sending Messages

```tsx
import { useChat } from '@/context/ChatContext'

function ChatInput() {
  const { sendMessage, streamState } = useChat()
  const [input, setInput] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || streamState.isStreaming) return
    
    await sendMessage(input)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={streamState.isStreaming}
      />
      <button type="submit" disabled={streamState.isStreaming}>
        Send
      </button>
    </form>
  )
}
```

### Displaying Messages

```tsx
import { useChat } from '@/context/ChatContext'

function ChatMessages() {
  const { messages, streamState } = useChat()

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id} className={message.type}>
          {message.content}
        </div>
      ))}
      {streamState.isStreaming && (
        <div className="streaming">
          {streamState.currentMessage}
          <span className="cursor">|</span>
        </div>
      )}
    </div>
  )
}
```

### Displaying Todos

```tsx
import { useChat } from '@/context/ChatContext'

function TodoList() {
  const { todos } = useChat()

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} className={todo.status}>
          {todo.content}
        </li>
      ))}
    </ul>
  )
}
```

### Managing Threads

```tsx
import { useChat } from '@/context/ChatContext'

function ThreadSwitcher() {
  const { threadId, setThreadId, clearChat } = useChat()

  return (
    <div>
      <p>Current Thread: {threadId}</p>
      <button onClick={clearChat}>New Chat</button>
      <button onClick={() => setThreadId('thread_123')}>
        Load Thread 123
      </button>
    </div>
  )
}
```

### Handling Sub-Agents

```tsx
import { useChat } from '@/context/ChatContext'

function SubAgentPanel() {
  const { subAgents, selectedSubAgent, setSelectedSubAgent } = useChat()

  return (
    <div>
      <h3>Active Agents</h3>
      {subAgents.map((agent) => (
        <div
          key={agent.id}
          onClick={() => setSelectedSubAgent(agent)}
          className={selectedSubAgent?.id === agent.id ? 'selected' : ''}
        >
          <h4>{agent.name}</h4>
          <p>Status: {agent.status}</p>
          <p>Progress: {agent.progress}%</p>
        </div>
      ))}
    </div>
  )
}
```

## Implementation Details

### Dependencies

- `react`: Core React functionality
- `nuqs`: URL query state management
- `sonner`: Toast notifications
- `@/lib/agent-stream`: Agent streaming functionality
- `@/lib/thread-storage`: Thread persistence utilities

### Performance Considerations

1. **Debounced Saving**: Prevents excessive localStorage writes
2. **Stream Protection**: Prevents thread loading during active streams
3. **Duplicate Prevention**: Checks for existing messages/todos before adding
4. **Ref-based Tracking**: Uses refs to prevent unnecessary reloads

### Error Handling

- Stream errors are caught and displayed via toast notifications
- localStorage errors are logged but don't crash the app
- Missing thread data gracefully falls back to empty state

### Console Logging

The context includes extensive console logging for debugging:
- Thread loading/saving operations
- Message processing
- Sub-agent lifecycle events
- Stream state changes

All logs are prefixed with `[ChatContext]` for easy filtering.

## Best Practices

1. **Always check `isLoadingThreadState`** before displaying thread-dependent UI
2. **Disable inputs during streaming** using `streamState.isStreaming`
3. **Use `streamState.currentMessage`** for displaying streaming content
4. **Handle errors gracefully** - check `streamState.error` for error states
5. **Don't manually modify state** - use the provided methods
6. **Thread IDs are managed automatically** - only use `setThreadId` when switching threads

## Troubleshooting

### Messages not saving

- Check if streaming is active (saving is disabled during streaming)
- Verify localStorage is available (not in SSR context)
- Check browser console for errors

### Thread not loading

- Verify thread ID exists in localStorage
- Check if thread is already loaded (prevents duplicate loads)
- Ensure not currently streaming (loading is skipped during streams)

### Streaming not working

- Check network connection
- Verify `streamAgent` function is working correctly
- Check browser console for errors
- Ensure `AbortController` is supported

### Duplicate messages

- The context includes duplicate prevention, but check message IDs
- Ensure `onEnd` callback is only called once per stream

