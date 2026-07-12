import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "../actions";

/** Hiển thị email + nút đăng xuất (Server Component; logout qua Server Action). */
export function UserMenu({ email }: { email: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground hidden max-w-40 truncate text-sm sm:inline" title={email}>
        {email}
      </span>
      <form action={logout}>
        <Button type="submit" variant="ghost" size="icon" aria-label="Đăng xuất">
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}
