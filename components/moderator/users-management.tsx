"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Eye,
  Ban,
  Shield,
  Search,
  Filter,
  FileText,
  MessageSquare,
  HelpCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: Date;
  _count: {
    listings: number;
    questions: number;
    answers: number;
    reports: number;
  };
}

interface UsersManagementProps {
  users: User[];
}

const roleLabels: Record<string, string> = {
  USER: "Utilisateur",
  MODERATOR: "Modérateur",
  ADMIN: "Administrateur",
  SUSPENDED: "Suspendu",
};

const roleColors: Record<string, string> = {
  USER: "default",
  MODERATOR: "secondary",
  ADMIN: "destructive",
  SUSPENDED: "outline",
};

export function UsersManagement({ users }: UsersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "reports":
          return b._count.reports - a._count.reports;
        case "activity":
          return (
            b._count.listings +
            b._count.questions +
            b._count.answers -
            (a._count.listings + a._count.questions + a._count.answers)
          );
        default:
          return 0;
      }
    });

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/moderator/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      toast.success("Rôle mis à jour avec succès");
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du rôle");
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityLevel = (user: User) => {
    const total =
      user._count.listings + user._count.questions + user._count.answers;
    if (total >= 20) return { label: "Très actif", color: "bg-green-500" };
    if (total >= 10) return { label: "Actif", color: "bg-blue-500" };
    if (total >= 5) return { label: "Modéré", color: "bg-yellow-500" };
    return { label: "Faible", color: "bg-gray-500" };
  };

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="USER">Utilisateurs</SelectItem>
                <SelectItem value="MODERATOR">Modérateurs</SelectItem>
                <SelectItem value="ADMIN">Administrateurs</SelectItem>
                <SelectItem value="SUSPENDED">Suspendus</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="reports">Plus signalés</SelectItem>
                <SelectItem value="activity">Plus actifs</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              {filteredUsers.length} utilisateur
              {filteredUsers.length > 1 ? "s" : ""} trouvé
              {filteredUsers.length > 1 ? "s" : ""}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter((u) => u.role === "USER").length}
            </div>
            <p className="text-sm text-muted-foreground">Utilisateurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === "MODERATOR").length}
            </div>
            <p className="text-sm text-muted-foreground">Modérateurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {users.filter((u) => u.role === "SUSPENDED").length}
            </div>
            <p className="text-sm text-muted-foreground">Suspendus</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {users.filter((u) => u._count.reports > 0).length}
            </div>
            <p className="text-sm text-muted-foreground">Signalés</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => {
            const activity = getActivityLevel(user);

            return (
              <Card key={user.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Informations utilisateur */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">
                            {user.name || "Utilisateur anonyme"}
                          </h3>
                          <Badge variant={roleColors[user.role] as any}>
                            {roleLabels[user.role]}
                          </Badge>
                          {user._count.reports > 0 && (
                            <Badge variant="destructive">
                              {user._count.reports} signalement
                              {user._count.reports > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(user.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${activity.color}`}
                            />
                            {activity.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Statistiques d'activité */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          {user._count.listings}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <FileText className="h-3 w-3" />
                          Annonces
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {user._count.questions}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <HelpCircle className="h-3 w-3" />
                          Questions
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-purple-600">
                          {user._count.answers}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Réponses
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[160px]">
                      <Link href={`/profile/${user.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir profil
                        </Button>
                      </Link>

                      {user.role === "USER" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateRole(user.id, "SUSPENDED")
                            }
                            disabled={isLoading}
                            className="w-full text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspendre
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateRole(user.id, "MODERATOR")
                            }
                            disabled={isLoading}
                            className="w-full text-purple-600 hover:text-purple-700"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Promouvoir
                          </Button>
                        </>
                      )}

                      {user.role === "SUSPENDED" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUpdateRole(user.id, "USER")}
                          disabled={isLoading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Réactiver
                        </Button>
                      )}

                      {user.role === "MODERATOR" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateRole(user.id, "USER")}
                          disabled={isLoading}
                          className="w-full"
                        >
                          Rétrograder
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
