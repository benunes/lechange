"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ModeratorStats {
  pendingReports: number;
  todayReports: number;
  totalResolvedReports: number;
  suspendedUsers: number;
  flaggedListings: number;
  flaggedQuestions: number;
  recentReports: Array<{
    id: string;
    type: string;
    details: string | null;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
    listing?: {
      id: string;
      title: string;
    } | null;
    question?: {
      id: string;
      title: string;
    } | null;
    answer?: {
      id: string;
      content: string;
    } | null;
  }>;
  topReportedUsers: Array<{
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    _count: {
      reports: number;
    };
  }>;
}

interface ModeratorDashboardProps {
  stats: ModeratorStats;
}

const reportTypeLabels: Record<string, string> = {
  INAPPROPRIATE_CONTENT: "Contenu inapproprié",
  SPAM: "Spam",
  HARASSMENT: "Harcèlement",
  FAKE_LISTING: "Fausse annonce",
  SCAM: "Arnaque",
  COPYRIGHT: "Violation de droits d'auteur",
  OTHER: "Autre",
};

const reportTypeColors: Record<string, string> = {
  INAPPROPRIATE_CONTENT: "destructive",
  SPAM: "secondary",
  HARASSMENT: "destructive",
  FAKE_LISTING: "destructive",
  SCAM: "destructive",
  COPYRIGHT: "secondary",
  OTHER: "outline",
};

export function ModeratorDashboard({ stats }: ModeratorDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Signalements en attente
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingReports}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.todayReports} aujourd&apos;hui
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Signalements résolus
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalResolvedReports}
            </div>
            <p className="text-xs text-muted-foreground">Total résolu</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisateurs suspendus
            </CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.suspendedUsers}
            </div>
            <p className="text-xs text-muted-foreground">Suspensions actives</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contenu signalé
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.flaggedListings + stats.flaggedQuestions}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.flaggedListings} annonces, {stats.flaggedQuestions}{" "}
              questions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Actions rapides
          </CardTitle>
          <CardDescription>
            Accès rapide aux fonctionnalités de modération
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/moderator/reports">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <AlertTriangle className="h-6 w-6" />
                <span>Gérer les signalements</span>
                {stats.pendingReports > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {stats.pendingReports}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link href="/moderator/users">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                <span>Modérer les utilisateurs</span>
              </Button>
            </Link>

            <Link href="/moderator/content">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col gap-2"
              >
                <MessageSquare className="h-6 w-6" />
                <span>Modérer le contenu</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Signalements récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Signalements récents
            </CardTitle>
            <CardDescription>
              Les derniers signalements en attente de traitement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentReports.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Aucun signalement en attente</p>
                </div>
              ) : (
                stats.recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={reportTypeColors[report.type] as any}>
                          {reportTypeLabels[report.type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(report.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={report.user.image || ""} />
                          <AvatarFallback>
                            {report.user.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {report.user.name || "Utilisateur anonyme"}
                        </span>
                      </div>

                      {report.details && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.details}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Link href={`/moderator/reports/${report.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Examiner
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {stats.recentReports.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/moderator/reports">
                  <Button variant="outline">Voir tous les signalements</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Utilisateurs les plus signalés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Utilisateurs surveillés
            </CardTitle>
            <CardDescription>
              Utilisateurs avec le plus de signalements actifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topReportedUsers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Aucun utilisateur signalé</p>
                </div>
              ) : (
                stats.topReportedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.name || "Utilisateur anonyme"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {user._count.reports} signalement
                        {user._count.reports > 1 ? "s" : ""}
                      </Badge>
                      <Link href={`/moderator/users/${user.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {stats.topReportedUsers.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/moderator/users">
                  <Button variant="outline">Gérer les utilisateurs</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
