"use client";

import { MessageSquare, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/use-chat";
import { useFolders } from "@/hooks/use-folders";

import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatSidebar } from "./chat-sidebar";
import { MessageList } from "./message-list";

export function ChatLayout() {
  const {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    isLoadingMessages,
    streamingContent,
    sendMessage,
    selectConversation,
    createNewChat,
    renameConversation,
    deleteConversation,
    moveToFolder,
  } = useChat();

  const { folders, addFolder } = useFolders();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUnhealthy, setIsUnhealthy] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 3000);
      const response = await fetch("/api/health", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        setIsUnhealthy(false);
        setIsDismissed(false);
      } else {
        setIsUnhealthy(true);
      }
    } catch {
      setIsUnhealthy(true);
    }
  }, []);

  useEffect(() => {
    void checkHealth();
    const interval = setInterval(() => {
      void checkHealth();
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, [checkHealth]);

  const activeTitle = conversations.find((c) => c.id === activeConversationId)?.title ?? null;

  const toggleSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const handleCreateFolder = useCallback(
    (name: string) => {
      addFolder(name);
    },
    [addFolder],
  );

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="flex h-screen">
      <ChatSidebar
        conversations={conversations}
        folders={folders}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={createNewChat}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        onCreateFolder={handleCreateFolder}
        onMoveToFolder={moveToFolder}
        isMobileOpen={isMobileOpen}
        onMobileClose={closeMobile}
      />

      <div className="chat-gradient-bg flex flex-1 flex-col">
        {isUnhealthy && !isDismissed && (
          <div className="flex items-center justify-between bg-amber-100 px-4 py-2 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
            <span className="text-sm font-medium">
              Unable to reach the server. Some features may be unavailable.
            </span>
            <button
              type="button"
              onClick={() => {
                setIsDismissed(true);
              }}
              className="ml-4 rounded p-1 hover:bg-amber-200 dark:hover:bg-amber-800"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <ChatHeader title={activeTitle} onToggleSidebar={toggleSidebar} />

        {isLoadingMessages && activeConversationId ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl space-y-4 py-4">
              <div className="flex gap-3 px-4 py-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <Skeleton className="h-16 w-3/4 rounded-2xl" />
              </div>
              <div className="flex flex-row-reverse gap-3 px-4 py-3">
                <Skeleton className="h-10 w-1/2 rounded-2xl" />
              </div>
              <div className="flex gap-3 px-4 py-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <Skeleton className="h-24 w-2/3 rounded-2xl" />
              </div>
              <div className="flex flex-row-reverse gap-3 px-4 py-3">
                <Skeleton className="h-10 w-2/5 rounded-2xl" />
              </div>
            </div>
          </div>
        ) : hasMessages ? (
          <MessageList
            messages={messages}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <div className="bg-primary/10 flex size-16 items-center justify-center rounded-2xl">
              <MessageSquare className="text-primary size-8" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">How can I help you today?</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Start a conversation by typing a message below.
              </p>
            </div>
          </div>
        )}

        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
