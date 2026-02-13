"use client";

import { ChevronDown, ChevronRight, FolderPlus, MessageSquare, Plus } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { ConversationItem } from "./conversation-item";

interface Folder {
  id: string;
  name: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  folderId?: string | undefined;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  folders: Folder[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onMoveToFolder: (conversationId: string, folderId: string | null) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarContent({
  conversations,
  folders,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onCreateFolder,
  onMoveToFolder,
}: Omit<ChatSidebarProps, "isMobileOpen" | "onMobileClose">) {
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sorted = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const unfiledConversations = sorted.filter((c) => !c.folderId);
  const conversationsByFolder = new Map<string, Conversation[]>();
  for (const folder of folders) {
    conversationsByFolder.set(
      folder.id,
      sorted.filter((c) => c.folderId === folder.id),
    );
  }

  const toggleFolder = useCallback((folderId: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const handleStartCreateFolder = useCallback(() => {
    setIsCreatingFolder(true);
    setNewFolderName("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleSubmitFolder = useCallback(() => {
    const trimmed = newFolderName.trim();
    if (trimmed) {
      onCreateFolder(trimmed);
    }
    setIsCreatingFolder(false);
    setNewFolderName("");
  }, [newFolderName, onCreateFolder]);

  const handleFolderKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmitFolder();
      } else if (e.key === "Escape") {
        setIsCreatingFolder(false);
        setNewFolderName("");
      }
    },
    [handleSubmitFolder],
  );

  const renderConversation = (conv: Conversation) => (
    <ConversationItem
      key={conv.id}
      id={conv.id}
      title={conv.title}
      isActive={conv.id === activeConversationId}
      folders={folders}
      currentFolderId={conv.folderId}
      onSelect={onSelectConversation}
      onRename={onRenameConversation}
      onDelete={onDeleteConversation}
      onMoveToFolder={onMoveToFolder}
    />
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-2 p-3">
        <Button
          variant="outline"
          className="flex-1 justify-start gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary"
          onClick={onNewChat}
        >
          <Plus className="size-4" />
          New Chat
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="border-primary/30 hover:bg-primary/10 hover:text-primary"
          onClick={handleStartCreateFolder}
          title="New Folder"
        >
          <FolderPlus className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {isCreatingFolder && (
          <div className="mb-2 px-2">
            <Input
              ref={inputRef}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={handleSubmitFolder}
              onKeyDown={handleFolderKeyDown}
              placeholder="Folder name..."
              className="h-8 text-sm"
            />
          </div>
        )}

        {folders.length === 0 && sorted.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 px-4 py-8 text-center text-sm">
            <MessageSquare className="size-8 opacity-50" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Folders */}
            {folders.map((folder) => {
              const folderConversations = conversationsByFolder.get(folder.id) ?? [];
              const isCollapsed = collapsedFolders.has(folder.id);

              return (
                <div key={folder.id}>
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder.id)}
                    className={cn(
                      "flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium",
                      "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                    <span className="truncate">{folder.name}</span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {folderConversations.length}
                    </span>
                  </button>
                  {!isCollapsed && (
                    <div className="ml-2 space-y-0.5 border-l pl-2">
                      {folderConversations.length === 0 ? (
                        <p className="text-muted-foreground px-2 py-1 text-xs italic">Empty</p>
                      ) : (
                        folderConversations.map(renderConversation)
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unfiled conversations */}
            {unfiledConversations.length > 0 && (
              <div className={cn(folders.length > 0 && "mt-3 border-t pt-3")}>
                {folders.length > 0 && (
                  <p className="text-muted-foreground mb-1 px-2 text-xs font-medium">Unfiled</p>
                )}
                <div className="space-y-0.5">{unfiledConversations.map(renderConversation)}</div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export function ChatSidebar({
  conversations,
  folders,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onCreateFolder,
  onMoveToFolder,
  isMobileOpen,
  onMobileClose,
}: ChatSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="bg-sidebar hidden h-full w-72 border-r md:block">
        <SidebarContent
          conversations={conversations}
          folders={folders}
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
          onNewChat={onNewChat}
          onRenameConversation={onRenameConversation}
          onDeleteConversation={onDeleteConversation}
          onCreateFolder={onCreateFolder}
          onMoveToFolder={onMoveToFolder}
        />
      </aside>

      {/* Mobile sidebar */}
      <Sheet
        open={isMobileOpen}
        onOpenChange={(open) => {
          if (!open) {
            onMobileClose();
          }
        }}
      >
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Chat history</SheetTitle>
          <SidebarContent
            conversations={conversations}
            folders={folders}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => {
              onSelectConversation(id);
              onMobileClose();
            }}
            onNewChat={() => {
              onNewChat();
              onMobileClose();
            }}
            onRenameConversation={onRenameConversation}
            onDeleteConversation={onDeleteConversation}
            onCreateFolder={onCreateFolder}
            onMoveToFolder={onMoveToFolder}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
