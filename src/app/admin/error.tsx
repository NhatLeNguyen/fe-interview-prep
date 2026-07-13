"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="font-medium">Đã có lỗi ở trang quản trị</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        Không tải được dữ liệu quản trị. Vui lòng thử lại; nếu vẫn lỗi hãy tải lại trang.
      </p>
      <Button onClick={reset} variant="outline">
        Thử lại
      </Button>
    </div>
  );
}
