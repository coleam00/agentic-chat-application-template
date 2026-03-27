"use client";

import { Folder, FolderX, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useCallback, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FolderInfo {
  id: string;
  name: string;
}

interface ConversationItemProps {
  id: string;
  title: string;
  isActive: boolean;
  folders: FolderInfo[];
  currentFolderId?: string | undefined;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (conversationId: string, folderId: string | null) => void;
}

export function ConversationItem({
  id,
  title,
  isActive,
  folders,
  currentFolderId,
  onSelect,
  onRename,
  onDelete,
  onMoveToFolder,
}: ConversationItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartRename = useCallback(() => {
    setIsRenaming(true);
    setRenameValue(title);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [title]);

  const handleSubmitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== title) {
      onRename(id, trimmed);
    }
    setIsRenaming(false);
  }, [id, title, renameValue, onRename]);

  const handleRenameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmitRename();
      } else if (e.key === "Escape") {
        setIsRenaming(false);
        setRenameValue(title);
      }
    },
    [handleSubmitRename, title],
  );

  if (isRenaming) {
    return (
      <div className="px-2 py-1">
        <Input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleSubmitRename}
          onKeyDown={handleRenameKeyDown}
          className="h-8 text-sm"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer border-l-2",
        isActive
          ? "border-primary bg-primary/15 text-primary"
          : "border-transparent hover:bg-accent/50 text-foreground",
      )}
    >
      <button type="button" className="flex-1 truncate text-left" onClick={() => onSelect(id)}>
        {title}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6 shrink-0 opacity-40 group-hover:opacity-100"
            aria-label={`Options for ${title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleStartRename}>
            <Pencil className="size-3.5" />
            Rename
          </DropdownMenuItem>
          {folders.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Folder className="size-3.5" />
                Move to folder
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {currentFolderId && (
                  <DropdownMenuItem onClick={() => onMoveToFolder(id, null)}>
                    <FolderX className="size-3.5" />
                    Remove from folder
                  </DropdownMenuItem>
                )}
                {currentFolderId && folders.length > 0 && <DropdownMenuSeparator />}
                {folders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => onMoveToFolder(id, folder.id)}
                    disabled={folder.id === currentFolderId}
                  >
                    <Folder className="size-3.5" />
                    {folder.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => onDelete(id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
