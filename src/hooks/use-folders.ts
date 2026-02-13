"use client";

import { useCallback, useEffect, useState } from "react";

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY = "chat-folders";

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFolders(JSON.parse(stored) as Folder[]);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const addFolder = useCallback((name: string) => {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => {
      const next = [...prev, folder];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return folder;
  }, []);

  const removeFolder = useCallback((id: string) => {
    setFolders((prev) => {
      const next = prev.filter((f) => f.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, name } : f));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { folders, addFolder, removeFolder, renameFolder };
}
