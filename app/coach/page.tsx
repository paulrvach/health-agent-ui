"use client"

import { ChatProvider, useChat } from '@/context/ChatContext'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { TasksFilesSidebar } from '@/components/chat/TasksFilesSidebar'
import { SubAgentPanel } from '@/components/chat/SubAgentPanel'
import { FileViewDialog } from '@/components/chat/FileViewDialog'

function CoachContent() {
  const {
    todos,
    files,
    selectedFile,
    selectedSubAgent,
    sidebarCollapsed,
    setSelectedFile,
    setSelectedSubAgent,
    toggleSidebar,
  } = useChat()

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
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
      <CoachContent />
    </ChatProvider>
  )
}


