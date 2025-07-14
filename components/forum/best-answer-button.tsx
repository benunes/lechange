"use client";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { markBestAnswer } from "@/lib/actions/forum.actions";

export function BestAnswerButton({
  questionId,
  answerId,
  isBest,
  canMark,
}: {
  questionId: string;
  answerId: string;
  isBest: boolean;
  canMark: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  if (!canMark || isBest) return null;

  const handleMarkBestAnswer = () => {
    startTransition(async () => {
      await markBestAnswer(questionId, answerId);
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="border-green-500 text-green-600 hover:bg-green-50 ml-2"
      disabled={isPending}
      onClick={handleMarkBestAnswer}
    >
      Marquer comme meilleure réponse
    </Button>
  );
}
