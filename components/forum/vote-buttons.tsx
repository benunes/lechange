"use client";

import { Button } from "@/components/ui/button";
import { voteAnswer } from "@/lib/actions/forum.actions";
import { ThumbsUp, ThumbsDown, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface VoteButtonsProps {
  answerId: string;
  upvotes: number;
  downvotes: number;
  userVote?: boolean | null; // true = upvote, false = downvote, null = pas voté
  isOwner?: boolean;
}

export function VoteButtons({
  answerId,
  upvotes,
  downvotes,
  userVote,
  isOwner = false,
}: VoteButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticVotes, setOptimisticVotes] = useState({
    upvotes,
    downvotes,
    userVote,
  });

  const handleVote = (isUpvote: boolean) => {
    if (isOwner) {
      toast.error("Tu ne peux pas voter pour ta propre réponse ! 😅");
      return;
    }

    // Mise à jour optimiste de l'UI
    setOptimisticVotes((prev) => {
      const newState = { ...prev };

      if (prev.userVote === isUpvote) {
        // Annuler le vote
        newState.userVote = null;
        if (isUpvote) {
          newState.upvotes -= 1;
        } else {
          newState.downvotes -= 1;
        }
      } else if (prev.userVote === null) {
        // Nouveau vote
        newState.userVote = isUpvote;
        if (isUpvote) {
          newState.upvotes += 1;
        } else {
          newState.downvotes += 1;
        }
      } else {
        // Changer de vote
        newState.userVote = isUpvote;
        if (isUpvote) {
          newState.upvotes += 1;
          newState.downvotes -= 1;
        } else {
          newState.upvotes -= 1;
          newState.downvotes += 1;
        }
      }

      return newState;
    });

    startTransition(async () => {
      const result = await voteAnswer(answerId, isUpvote);

      if (!result.success) {
        // Revenir à l'état précédent en cas d'erreur
        setOptimisticVotes({ upvotes, downvotes, userVote });
        toast.error(result.error || "Erreur lors du vote");
      } else {
        toast.success(
          isUpvote
            ? "Merci pour ton vote positif ! 👍"
            : "Vote pris en compte 👎",
        );
      }
    });
  };

  const totalVotes = optimisticVotes.upvotes + optimisticVotes.downvotes;
  const scorePercent =
    totalVotes > 0 ? (optimisticVotes.upvotes / totalVotes) * 100 : 50;

  return (
    <div className="flex items-center gap-3">
      {/* Bouton Utile (Upvote) */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote(true)}
          disabled={isPending}
          className={`
            group relative overflow-hidden transition-all duration-300
            ${
              optimisticVotes.userVote === true
                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
                : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
            }
          `}
        >
          <motion.div
            animate={
              optimisticVotes.userVote === true
                ? {
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            <ThumbsUp
              className={`h-4 w-4 mr-2 transition-colors ${
                optimisticVotes.userVote === true ? "fill-current" : ""
              }`}
            />
          </motion.div>

          <span className="font-medium">Utile</span>

          {optimisticVotes.upvotes > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-1 text-xs font-bold px-1.5 py-0.5 bg-green-200 text-green-800 rounded-full dark:bg-green-800 dark:text-green-200"
            >
              {optimisticVotes.upvotes}
            </motion.span>
          )}

          {/* Animation de particules au vote */}
          {optimisticVotes.userVote === true && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Sparkles className="h-6 w-6 text-green-500" />
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Barre de score visuelle */}
      {totalVotes > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-green-500"
              initial={{ width: "50%" }}
              animate={{ width: `${scorePercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {Math.round(scorePercent)}%
          </span>
        </div>
      )}

      {/* Bouton Pas utile (optionnel, plus discret) */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote(false)}
          disabled={isPending}
          className={`
            group relative transition-all duration-300 text-xs
            ${
              optimisticVotes.userVote === false
                ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                : "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 text-muted-foreground"
            }
          `}
        >
          <ThumbsDown
            className={`h-3 w-3 mr-1 transition-colors ${
              optimisticVotes.userVote === false ? "fill-current" : ""
            }`}
          />

          <span>Pas utile</span>

          {optimisticVotes.downvotes > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-1 text-xs px-1 py-0.5 bg-red-200 text-red-800 rounded-full dark:bg-red-800 dark:text-red-200"
            >
              {optimisticVotes.downvotes}
            </motion.span>
          )}
        </Button>
      </motion.div>

      {/* Score global quand il y a des votes */}
      {totalVotes > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Heart className="h-3 w-3" />
          <span>
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
