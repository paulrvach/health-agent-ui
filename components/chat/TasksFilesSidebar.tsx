"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ListTodo, FileText } from 'lucide-react'
import { TodoList } from './TodoList'
import { FilesList } from './FilesList'
import type { TodoItem, FileItem } from '@/app/types/types'
import { cn } from '@/lib/utils'

interface TasksFilesSidebarProps {
  todos: TodoItem[]
  files: Record<string, string>
  onFileClick: (file: FileItem) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function TasksFilesSidebar({
  todos,
  files,
  onFileClick,
  collapsed,
  onToggleCollapse,
}: TasksFilesSidebarProps) {
  const todoCount = todos.length
  const fileCount = Object.keys(files).length

  return (
    <div
      className={cn(
        "border-l bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-0 overflow-hidden" : "w-80"
      )}
    >
      {/* Header */}
      <div className="border-b px-5 py-4 flex items-center justify-between">
        <h3 className={cn(
          "text-[17px] font-semibold tracking-tight transition-opacity",
          collapsed ? "opacity-0" : "opacity-100"
        )}>
          Workspace
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-9 w-9 rounded-full hover:bg-accent/50"
        >
          {collapsed ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Tabs Content */}
      {!collapsed && (
        <Tabs defaultValue="todos" className="flex-1 flex flex-col">
          <TabsList className="mx-5 mt-3 bg-muted/50 p-1 h-auto">
            <TabsTrigger 
              value="todos" 
              className="flex-1 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5"
            >
              <ListTodo className="h-4 w-4" />
              <span className="text-[15px] font-medium">Tasks</span>
              {todoCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[13px] font-semibold tabular-nums">
                  {todoCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="flex-1 gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5"
            >
              <FileText className="h-4 w-4" />
              <span className="text-[15px] font-medium">Files</span>
              {fileCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[13px] font-semibold tabular-nums">
                  {fileCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="flex-1 mt-0 px-5 py-4">
            <ScrollArea className="h-full">
              <TodoList todos={todos} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="files" className="flex-1 mt-0 px-5 py-4">
            <ScrollArea className="h-full">
              <FilesList files={files} onFileClick={onFileClick} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

