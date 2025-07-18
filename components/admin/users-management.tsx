"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useUserRole } from "@/lib/hooks/use-user-role";
import { toast } from "sonner";
import {
  Activity,
  Ban,
  Calendar,
  Edit,
  Mail,
  MoreHorizontal,
  Search,
  Shield,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  stats: {
    totalUsers: number;
    adminCount: number;
    moderatorCount: number;
    activeUsersThisMonth: number;
  };
}

export function UsersManagement({ users, stats }: UsersManagementProps) {
  const { isAdmin, userData } = useUserRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les permissions pour modifier les rôles");
      return;
    }

    if (userId === userData?.id) {
      toast.error("Vous ne pouvez pas modifier votre propre rôle");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success("Rôle modifié avec succès");
        window.location.reload(); // Simple refresh for now
      } else {
        toast.error("Erreur lors de la modification du rôle");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    if (!isAdmin) {
      toast.error(
        "Vous n'avez pas les permissions pour suspendre des utilisateurs",
      );
      return;
    }

    if (userId === userData?.id) {
      toast.error("Vous ne pouvez pas vous suspendre vous-même");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspend }),
      });

      if (response.ok) {
        toast.success(suspend ? "Utilisateur suspendu" : "Suspension levée");
        window.location.reload();
      } else {
        toast.error("Erreur lors de la modification");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "MODERATOR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "SUSPENDED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Seuls les administrateurs peuvent gérer les utilisateurs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.adminCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modérateurs</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.moderatorCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeUsersThisMonth}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les rôles</SelectItem>
                <SelectItem value="USER">Utilisateurs</SelectItem>
                <SelectItem value="MODERATOR">Modérateurs</SelectItem>
                <SelectItem value="ADMIN">Administrateurs</SelectItem>
                <SelectItem value="SUSPENDED">Suspendus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : (
                      <AvatarFallback>
                        {user.name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {user.name || "Sans nom"}
                      </h3>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{user._count.questions} questions</span>
                      <span>{user._count.answers} réponses</span>
                      <span>{user._count.listings} annonces</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Role Change */}
                  {user.id !== userData?.id && (
                    <Select
                      value={user.role}
                      onValueChange={(newRole) =>
                        handleRoleChange(user.id, newRole)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Utilisateur</SelectItem>
                        <SelectItem value="MODERATOR">Modérateur</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {/* Actions Menu */}
                  {user.id !== userData?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/profile/${user.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Voir le profil
                          </Link>
                        </DropdownMenuItem>
                        {user.role !== "SUSPENDED" ? (
                          <DropdownMenuItem
                            onClick={() => handleSuspendUser(user.id, true)}
                            className="text-red-600"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspendre
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleSuspendUser(user.id, false)}
                            className="text-green-600"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Lever la suspension
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Aucun utilisateur trouvé
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
