"use client";

import { useEffect, useRef, useState, type ElementType, type MouseEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase/auth-context";
import { useText } from "@/components/shared/content-provider";
import { saveContentText } from "@/lib/firebase/content";

interface TProps {
  /** Stable key in the content document, e.g. "home.hero.title". */
  id: string;
  /** Copy shown until an admin overrides it. Also the value used on first render. */
  children: string;
  as?: ElementType;
  className?: string;
}

/**
 * Renders a piece of site copy. Admins (role 0/1) can right-click it to edit
 * inline; saving writes the new text to the `content/site` Firestore document.
 */
export function T({ id, children, as: Tag = "span", className }: TProps) {
  const value = useText(id, children);
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const ref = useRef<any>(null);

  useEffect(() => {
    if (!editing || !ref.current) return;
    ref.current.focus();
    const range = document.createRange();
    range.selectNodeContents(ref.current);
    getSelection()?.removeAllRanges();
    getSelection()?.addRange(range);
  }, [editing, value]);

  function onContextMenu(e: MouseEvent) {
    if (!isAdmin || editing) return;
    e.preventDefault();
    setEditing(true);
  }

  async function save() {
    const next = (ref.current?.textContent ?? "").trim();
    setEditing(false);
    if (!next || next === value) {
      if (ref.current) ref.current.textContent = value; // discard the edit
      return;
    }

    try {
      await saveContentText(id, next);
      toast.success("Đã lưu nội dung.");
    } catch {
      if (ref.current) ref.current.textContent = value;
      toast.error("Không lưu được. Kiểm tra quyền quản trị.");
    }
  }

  return (
    <Tag
      ref={ref}
      className={className}
      onContextMenu={onContextMenu}
      contentEditable={editing}
      suppressContentEditableWarning
      data-editing={editing || undefined}
      style={
        editing
          ? { outline: "2px solid hsl(var(--primary))", outlineOffset: 2, borderRadius: 4 }
          : undefined
      }
      onBlur={editing ? save : undefined}
      onKeyDown={
        editing
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLElement).blur();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                if (ref.current) ref.current.textContent = value;
                setEditing(false);
              }
            }
          : undefined
      }
      title={isAdmin && !editing ? "Chuột phải để sửa nội dung" : undefined}
    >
      {value}
    </Tag>
  );
}
