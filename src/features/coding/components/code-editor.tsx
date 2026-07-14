"use client";

import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (v: string) => void;
}

/** CodeMirror 6 wrapper (client-only, theme-aware). Khởi tạo trong effect -> không SSR. */
export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const { resolvedTheme } = useTheme();

  // Giữ onChange mới nhất mà không tái tạo editor.
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Khởi tạo (và tái tạo khi đổi theme). Giữ nội dung hiện tại qua `value`.
  useEffect(() => {
    const parent = host.current;
    if (!parent) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        javascript(),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChangeRef.current(u.state.doc.toString());
        }),
        EditorView.theme({
          "&": { fontSize: "13px" },
          ".cm-scroller": { fontFamily: "var(--font-geist-mono), monospace" },
          "&.cm-focused": { outline: "none" },
        }),
        ...(resolvedTheme === "dark" ? [oneDark] : []),
      ],
    });
    const view = new EditorView({ state, parent });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tái tạo khi đổi theme; value đồng bộ riêng
  }, [resolvedTheme]);

  // Đồng bộ value bên ngoài -> editor (vd reset), chỉ khi khác.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (value !== current) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return (
    <div
      ref={host}
      className="overflow-hidden rounded-lg border [&_.cm-editor]:max-h-[55vh] [&_.cm-editor]:min-h-[16rem]"
    />
  );
}
