# Plan: User-Defined Folders for Chat Conversations

## Summary

Add user-defined folders to organize chat conversations in the sidebar. Users can create folders, assign conversations to them, and see conversations grouped by folder. All data persists in localStorage (no database changes). Folders are collapsible sections in the sidebar.

## User Story

As a chat user
I want to create folders and organize my conversations into them
So that I can keep related chats grouped together

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY |
| Complexity | MEDIUM |
| Systems Affected | Sidebar UI, localStorage hooks |
| Time Estimate | 15 minutes |

---

## Patterns to Follow

### LocalStorage Hook Pattern
```typescript
// SOURCE: src/hooks/use-local-storage.ts:11-59
export function useLocalStorage(key: string) {
  const [items, setItems] = useState<LocalStorageItem[]>([]);
  // ... addItem, removeItem, updateItem callbacks
  return { items, addItem, removeItem, updateItem };
}
```

### Sidebar Component Pattern
```typescript
// SOURCE: src/components/chat/chat-sidebar.tsx:28-76
function SidebarContent({ conversations, ... }) {
  const sorted = [...conversations].sort(...);
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button>New Chat</Button>
      </div>
      <ScrollArea className="flex-1 px-2">
        {/* conversation list */}
      </ScrollArea>
    </div>
  );
}
```

### Dropdown Menu Pattern (for "Move to Folder")
```typescript
// SOURCE: src/components/chat/conversation-item.tsx:102-124
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon-sm">
      <MoreHorizontal className="size-3.5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={...}>
      <Pencil className="size-3.5" />
      Rename
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/use-local-storage.ts` | UPDATE | Add optional `folderId` field to item type |
| `src/hooks/use-folders.ts` | CREATE | Hook for managing folders in localStorage |
| `src/components/chat/chat-sidebar.tsx` | UPDATE | Add folder sections, "New Folder" button |
| `src/components/chat/conversation-item.tsx` | UPDATE | Add "Move to Folder" dropdown menu option |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Task 1: Extend LocalStorageItem type

- **File**: `src/hooks/use-local-storage.ts`
- **Action**: UPDATE
- **Implement**: Add optional `folderId?: string` to `LocalStorageItem` interface
- **Mirror**: Same file, line 5-9
- **Validate**: `bun run lint && npx tsc --noEmit`

### Task 2: Create useFolders hook

- **File**: `src/hooks/use-folders.ts`
- **Action**: CREATE
- **Implement**:
  - Define `Folder` interface: `{ id: string; name: string; createdAt: string }`
  - Create `useFolders()` hook using same pattern as `useLocalStorage`
  - Use key `"chat-folders"` for localStorage
  - Export: `folders`, `addFolder`, `removeFolder`, `renameFolder`
- **Mirror**: `src/hooks/use-local-storage.ts:1-59` - follow same pattern
- **Validate**: `bun run lint && npx tsc --noEmit`

### Task 3: Update ChatSidebar with folder UI

- **File**: `src/components/chat/chat-sidebar.tsx`
- **Action**: UPDATE
- **Implement**:
  - Import `useFolders` hook, `FolderPlus`, `ChevronRight`, `ChevronDown` icons
  - Add props: `folders`, `onCreateFolder`, `onMoveToFolder`
  - Add "New Folder" button next to "New Chat"
  - Group conversations by `folderId`:
    - Unfiled conversations at top
    - Each folder as collapsible section with folder name header
  - Use local state for collapsed/expanded folders
- **Mirror**: Same file, lines 40-76 for structure
- **Validate**: `bun run lint && npx tsc --noEmit`

### Task 4: Add "Move to Folder" to ConversationItem

- **File**: `src/components/chat/conversation-item.tsx`
- **Action**: UPDATE
- **Implement**:
  - Add props: `folders: Array<{id: string; name: string}>`, `onMoveToFolder: (convId: string, folderId: string | null) => void`
  - Add `DropdownMenuSub` with folder list after Rename option
  - Include "No Folder" option to unfiled
- **Mirror**: Same file, lines 102-124 for dropdown pattern
- **Validate**: `bun run lint && npx tsc --noEmit`

### Task 5: Wire up in ChatLayout or parent

- **File**: `src/components/chat/chat-layout.tsx`
- **Action**: UPDATE
- **Implement**:
  - Import and use `useFolders` hook
  - Pass folders and handlers to ChatSidebar
  - Create `handleMoveToFolder` that calls `updateItem(convId, { folderId })`
  - Create `handleCreateFolder` with prompt/input for folder name
- **Mirror**: Same file for prop passing pattern
- **Validate**: `bun run lint && npx tsc --noEmit`

### Task 6: Add inline folder creation UI

- **File**: `src/components/chat/chat-sidebar.tsx`
- **Action**: UPDATE
- **Implement**:
  - Add state for `isCreatingFolder` and `newFolderName`
  - When "New Folder" clicked, show inline Input (same pattern as rename in ConversationItem)
  - On Enter/blur, call `onCreateFolder(name)`
- **Mirror**: `src/components/chat/conversation-item.tsx:75-88` for inline input pattern
- **Validate**: `bun run lint && npx tsc --noEmit`

---

## Validation

```bash
# Type check
npx tsc --noEmit

# Lint
bun run lint

# Manual test
bun run dev
# Then: Create folder, move conversation to it, verify persistence on refresh
```

---

## Acceptance Criteria

- [ ] User can click "New Folder" and type a name to create a folder
- [ ] Folders appear as collapsible sections in sidebar
- [ ] User can move conversations to folders via dropdown menu
- [ ] User can move conversations back to "No Folder"
- [ ] Folder state persists across page refresh (localStorage)
- [ ] Type check passes
- [ ] Lint passes

---

## Quick Implementation Notes

**localStorage keys:**
- `chat-conversations` - existing, add `folderId` field
- `chat-folders` - new, stores folder list

**Folder structure in sidebar:**
```
[New Chat] [New Folder]
─────────────────────
📁 Work (▼ collapse)
  - Chat about project X
  - Meeting notes
📁 Personal (▶ expand)
─────────────────────
Unfiled
  - Random chat
  - Another chat
```

**Skip for MVP (add later):**
- Folder deletion
- Folder renaming
- Drag-and-drop reordering
