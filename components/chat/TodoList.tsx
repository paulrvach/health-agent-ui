"use client"

import { CheckCircle2, Circle, Loader2, XCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { TodoItem } from '@/app/types/types'
import { useState } from 'react'

interface TodoListProps {
  todos: TodoItem[]
}

export function TodoList({ todos }: TodoListProps) {
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedTodos(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Group todos by status
  const groupedTodos = {
    in_progress: todos.filter(t => t.status === 'in_progress'),
    pending: todos.filter(t => t.status === 'pending'),
    completed: todos.filter(t => t.status === 'completed'),
    cancelled: todos.filter(t => t.status === 'cancelled'),
  }

  const getStatusIcon = (status: TodoItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" style={{ color: 'hsl(var(--chart-1))' }} />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'hsl(var(--chart-2))' }} />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-muted-foreground" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Removed unused getStatusBadge function

  const completedCount = todos.filter(t => t.status === 'completed').length
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Circle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No tasks yet. The AI will create tasks as it works on your requests.
        </p>
      </div>
    )
  }

  const renderTodoGroup = (title: string, todos: TodoItem[]) => {
    if (todos.length === 0) return null

    return (
      <div className="space-y-2">
        <h3 className="text-[13px] font-semibold text-foreground/60 tracking-tight px-1">
          {title}
        </h3>
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="rounded-xl bg-card px-4 py-3 space-y-2 cursor-pointer hover:bg-accent/30 transition-all duration-200"
            onClick={() => toggleExpanded(todo.id)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {getStatusIcon(todo.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] leading-relaxed break-words">{todo.content}</p>
                {expandedTodos.has(todo.id) && (
                  <div className="mt-3 pt-3 border-t space-y-2 text-[13px] text-foreground/60">
                    {todo.createdAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created:</span>
                        <span>{new Date(todo.createdAt).toLocaleString()}</span>
                      </div>
                    )}
                    {todo.updatedAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Updated:</span>
                        <span>{new Date(todo.updatedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                {expandedTodos.has(todo.id) ? (
                  <ChevronDown className="h-4 w-4 text-foreground/40" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-foreground/40" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-foreground/60">Progress</span>
          <span className="text-[15px] font-medium tabular-nums">
            {completedCount} / {todos.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Grouped Todo Items */}
      <div className="space-y-6">
        {renderTodoGroup('In Progress', groupedTodos.in_progress)}
        {renderTodoGroup('Pending', groupedTodos.pending)}
        {renderTodoGroup('Completed', groupedTodos.completed)}
      </div>
    </div>
  )
}

