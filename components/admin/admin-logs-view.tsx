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
  Clock,
  User,
  Shield,
  Trash2,
  Ban,
  Edit,
  Eye,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface AdminLogsViewProps {
  logs: any[];
}

export function AdminLogsView({ logs }: AdminLogsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const getActionIcon = (action: string) => {
    switch (action) {
      case "DELETE_CONTENT":
        return Trash2;
      case "BAN_USER":
        return Ban;
      case "CHANGE_ROLE":
        return Shield;
      case "SUSPEND_USER":
        return Ban;
      case "VIEW_CONTENT":
        return Eye;
      case "EDIT_CONTENT":
        return Edit;
      default:
        return AlertTriangle;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "DELETE_CONTENT":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "BAN_USER":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "CHANGE_ROLE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "SUSPEND_USER":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "VIEW_CONTENT":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "EDIT_CONTENT":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      DELETE_CONTENT: "Suppression de contenu",
      BAN_USER: "Bannissement d'utilisateur",
      CHANGE_ROLE: "Changement de rôle",
      SUSPEND_USER: "Suspension d'utilisateur",
      VIEW_CONTENT: "Consultation de contenu",
      EDIT_CONTENT: "Modification de contenu",
    };
    return labels[action] || action;
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getActionLabel(log.action)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

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
            <h1 className="text-3xl font-bold">Logs d'administration</h1>
            <p className="text-muted-foreground">
              Historique des actions administratives ({filteredLogs.length}{" "}
              entrées)
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge className="bg-blue-100 text-blue-800">
            {logs.filter((l) => l.action === "DELETE_CONTENT").length}{" "}
            suppressions
          </Badge>
          <Badge className="bg-orange-100 text-orange-800">
            {
              logs.filter(
                (l) => l.action === "BAN_USER" || l.action === "SUSPEND_USER",
              ).length
            }{" "}
            sanctions
          </Badge>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="ALL">Toutes les actions</option>
                <option value="DELETE_CONTENT">Suppressions</option>
                <option value="BAN_USER">Bannissements</option>
                <option value="CHANGE_ROLE">Changements de rôle</option>
                <option value="SUSPEND_USER">Suspensions</option>
                <option value="VIEW_CONTENT">Consultations</option>
                <option value="EDIT_CONTENT">Modifications</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline des logs */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const ActionIcon = getActionIcon(log.action);

          return (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`p-2 rounded-full ${getActionColor(log.action)}`}
                    >
                      <ActionIcon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-8 w-8">
                        {log.admin.image ? (
                          <AvatarImage
                            src={log.admin.image}
                            alt={log.admin.name}
                          />
                        ) : (
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{log.admin.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <Badge className={getActionColor(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </div>

                    {log.details && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {log.details}
                      </p>
                    )}

                    {log.targetType && log.targetId && (
                      <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded p-2">
                        <strong>Cible:</strong> {log.targetType} (ID:{" "}
                        {log.targetId})
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-xs text-muted-foreground">
                    ID: {log.id.slice(-8)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Aucun log trouvé</h3>
            <p className="text-muted-foreground">
              {logs.length === 0
                ? "Aucune action administrative n'a été enregistrée pour le moment."
                : "Aucun log ne correspond à vos critères de recherche."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination si nécessaire */}
      {logs.length >= 100 && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Affichage des 100 entrées les plus récentes.
              <Button variant="link" className="p-0 ml-1">
                Voir plus
              </Button>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
