"use client";

import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ThreadHistory } from "./ThreadHistory";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { ScrollArea } from "../ui/scroll-area";

export function ChatInterface() {
  const { clearChat, messages } = useChat();

  return (
    <div className="flex flex-1 flex-col h-full">
      <ScrollArea className="flex-1 h-[calc(100vh-10rem)]">

      {/* Chat Header */}
      {messages.length > 0 && (
        <div className="border-b px-6 py-4 flex items-center justify-between bg-background/95 backdrop-blur-sm">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">
              Conversation
            </h3>
            <p className="text-[13px] text-foreground/60 mt-0.5">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThreadHistory />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="gap-2 rounded-full hover:bg-accent/50 h-9 px-4"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-[15px]">New Chat</span>
            </Button>
          </div>
        </div>
      )}
        {/* Messages Area */}
        <ChatMessages />
      </ScrollArea>
      {/* Input Area */}
      <ChatInput />
    </div>
  );
}
