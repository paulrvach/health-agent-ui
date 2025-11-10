"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Download, X } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import type { FileItem } from '@/app/types/types'

interface FileViewDialogProps {
  file: FileItem | null
  onClose: () => void
}

export function FileViewDialog({ file, onClose }: FileViewDialogProps) {
  const { theme } = useTheme()

  if (!file) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content)
    toast.success('Copied to clipboard')
  }

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.path.split('/').pop() || 'file.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('File downloaded')
  }

  const renderContent = () => {
    if (file.type === 'code' || file.type === 'json') {
      return (
        <SyntaxHighlighter
          language={file.language || 'text'}
          style={theme === 'dark' ? vscDarkPlus : vs}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          }}
          showLineNumbers
        >
          {file.content}
        </SyntaxHighlighter>
      )
    }

    return (
      <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg">
        {file.content}
      </pre>
    )
  }

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-mono">{file.path}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          {file.size && (
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

