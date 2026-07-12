"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { toggleBookmark } from "../actions";

interface BookmarkButtonProps {
  questionId: string;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
}

export function BookmarkButton({ questionId, initialBookmarked, isAuthenticated }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  // Khách chưa đăng nhập -> điều hướng sang /login.
  if (!isAuthenticated) {
    return (
      <Link href={ROUTES.LOGIN} className={buttonVariants({ variant: "outline", size: "sm" })}>
        <Bookmark className="size-4" />
        Lưu
      </Link>
    );
  }

  const onToggle = () => {
    const next = !bookmarked;
    setBookmarked(next); // optimistic
    startTransition(async () => {
      try {
        await toggleBookmark(questionId, next);
      } catch {
        setBookmarked(!next); // revert nếu lỗi
      }
    });
  };

  return (
    <Button
      type="button"
      variant={bookmarked ? "secondary" : "outline"}
      size="sm"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={bookmarked}
    >
      {bookmarked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      {bookmarked ? "Đã lưu" : "Lưu"}
    </Button>
  );
}
