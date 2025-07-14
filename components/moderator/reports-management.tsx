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
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Report {
  id: string;
  type: string;
  details: string | null;
  status: string;
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
    createdBy: {
      id: string;
      name: string | null;
    };
  } | null;
  question?: {
    id: string;
    title: string;
    author: {
      id: string;
      name: string | null;
    };
  } | null;
  answer?: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string | null;
    };
  } | null;
}

interface ReportsManagementProps {
  reports: Report[];
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

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  REVIEWED: "Examiné",
  RESOLVED: "Résolu",
  DISMISSED: "Rejeté",
};

const statusColors: Record<string, string> = {
  PENDING: "default",
  REVIEWED: "secondary",
  RESOLVED: "default",
  DISMISSED: "outline",
};

export function ReportsManagement({ reports }: ReportsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.question?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/moderator/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      toast.success("Statut mis à jour avec succès");
      // Recharger la page pour voir les changements
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsLoading(false);
    }
  };

  const getContentLink = (report: Report) => {
    if (report.listing) {
      return `/listings/${report.listing.id}`;
    }
    if (report.question) {
      return `/forum/${report.question.id}`;
    }
    if (report.answer) {
      return `/forum/${report.answer.id}`;
    }
    return null;
  };

  const getContentDescription = (report: Report) => {
    if (report.listing) {
      return `Annonce: ${report.listing.title}`;
    }
    if (report.question) {
      return `Question: ${report.question.title}`;
    }
    if (report.answer) {
      return `Réponse: ${report.answer.content.substring(0, 100)}...`;
    }
    return "Contenu général";
  };

  const getReportedUser = (report: Report) => {
    if (report.listing) {
      return report.listing.createdBy;
    }
    if (report.question) {
      return report.question.author;
    }
    if (report.answer) {
      return report.answer.author;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="REVIEWED">Examiné</SelectItem>
                <SelectItem value="RESOLVED">Résolu</SelectItem>
                <SelectItem value="DISMISSED">Rejeté</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(reportTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              {filteredReports.length} signalement
              {filteredReports.length > 1 ? "s" : ""} trouvé
              {filteredReports.length > 1 ? "s" : ""}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des signalements */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">
                Aucun signalement trouvé
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Essayez de modifier vos filtres de recherche."
                  : "Tous les signalements ont été traités."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => {
            const contentLink = getContentLink(report);
            const reportedUser = getReportedUser(report);

            return (
              <Card key={report.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Informations du signalement */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={reportTypeColors[report.type] as any}>
                          {reportTypeLabels[report.type]}
                        </Badge>
                        <Badge variant={statusColors[report.status] as any}>
                          {statusLabels[report.status]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(report.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>

                      {/* Utilisateur qui a signalé */}
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Signalé par :
                        </p>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={report.user.image || ""} />
                            <AvatarFallback>
                              {report.user.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {report.user.name || "Utilisateur anonyme"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {report.user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contenu signalé */}
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Contenu signalé :
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getContentDescription(report)}
                        </p>
                        {reportedUser && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Par :</span>
                            <span className="font-medium">
                              {reportedUser.name || "Utilisateur anonyme"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Détails du signalement */}
                      {report.details && (
                        <div>
                          <p className="text-sm font-medium mb-2">Détails :</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                            {report.details}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      {contentLink && (
                        <Link href={contentLink} target="_blank">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Voir le contenu
                          </Button>
                        </Link>
                      )}

                      {report.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              handleUpdateStatus(report.id, "REVIEWED")
                            }
                            disabled={isLoading}
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Marquer comme examiné
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              handleUpdateStatus(report.id, "RESOLVED")
                            }
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Résoudre
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(report.id, "DISMISSED")
                            }
                            disabled={isLoading}
                            className="w-full"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </>
                      )}

                      {report.status === "REVIEWED" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              handleUpdateStatus(report.id, "RESOLVED")
                            }
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Résoudre
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(report.id, "DISMISSED")
                            }
                            disabled={isLoading}
                            className="w-full"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </>
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
