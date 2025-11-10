"use client"

export function StreamingIndicator() {
  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-card shadow-sm border border-border/50 w-fit">
      <div className="flex gap-1.5">
        <div 
          className="w-2 h-2 rounded-full bg-primary animate-bounce" 
          style={{ animationDelay: '0ms' }}
        />
        <div 
          className="w-2 h-2 rounded-full bg-primary animate-bounce" 
          style={{ animationDelay: '150ms' }}
        />
        <div 
          className="w-2 h-2 rounded-full bg-primary animate-bounce" 
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="text-[15px] text-foreground/60">Thinking...</span>
    </div>
  )
}

