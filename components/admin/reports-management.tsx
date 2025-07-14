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
  Check,
  X,
  Ban,
  Flag,
  Clock,
  User,
  Package,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ReportsManagementProps {
  reports: any[];
}

export function ReportsManagement({ reports }: ReportsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const getReportTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      INAPPROPRIATE_CONTENT: "Contenu inapproprié",
      SPAM: "Spam",
      HARASSMENT: "Harcèlement",
      FAKE_LISTING: "Fausse annonce",
      SCAM: "Arnaque",
      COPYRIGHT: "Droits d'auteur",
      OTHER: "Autre",
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "REVIEWED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "RESOLVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "DISMISSED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "INAPPROPRIATE_CONTENT":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "SPAM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "HARASSMENT":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "FAKE_LISTING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "SCAM":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "COPYRIGHT":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success("Statut mis à jour");
        window.location.reload();
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    }
  };

  const handleDeleteContent = async (
    reportId: string,
    contentType: string,
    contentId: string,
  ) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) return;

    try {
      const response = await fetch(
        `/api/admin/content/${contentType}/${contentId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        // Marquer le signalement comme résolu
        await handleUpdateStatus(reportId, "RESOLVED");
        toast.success("Contenu supprimé");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getReportTypeLabel(report.type)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || report.status === statusFilter;
    const matchesType = typeFilter === "ALL" || report.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getContentInfo = (report: any) => {
    if (report.listing) {
      return {
        type: "Annonce",
        title: report.listing.title,
        author: report.listing.createdBy.name,
        link: `/listings/${report.listing.id}`,
        icon: Package,
      };
    }
    if (report.question) {
      return {
        type: "Question",
        title: report.question.title,
        author: report.question.author.name,
        link: `/forum/${report.question.id}`,
        icon: HelpCircle,
      };
    }
    if (report.answer) {
      return {
        type: "Réponse",
        title: `Réponse à: ${report.answer.question.title}`,
        author: report.answer.author.name,
        link: `/forum/${report.answer.question.id}`,
        icon: MessageSquare,
      };
    }
    return null;
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
            <h1 className="text-3xl font-bold text-red-600">
              Gestion des signalements
            </h1>
            <p className="text-muted-foreground">
              {filteredReports.length} signalements trouvés
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">
            {reports.filter((r) => r.status === "PENDING").length} en attente
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            {reports.filter((r) => r.status === "REVIEWED").length} en cours
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
                  placeholder="Rechercher dans les signalements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="REVIEWED">En cours</option>
                <option value="RESOLVED">Résolus</option>
                <option value="DISMISSED">Rejetés</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="ALL">Tous les types</option>
                <option value="INAPPROPRIATE_CONTENT">
                  Contenu inapproprié
                </option>
                <option value="SPAM">Spam</option>
                <option value="HARASSMENT">Harcèlement</option>
                <option value="FAKE_LISTING">Fausse annonce</option>
                <option value="SCAM">Arnaque</option>
                <option value="COPYRIGHT">Droits d'auteur</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des signalements */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const contentInfo = getContentInfo(report);
          const ContentIcon = contentInfo?.icon || Flag;

          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        {report.user.image ? (
                          <AvatarImage
                            src={report.user.image}
                            alt={report.user.name}
                          />
                        ) : (
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          Signalé par {report.user.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(report.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getTypeColor(report.type)}>
                        {getReportTypeLabel(report.type)}
                      </Badge>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>

                    {contentInfo && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <ContentIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {contentInfo.type} signalé
                          </span>
                        </div>
                        <h4 className="font-medium text-sm mb-1">
                          {contentInfo.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Par {contentInfo.author}
                        </p>
                      </div>
                    )}

                    {report.details && (
                      <div className="border-l-4 border-yellow-400 pl-3 mb-3">
                        <p className="text-sm text-muted-foreground italic">
                          "{report.details}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {contentInfo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(contentInfo.link, "_blank")}
                        className="w-full"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Voir le contenu
                      </Button>
                    )}

                    {report.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateStatus(report.id, "REVIEWED")
                          }
                          className="w-full"
                        >
                          Prendre en charge
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 w-full"
                          onClick={() => {
                            if (contentInfo) {
                              const contentType =
                                contentInfo.type.toLowerCase();
                              const contentId =
                                report.listingId ||
                                report.questionId ||
                                report.answerId;
                              handleDeleteContent(
                                report.id,
                                contentType,
                                contentId,
                              );
                            }
                          }}
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          Supprimer le contenu
                        </Button>
                      </>
                    )}

                    {report.status === "REVIEWED" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateStatus(report.id, "RESOLVED")
                          }
                          className="flex-1 text-green-600 hover:text-green-700"
                        >
                          <Check className="h-3 w-3" />
                          Résoudre
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateStatus(report.id, "DISMISSED")
                          }
                          className="flex-1 text-gray-600 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Flag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun signalement trouvé
            </h3>
            <p className="text-muted-foreground">
              {reports.length === 0
                ? "Aucun signalement n'a été soumis pour le moment."
                : "Aucun signalement ne correspond à vos critères de recherche."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
