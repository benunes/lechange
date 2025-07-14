"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  Ban,
  Trash2,
  Edit,
  Mail,
  Calendar,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  createdAt: Date;
  _count: {
    questions: number;
    answers: number;
    listings: number;
  };
}

interface UsersManagementProps {
  users: User[];
}

export function UsersManagement({ users }: UsersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur lors du changement de rôle:", error);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erreur lors de la suspension:", error);
    }
  };

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
            <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground">
              {filteredUsers.length} utilisateurs trouvés
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="ALL">Tous les rôles</option>
                <option value="USER">Utilisateurs</option>
                <option value="MODERATOR">Modérateurs</option>
                <option value="ADMIN">Administrateurs</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtres avancés
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {user.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Inscrit le{" "}
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Statistiques d'activité */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">
                        {user._count.questions}
                      </div>
                      <div className="text-muted-foreground">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">
                        {user._count.answers}
                      </div>
                      <div className="text-muted-foreground">Réponses</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {user._count.listings}
                      </div>
                      <div className="text-muted-foreground">Annonces</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(`/profile/${user.id}`, "_blank")
                      }
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      Voir profil
                    </Button>

                    {user.role !== "ADMIN" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleRoleChange(
                              user.id,
                              user.role === "MODERATOR" ? "USER" : "MODERATOR",
                            )
                          }
                        >
                          <Shield className="h-3 w-3" />
                          {user.role === "MODERATOR"
                            ? "Retirer mod"
                            : "Promouvoir"}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleSuspendUser(user.id)}
                        >
                          <Ban className="h-3 w-3" />
                          Suspendre
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou filtres.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
