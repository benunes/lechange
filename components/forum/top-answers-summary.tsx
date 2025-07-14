"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Star,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type TopAnswer = {
  id: string;
  content: string;
  upvotes: number;
  authorName: string;
  isBest: boolean;
};

interface TopAnswersProps {
  answers: TopAnswer[];
  questionId: string;
}

export function TopAnswersSummary({ answers, questionId }: TopAnswersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Trier les réponses par utilité (meilleure réponse en premier, puis par upvotes)
  const sortedAnswers = [...answers]
    .sort((a, b) => {
      if (a.isBest && !b.isBest) return -1;
      if (!a.isBest && b.isBest) return 1;
      return b.upvotes - a.upvotes;
    })
    .slice(0, 3); // Top 3 réponses

  if (sortedAnswers.length === 0) return null;

  return (
    <Card className="border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/10 dark:to-emerald-950/10 backdrop-blur-sm shadow-lg mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Réponses les plus utiles
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                Réduire
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Voir plus
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAnswers.map((answer, index) => (
            <div
              key={answer.id}
              className={`p-3 rounded-lg border transition-all ${
                answer.isBest
                  ? "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-background/50 border-border/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-sm">
                      {answer.authorName}
                    </span>
                    {answer.isBest && (
                      <Badge className="bg-green-500 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Meilleure réponse
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {answer.upvotes}
                    </div>
                  </div>

                  <p
                    className={`text-sm leading-relaxed ${
                      isExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {answer.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href={`#answers`}>
              <MessageCircle className="h-3 w-3 mr-1" />
              Voir toutes les réponses
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
