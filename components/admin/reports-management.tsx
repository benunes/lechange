"use client";

import { useState } from "react";
import { useUserRole } from "@/lib/hooks/use-user-role";
import { toast } from "sonner";
import { MessageSquare, Package } from "lucide-react";

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
  } | null;
  question?: {
    id: string;
    title: string;
  } | null;
  answer?: {
    id: string;
    content: string;
    question: {
      id: string;
      title: string;
    };
  } | null;
}

interface ReportsManagementProps {
  reports: Report[];
  stats: {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    todayReports: number;
  };
}

export function ReportsManagement({ reports, stats }: ReportsManagementProps) {
  const { isModerator, isAdmin } = useUserRole();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      statusFilter === "ALL" || report.status === statusFilter;
    const matchesType = typeFilter === "ALL" || report.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    if (!isModerator) {
      toast.error(
        "Vous n'avez pas les permissions pour modifier les signalements"
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/moderator/reports/${reportI"PATCH"        method: "PATC"Content-Type"ad"application/json"pe": "application/json"},
        body: JSON.stringify{ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Statut mis à jour avec succès");
        window.location.reload();
      } else {
        toast.error("Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SPAM":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "INAPPROPRIATE":
        return <Flag className="h-4 w-4 text-orange-500" />;
      case "HARASSMENT":
        return <Shield className="h-4 w-4 text-red-600" />;
      case "FAKE":
        return <X className="h-4 w-4 text-yellow-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "RESOLVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "DISMISSED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  const getContentLink = (report: Report) => {
    if (report.listing) {
      return (
        <Link
          href={` / listings / $
      {
        report.listing.id;
      }
      `}
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <Package className="h-3 w-3" />
          {report.listing.title}
        </Link>
      );
    }
    if (report.question) {
      return (
        <Link
          href={` / forum / $
      {
        report.question.id;
      }
      `}
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <MessageSquare className="h-3 w-3" />
          {report.question.title}
        </Link>
      );
    }
    if (report.answer) {
      return (
        <Link
          href={` / forum / $
      {
        report.answer.question.id;
      }
      `}
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <MessageSquare className="h-3 w-3" />
          Réponse à: {report.answer.question.title}
        </Link>
      );
    }
    return <span className="text-muted-foreground">Contenu supprimé</span>;
  };

  if (!isModerator) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Seuls les modérateurs et administrateurs peuvent gérer les
            signalements.
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
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingReports}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.resolvedReports}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.todayReports}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="RESOLVED">Résolus</SelectItem>
                <SelectItem value="DISMISSED">Rejetés</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les types</SelectItem>
                <SelectItem value="SPAM">Spam</SelectItem>
                <SelectItem value="INAPPROPRIATE">
                  Contenu inapproprié
                </SelectItem>
                <SelectItem value="HARASSMENT">Harcèlement</SelectItem>
                <SelectItem value="FAKE">Faux contenu</SelectItem>
                <SelectItem value="OTHER">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Signalements ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(report.type)}
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {report.user.image ? (
                        <AvatarImage
                          src={report.user.image}
                          alt={report.user.name || ""}
                        />
                      ) : (
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        Signalé par {report.user.name || "Utilisateur anonyme"}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        {getContentLink(report)}
                      </div>
                    </div>
                  </div>

                  {report.details && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <p className="text-sm">{report.details}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {report.status === "PENDING" && (
                    <>
                      <Select
                        value={report.status}
                        onValueChange={(newStatus) =>
                          handleStatusChange(report.id, newStatus)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">En attente</SelectItem>
                          <SelectItem value="RESOLVED">Résoudre</SelectItem>
                          <SelectItem value="DISMISSED">Rejeter</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  <Button variant="ghost" size="sm" asChild>
                    <Link href={` / admin / reports / $
      {
        report.id;
      }
      `}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Aucun signalement trouvé
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
