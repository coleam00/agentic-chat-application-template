"use client";

import { useCallback, useEffect, useState } from "react";

interface LocalStorageItem {
  id: string;
  title: string;
  updatedAt: string;
  folderId?: string | undefined;
}

export function useLocalStorage(key: string) {
  const [items, setItems] = useState<LocalStorageItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setItems(JSON.parse(stored) as LocalStorageItem[]);
      }
    } catch {
      // Ignore parse errors
    }
  }, [key]);

  const addItem = useCallback(
    (item: LocalStorageItem) => {
      setItems((prev) => {
        const next = [item, ...prev];
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key],
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key],
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<LocalStorageItem, "id">>) => {
      setItems((prev) => {
        const next = prev.map((i) => (i.id === id ? { ...i, ...updates } : i));
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key],
  );

  return { items, addItem, removeItem, updateItem };
}
