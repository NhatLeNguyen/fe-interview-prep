"use client";

// Bắt lỗi ở root layout (hiếm) — thay thế toàn bộ layout nên phải tự render html/body.
// Không dùng được theme token ở đây, dùng inline style tối giản.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily: "system-ui, sans-serif",
          padding: 16,
          textAlign: "center",
        }}
      >
        <p style={{ fontWeight: 600 }}>Đã có lỗi nghiêm trọng</p>
        <p style={{ color: "#666", fontSize: 14, maxWidth: 360 }}>
          Ứng dụng gặp sự cố ngoài dự kiến. Vui lòng thử lại hoặc tải lại trang.
        </p>
        <button
          onClick={reset}
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
            background: "transparent",
          }}
        >
          Thử lại
        </button>
      </body>
    </html>
  );
}
