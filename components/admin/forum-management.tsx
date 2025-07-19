"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  MessageCircle,
  Users,
  Calendar,
  Flag,
  Ban,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
  Tags,
  HelpCircle,
  Folder,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface Question {
  id: string;
  title: string;
  content: string | null;
  tags: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  category: {
    name: string;
    icon: string;
    color: string;
  } | null;
  answers: Array<{
    id: string;
    author: { name: string | null };
  }>;
  followers: Array<{ userId: string }>;
  reports: Array<{
    id: string;
    type: string;
  }>;
  _count: {
    answers: number;
    followers: number;
    reports: number;
  };
}

interface Answer {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  images: string[];
  createdAt: Date;
  author: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  question: {
    title: string;
    author: { name: string | null };
  };
  votes: Array<{ isUpvote: boolean }>;
  reports: Array<{
    id: string;
    type: string;
  }>;
  _count: {
    votes: number;
    reports: number;
  };
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  _count: {
    questions: number;
  };
}

interface ForumManagementProps {
  questions: Question[];
  answers: Answer[];
  categories: Category[];
  stats: any[];
}

export function ForumManagement({ questions, answers, categories, stats }: ForumManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Question | Answer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  // Filtrer les questions
  const [filteredQuestions, setFilteredQuestions] = useState(questions);
  const [questionStatusFilter, setQuestionStatusFilter] = useState("all");

  // Filtrer les réponses
  const [filteredAnswers, setFilteredAnswers] = useState(answers);
  const [answerStatusFilter, setAnswerStatusFilter] = useState("all");

  // Supprimer une question
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/forum/questions/${questionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: deleteReason }),
      });

      if (response.ok) {
        toast.success("Question supprimée avec succès");
        setFilteredQuestions(filteredQuestions.filter((q) => q.id !== questionId));
        setDeleteReason("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression de la question");
    }
  };

  // Supprimer une réponse
  const handleDeleteAnswer = async (answerId: string) => {
    try {
      const response = await fetch(`/api/admin/forum/answers/${answerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: deleteReason }),
      });

      if (response.ok) {
        toast.success("Réponse supprimée avec succès");
        setFilteredAnswers(filteredAnswers.filter((a) => a.id !== answerId));
        setDeleteReason("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression de la réponse");
    }
  };

  // Filtrer les questions
  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(
        (question) =>
          question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.author.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (questionStatusFilter !== "all") {
      filtered = filtered.filter((question) => {
        switch (questionStatusFilter) {
          case "reported":
            return question._count.reports > 0;
          case "popular":
            return question._count.answers > 5 || question._count.followers > 10;
          case "recent":
            return new Date(question.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          case "unanswered":
            return question._count.answers === 0;
          default:
            return true;
        }
      });
    }

    setFilteredQuestions(filtered);
  };

  // Filtrer les réponses
  const filterAnswers = () => {
    let filtered = answers;

    if (searchTerm) {
      filtered = filtered.filter(
        (answer) =>
          answer.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          answer.author.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          answer.question.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (answerStatusFilter !== "all") {
      filtered = filtered.filter((answer) => {
        switch (answerStatusFilter) {
          case "reported":
            return answer._count.reports > 0;
          case "popular":
            return answer.upvotes > 5;
          case "recent":
            return new Date(answer.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      });
    }

    setFilteredAnswers(filtered);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réponses</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{answers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signalements</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter((q) => q._count.reports > 0).length +
               answers.filter((a) => a._count.reports > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les différentes sections */}
      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="answers">Réponses</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>

        {/* Onglet Questions */}
        <TabsContent value="questions" className="space-y-4">
          {/* Filtres pour les questions */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres - Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Titre, contenu, auteur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={questionStatusFilter} onValueChange={setQuestionStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="reported">Signalées</SelectItem>
                      <SelectItem value="popular">Populaires</SelectItem>
                      <SelectItem value="recent">Récentes</SelectItem>
                      <SelectItem value="unanswered">Sans réponse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={filterQuestions} className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des questions */}
          <Card>
            <CardHeader>
              <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Statistiques</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{question.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {question.content?.substring(0, 100)}...
                          </div>
                          {question.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {question.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {question.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{question.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={question.author.image || ""} />
                            <AvatarFallback>
                              {question.author.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{question.author.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {question.author.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {question.category && (
                          <Badge
                            variant="secondary"
                            style={{ backgroundColor: `${question.category.color}20` }}
                          >
                            {question.category.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {question._count.answers}
                          </Badge>
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {question._count.followers}
                          </Badge>
                          {question._count.reports > 0 && (
                            <Badge variant="destructive">
                              <Flag className="h-3 w-3 mr-1" />
                              {question._count.reports}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(question.createdAt), "dd/MM/yyyy", { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(question);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/forum/${question.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer la question</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cette question ? Cette action supprimera également toutes les réponses associées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-2">
                                <Label htmlFor="reason">Raison de la suppression</Label>
                                <Textarea
                                  id="reason"
                                  value={deleteReason}
                                  onChange={(e) => setDeleteReason(e.target.value)}
                                  placeholder="Expliquez pourquoi vous supprimez cette question..."
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Réponses */}
        <TabsContent value="answers" className="space-y-4">
          {/* Filtres pour les réponses */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres - Réponses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search-answers">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-answers"
                      placeholder="Contenu, auteur, question..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={answerStatusFilter} onValueChange={setAnswerStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="reported">Signalées</SelectItem>
                      <SelectItem value="popular">Populaires</SelectItem>
                      <SelectItem value="recent">Récentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={filterAnswers} className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des réponses */}
          <Card>
            <CardHeader>
              <CardTitle>Réponses ({filteredAnswers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Réponse</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnswers.map((answer) => (
                    <TableRow key={answer.id}>
                      <TableCell>
                        <div className="text-sm">
                          {answer.content.substring(0, 100)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={answer.author.image || ""} />
                            <AvatarFallback>
                              {answer.author.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{answer.author.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {answer.author.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{answer.question.title}</div>
                          <div className="text-xs text-muted-foreground">
                            par {answer.question.author.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {answer.upvotes}
                          </Badge>
                          <Badge variant="outline">
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            {answer.downvotes}
                          </Badge>
                          {answer._count.reports > 0 && (
                            <Badge variant="destructive">
                              <Flag className="h-3 w-3 mr-1" />
                              {answer._count.reports}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(answer.createdAt), "dd/MM/yyyy", { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(answer);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer la réponse</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-2">
                                <Label htmlFor="reason">Raison de la suppression</Label>
                                <Textarea
                                  id="reason"
                                  value={deleteReason}
                                  onChange={(e) => setDeleteReason(e.target.value)}
                                  placeholder="Expliquez pourquoi vous supprimez cette réponse..."
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAnswer(answer.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Catégories */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Catégories du Forum ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: category.color }}
                          >
                            <span className="text-white font-bold">{category.icon}</span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {category._count.questions} questions
                            </p>
                          </div>
                        </div>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description || "Aucune description"}
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {"title" in (selectedItem || {}) ? "Détails de la question" : "Détails de la réponse"}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {"title" in selectedItem ? (
                // Affichage d'une question
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Titre</h3>
                    <p>{selectedItem.title}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Contenu</h3>
                    <p className="text-sm whitespace-pre-wrap">{selectedItem.content}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Statistiques</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedItem._count.answers}</div>
                        <div className="text-sm text-muted-foreground">Réponses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedItem._count.followers}</div>
                        <div className="text-sm text-muted-foreground">Abonnés</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedItem._count.reports}</div>
                        <div className="text-sm text-muted-foreground">Signalements</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Affichage d'une réponse
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Contenu</h3>
                    <p className="text-sm whitespace-pre-wrap">{selectedItem.content}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Question associée</h3>
                    <p className="font-medium">{selectedItem.question.title}</p>
                    <p className="text-sm text-muted-foreground">
                      par {selectedItem.question.author.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Votes</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedItem.upvotes}</div>
                        <div className="text-sm text-muted-foreground">Votes positifs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{selectedItem.downvotes}</div>
                        <div className="text-sm text-muted-foreground">Votes négatifs</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
