"use client"

import { File, FileCode, FileText, FileJson, Folder, FolderOpen } from 'lucide-react'
import type { FileItem } from '@/app/types/types'
import { useState } from 'react'

interface FilesListProps {
  files: Record<string, string>
  onFileClick: (file: FileItem) => void
}

export function FilesList({ files, onFileClick }: FilesListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const getFileType = (path: string): FileItem['type'] => {
    const ext = path.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return 'code'
      case 'md':
      case 'mdx':
        return 'markdown'
      case 'json':
        return 'json'
      default:
        return 'text'
    }
  }

  const getLanguage = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    return ext || 'text'
  }

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'code':
        return <FileCode className="h-4 w-4" style={{ color: 'hsl(var(--chart-2))' }} />
      case 'json':
        return <FileJson className="h-4 w-4" style={{ color: 'hsl(var(--chart-3))' }} />
      case 'markdown':
        return <FileText className="h-4 w-4" style={{ color: 'hsl(var(--chart-1))' }} />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Build file tree structure
  const fileTree = Object.entries(files).reduce((acc, [path, content]) => {
    const parts = path.split('/')
    let current = acc

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // It's a file
        if (!current.files) current.files = []
        current.files.push({ path, content, part })
      } else {
        // It's a folder
        if (!current.folders) current.folders = {}
        if (!current.folders[part]) current.folders[part] = {}
        current = current.folders[part]
      }
    })

    return acc
  }, {} as any)

  const renderTree = (node: any, currentPath: string = '', level: number = 0) => {
    const elements: JSX.Element[] = []

    // Render folders
    if (node.folders) {
      Object.entries(node.folders).forEach(([name, subNode]) => {
        const folderPath = currentPath ? `${currentPath}/${name}` : name
        const isExpanded = expandedFolders.has(folderPath)

        elements.push(
          <div key={folderPath}>
            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer"
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => toggleFolder(folderPath)}
            >
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{name}</span>
            </div>
            {isExpanded && renderTree(subNode, folderPath, level + 1)}
          </div>
        )
      })
    }

    // Render files
    if (node.files) {
      node.files.forEach(({ path, content, part }: any) => {
        const type = getFileType(path)
        const language = getLanguage(path)

        elements.push(
          <div
            key={path}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/40 cursor-pointer transition-colors"
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            onClick={() => onFileClick({ path, content, type, language })}
          >
            {getFileIcon(type)}
            <span className="text-[15px] truncate">{part}</span>
          </div>
        )
      })
    }

    return elements
  }

  if (Object.keys(files).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <File className="h-8 w-8 text-foreground/40" />
        </div>
        <p className="text-[15px] text-foreground/60 leading-relaxed max-w-[220px]">
          No files yet. The AI will generate files as it completes tasks.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {renderTree(fileTree)}
    </div>
  )
}

