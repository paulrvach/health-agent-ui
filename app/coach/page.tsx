"use client"

import { Suspense } from 'react'
import { ChatProvider, useChat } from '@/context/ChatContext'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { TasksFilesSidebar } from '@/components/chat/TasksFilesSidebar'
import { FileViewDialog } from '@/components/chat/FileViewDialog'

function CoachContent() {
  const {
    todos,
    files,
    selectedFile,
    sidebarCollapsed,
    setSelectedFile,
    toggleSidebar,
  } = useChat()

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)] ">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] overflow-hidden">
        <ChatInterface />
      </div>

      {/* Tasks & Files Sidebar */}
      <TasksFilesSidebar
        todos={todos}
        files={files}
        onFileClick={setSelectedFile}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* File View Dialog */}
      <FileViewDialog
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  )
}

export default function CoachPage() {
  return (
    <ChatProvider>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
        <CoachContent />
      </Suspense>
    </ChatProvider>
  )
}


