import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

/** Nội dung 404 dùng chung cho root not-found và (app) not-found. */
export function NotFoundContent() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-primary font-mono text-5xl font-bold">404</p>
      <div className="space-y-1">
        <p className="text-lg font-semibold">Không tìm thấy trang</p>
        <p className="text-muted-foreground max-w-sm text-sm">
          Trang bạn tìm không tồn tại hoặc đã bị di chuyển.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href={ROUTES.HOME} className={buttonVariants({ variant: "outline" })}>
          Về trang chủ
        </Link>
        <Link href={ROUTES.QUESTIONS} className={buttonVariants()}>
          Xem câu hỏi
        </Link>
      </div>
    </div>
  );
}
