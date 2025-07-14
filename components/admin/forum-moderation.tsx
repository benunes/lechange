"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Search,
  Filter,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  MessageSquare,
  HelpCircle,
  Flag,
} from "lucide-react";
import Link from "next/link";

interface ForumModerationProps {
  questions: any[];
  answers: any[];
  reports: any[];
}

export function ForumModeration({
  questions,
  answers,
  reports,
}: ForumModerationProps) {
  const [activeTab, setActiveTab] = useState("questions");
  const [searchTerm, setSearchTerm] = useState("");

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) return;

    try {
      const response = await fetch(`/api/admin/forum/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette réponse ?")) return;

    try {
      const response = await fetch(`/api/admin/forum/answers/${answerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredAnswers = answers.filter(
    (a) =>
      a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.question.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/admin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Modération du Forum</h1>
            <p className="text-muted-foreground">
              Gérez les questions, réponses et signalements
            </p>
          </div>
        </div>

        <Button
          asChild
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
        >
          <Link href="/admin/reports">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Signalements ({reports.length})
          </Link>
        </Button>
      </div>

      {/* Onglets */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button
                variant={activeTab === "questions" ? "default" : "outline"}
                onClick={() => setActiveTab("questions")}
                className="flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Questions ({filteredQuestions.length})
              </Button>
              <Button
                variant={activeTab === "answers" ? "default" : "outline"}
                onClick={() => setActiveTab("answers")}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Réponses ({filteredAnswers.length})
              </Button>
              <Button
                variant={activeTab === "reports" ? "default" : "outline"}
                onClick={() => setActiveTab("reports")}
                className="flex items-center gap-2"
              >
                <Flag className="h-4 w-4" />
                Signalements ({reports.length})
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher du contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu des onglets */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {filteredQuestions.map((question) => (
              <Card
                key={question.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-8 w-8">
                          {question.author.image ? (
                            <AvatarImage
                              src={question.author.image}
                              alt={question.author.name}
                            />
                          ) : (
                            <AvatarFallback>
                              {question.author.name[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{question.author.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(question.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {question._count.answers} réponse
                          {question._count.answers !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold mb-2">
                        {question.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3">
                        {question.content}
                      </p>

                      {question.tags.length > 0 && (
                        <div className="flex gap-1 mt-3">
                          {question.tags.map((tag: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600/30 border"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(`/forum/${question.id}`, "_blank")
                        }
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Aucune question trouvée
                </h3>
                <p className="text-muted-foreground">
                  Aucune question ne correspond à votre recherche.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "answers" && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {filteredAnswers.map((answer) => (
              <Card
                key={answer.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-8 w-8">
                          {answer.author.image ? (
                            <AvatarImage
                              src={answer.author.image}
                              alt={answer.author.name}
                            />
                          ) : (
                            <AvatarFallback>
                              {answer.author.name[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{answer.author.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(answer.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-green-600">
                          {answer.upvotes - answer.downvotes} votes
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        Réponse à : <strong>{answer.question.title}</strong>
                      </p>
                      <p className="text-muted-foreground line-clamp-3">
                        {answer.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(`/forum/${answer.question.id}`, "_blank")
                        }
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteAnswer(answer.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAnswers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Aucune réponse trouvée
                </h3>
                <p className="text-muted-foreground">
                  Aucune réponse ne correspond à votre recherche.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "reports" && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">
              Système de signalements
            </h3>
            <p className="text-muted-foreground mb-4">
              Cette fonctionnalité sera bientôt disponible pour gérer les
              signalements d'utilisateurs.
            </p>
            <Button asChild>
              <Link href="/admin/reports">Configurer les signalements</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
