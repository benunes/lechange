"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  MessageSquare,
  Package,
  AlertTriangle,
  TrendingUp,
  Settings,
  Shield,
  Eye,
  Ban,
  Trash2,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalListings: number;
    totalQuestions: number;
    totalAnswers: number;
    pendingReports: number;
  };
  recent: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
      createdAt: Date;
    }>;
    listings: Array<{
      id: string;
      title: string;
      category: string;
      price?: number;
      createdAt: Date;
      createdBy: { name: string };
    }>;
    questions: Array<{
      id: string;
      title: string;
      tags: string[];
      createdAt: Date;
      author: { name: string };
      _count: { answers: number };
    }>;
  };
}

export function AdminDashboard({ stats, recent }: AdminDashboardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "MODERATOR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Administration
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez votre plateforme et modérez le contenu
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/moderation">
              <Shield className="h-4 w-4 mr-2" />
              Modération
            </Link>
          </Button>
        </div>
      </div>

      {/* Navigation rapide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link href="/admin/users">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Utilisateurs</h3>
              <p className="text-sm text-muted-foreground">Gérer les comptes</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link href="/admin/forum">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Forum</h3>
              <p className="text-sm text-muted-foreground">
                Questions & réponses
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link href="/admin/listings">
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Annonces</h3>
              <p className="text-sm text-muted-foreground">
                Gérer les annonces
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <Link href="/admin/reports">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Signalements</h3>
              <p className="text-sm text-muted-foreground">
                {stats.pendingReports} en attente
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisateurs Total
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Membres inscrits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalQuestions}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAnswers} réponses au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalListings}
            </div>
            <p className="text-xs text-muted-foreground">Annonces publiées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signalements</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.pendingReports}
            </div>
            <p className="text-xs text-muted-foreground">
              En attente de traitement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nouveaux utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Nouveaux utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recent.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : (
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/users">Voir tous les utilisateurs</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Nouvelles questions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Questions récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recent.questions.map((question) => (
              <div
                key={question.id}
                className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h4 className="font-medium text-sm line-clamp-2 mb-2">
                  {question.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Par {question.author.name}</span>
                  <span>{question._count.answers} réponses</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {question.tags.slice(0, 2).map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-800/50 dark:text-purple-200 dark:border-purple-600/30 border"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/forum">Voir toutes les questions</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Nouvelles annonces */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Annonces récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recent.listings.map((listing) => (
              <div
                key={listing.id}
                className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h4 className="font-medium text-sm line-clamp-2 mb-2">
                  {listing.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Par {listing.createdBy.name}</span>
                  {listing.price && (
                    <span className="font-medium text-green-600">
                      {listing.price}€
                    </span>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {listing.category}
                </Badge>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/listings">Voir toutes les annonces</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
