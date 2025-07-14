"use client";

import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import Link from "next/link";
import {useMemo, useState} from "react";
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    HelpCircle,
    MessageCircle,
    Plus,
    Search,
    TrendingUp,
    User,
} from "lucide-react";

type Question = {
    id: string;
    title: string;
    content: string | null;
    tags: string[];
    createdAt: Date;
    author: {
        name: string | null;
    };
    _count: {
        answers: number;
    };
};

type ForumStats = {
    questionsCount: number;
    answersCount: number;
};

interface ForumClientPageProps {
    initialQuestions: Question[];
    initialStats: ForumStats;
}

export default function ForumClientPage({
                                            initialQuestions,
                                            initialStats
                                        }: ForumClientPageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("recent");
    const [filterBy, setFilterBy] = useState("all");

    // Filtrage et tri des questions
    const filteredQuestions = useMemo(() => {
        let filtered = initialQuestions.filter((question) => {
            const matchesSearch =
                question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                question.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                question.tags.some((tag) =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase())
                );

            const matchesFilter =
                filterBy === "all" ||
                (filterBy === "answered" && question._count.answers > 0) ||
                (filterBy === "unanswered" && question._count.answers === 0);

            return matchesSearch && matchesFilter;
        });

        // Tri
        if (sortBy === "recent") {
            filtered.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        } else if (sortBy === "popular") {
            filtered.sort((a, b) => b._count.answers - a._count.answers);
        } else if (sortBy === "oldest") {
            filtered.sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        }

        return filtered;
    }, [initialQuestions, searchQuery, sortBy, filterBy]);

    return (
        <div className="min-h-screen py-8">
            {/* Header Section - Plus compact */}
            <div
                className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 rounded-3xl p-6 mb-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="text-center lg:text-left">
                        <div
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/20 rounded-full px-3 py-1 mb-3">
                            <HelpCircle className="h-3 w-3 text-purple-500"/>
                            <span
                                className="text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Forum communautaire
              </span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              <span
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Forum
              </span>
                        </h1>
                        <p className="text-muted-foreground text-sm lg:text-base max-w-xl">
                            Pose tes questions, partage tes connaissances et aide la communauté !
                        </p>

                        {/* Stats compacts */}
                        <div className="flex gap-4 mt-4 justify-center lg:justify-start">
                            <div className="text-center">
                                <div className="text-xl font-bold text-purple-600">
                                    {initialStats.questionsCount}
                                </div>
                                <div className="text-xs text-muted-foreground">Questions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-pink-600">
                                    {initialStats.answersCount}
                                </div>
                                <div className="text-xs text-muted-foreground">Réponses</div>
                            </div>
                        </div>
                    </div>

                    <Button
                        asChild
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Link href="/forum/new" className="flex items-center gap-2">
                            <Plus className="h-4 w-4"/>
                            Poser une question
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Recherche */}
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Rechercher une question, tag, ou mot-clé..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background/50"
                            />
                        </div>

                        {/* Filtres */}
                        <div className="flex gap-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[140px] bg-background/50">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4"/>
                                            Plus récent
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="popular">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4"/>
                                            Populaire
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="oldest">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4"/>
                                            Plus ancien
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filterBy} onValueChange={setFilterBy}>
                                <SelectTrigger className="w-[120px] bg-background/50">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes</SelectItem>
                                    <SelectItem value="answered">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500"/>
                                            Répondues
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="unanswered">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-orange-500"/>
                                            Sans réponse
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Résultats de recherche */}
                    {searchQuery && (
                        <div className="mt-3 text-sm text-muted-foreground">
                            {filteredQuestions.length} résultat
                            {filteredQuestions.length !== 1 ? "s" : ""} pour "{searchQuery}"
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Liste des questions - Format compact */}
            <div className="space-y-3">
                {filteredQuestions.length === 0 ? (
                    <Card
                        className="border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10 backdrop-blur-sm">
                        <CardContent className="text-center py-12">
                            <div
                                className="h-16 w-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HelpCircle className="h-8 w-8 text-purple-500"/>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                {searchQuery
                                    ? "Aucun résultat trouvé"
                                    : "Aucune question pour le moment"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery
                                    ? "Essaie avec d'autres mots-clés ou pose ta propre question !"
                                    : "Sois le premier à poser une question et lance la discussion !"}
                            </p>
                            <Button asChild
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                                <Link href="/forum/new">Poser une question</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    filteredQuestions.map((question) => (
                        <Card
                            key={question.id}
                            className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:-translate-y-0.5"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div
                                                className="h-8 w-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="h-4 w-4 text-purple-500"/>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {/* Titre */}
                                                <Link
                                                    href={`/forum/${question.id}`}
                                                    className="block group-hover:text-purple-600 transition-colors"
                                                >
                                                    <h3 className="font-semibold text-base leading-tight truncate">
                                                        {question.title}
                                                    </h3>
                                                </Link>

                                                {/* Meta info */}
                                                <div
                                                    className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span>Par {question.author.name}</span>
                                                    <span>•</span>
                                                    <span>
                            {new Date(question.createdAt).toLocaleDateString(
                                "fr-FR"
                            )}
                          </span>

                                                    {/* Tags */}
                                                    {question.tags.length > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <div className="flex gap-1">
                                                                {question.tags.slice(0, 2).map((tag) => (
                                                                    <Badge key={tag} variant="outline"
                                                                           className="text-xs px-1 py-0">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                                {question.tags.length > 2 && (
                                                                    <Badge variant="outline"
                                                                           className="text-xs px-1 py-0">
                                                                        +{question.tags.length - 2}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status et stats */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="flex items-center gap-1 text-xs">
                                            <MessageCircle className="h-3 w-3"/>
                                            <span className="font-medium">{question._count.answers}</span>
                                        </div>

                                        {question._count.answers > 0 ? (
                                            <Badge
                                                className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                                                {question._count.answers} réponse
                                                {question._count.answers !== 1 ? "s" : ""}
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="border-orange-300 text-orange-600 dark:border-orange-600/30 dark:text-orange-400 text-xs"
                                            >
                                                Sans réponse
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
