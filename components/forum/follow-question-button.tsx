"use client";
import { Button } from "@/components/ui/button";
import { followQuestion, unfollowQuestion } from "@/lib/actions/forum.actions";
import { Bell, BellOff } from "lucide-react";
import { useTransition } from "react";

interface FollowQuestionButtonProps {
  questionId: string;
  isFollowing: boolean;
  isAuthor: boolean;
}

export function FollowQuestionButton({
  questionId,
  isFollowing,
  isAuthor,
}: FollowQuestionButtonProps) {
  const [isPending, startTransition] = useTransition();

  // L'auteur suit automatiquement sa question
  if (isAuthor) return null;

  const handleToggleFollow = () => {
    startTransition(async () => {
      if (isFollowing) {
        await unfollowQuestion(questionId);
      } else {
        await followQuestion(questionId);
      }
    });
  };

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isPending}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={`flex items-center gap-2 ${
        isFollowing
          ? "border-blue-500 text-blue-600 hover:bg-blue-50"
          : "bg-blue-500 hover:bg-blue-600 text-white"
      }`}
    >
      {isFollowing ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {isPending ? "..." : isFollowing ? "Ne plus suivre" : "Suivre"}
    </Button>
  );
}
