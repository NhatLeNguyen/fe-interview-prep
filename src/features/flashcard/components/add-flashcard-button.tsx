"use client";

import { Check, Layers } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { toggleFlashcard } from "../actions";

interface AddFlashcardButtonProps {
  questionId: string;
  initialAdded: boolean;
  isAuthenticated: boolean;
}

export function AddFlashcardButton({
  questionId,
  initialAdded,
  isAuthenticated,
}: AddFlashcardButtonProps) {
  const [added, setAdded] = useState(initialAdded);
  const [pending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Link href={ROUTES.LOGIN} className={buttonVariants({ variant: "outline", size: "sm" })}>
        <Layers className="size-4" />
        Ôn tập
      </Link>
    );
  }

  const onToggle = () => {
    const next = !added;
    setAdded(next);
    startTransition(async () => {
      try {
        await toggleFlashcard(questionId, next);
      } catch {
        setAdded(!next);
      }
    });
  };

  return (
    <Button
      type="button"
      variant={added ? "secondary" : "outline"}
      size="sm"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={added}
    >
      {added ? <Check className="size-4" /> : <Layers className="size-4" />}
      {added ? "Đã thêm" : "Ôn tập"}
    </Button>
  );
}
