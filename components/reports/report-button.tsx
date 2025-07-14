"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Flag,
  AlertTriangle,
  Shield,
  Zap,
  Ban,
  Copyright,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

interface ReportButtonProps {
  listingId?: string;
  questionId?: string;
  answerId?: string;
  className?: string;
}

const reportTypes = [
  {
    id: "INAPPROPRIATE_CONTENT",
    label: "Contenu inapproprié",
    description: "Contenu offensant, violent ou inadapté",
    icon: AlertTriangle,
    color: "text-red-500",
  },
  {
    id: "SPAM",
    label: "Spam / Publicité",
    description: "Contenu publicitaire non désiré ou répétitif",
    icon: Zap,
    color: "text-yellow-500",
  },
  {
    id: "HARASSMENT",
    label: "Harcèlement",
    description: "Comportement abusif ou intimidant",
    icon: Ban,
    color: "text-orange-500",
  },
  {
    id: "FAKE_LISTING",
    label: "Fausse annonce",
    description: "Annonce trompeuse ou frauduleuse",
    icon: Shield,
    color: "text-blue-500",
  },
  {
    id: "SCAM",
    label: "Arnaque",
    description: "Tentative d'escroquerie",
    icon: AlertTriangle,
    color: "text-red-600",
  },
  {
    id: "COPYRIGHT",
    label: "Violation de droits d'auteur",
    description: "Utilisation non autorisée de contenu protégé",
    icon: Copyright,
    color: "text-purple-500",
  },
  {
    id: "OTHER",
    label: "Autre",
    description: "Autre problème non listé ci-dessus",
    icon: MoreHorizontal,
    color: "text-gray-500",
  },
];

export function ReportButton({
  listingId,
  questionId,
  answerId,
  className,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error("Veuillez sélectionner un type de signalement");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          details: details.trim() || undefined,
          listingId,
          questionId,
          answerId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Signalement envoyé avec succès");
        setIsOpen(false);
        setSelectedType("");
        setDetails("");
      } else {
        toast.error(data.error || "Erreur lors de l'envoi du signalement");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 ${className}`}
        >
          <Flag className="h-4 w-4 mr-1" />
          Signaler
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Signaler ce contenu
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">
              Pourquoi souhaitez-vous signaler ce contenu ?
            </h3>

            <div className="grid gap-3">
              {reportTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedType === type.id
                        ? "ring-2 ring-red-500 bg-red-50 dark:bg-red-950/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <IconComponent
                          className={`h-5 w-5 mt-0.5 ${type.color}`}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{type.label}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {type.description}
                          </p>
                        </div>
                        {selectedType === type.id && (
                          <Badge className="bg-red-500 text-white">
                            Sélectionné
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">
              Détails supplémentaires (optionnel)
            </h3>
            <Textarea
              placeholder="Ajoutez des détails pour nous aider à comprendre le problème..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {details.length}/500 caractères
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Information importante
                </h4>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Les signalements abusifs ou répétés peuvent entraîner des
                  sanctions sur votre compte. Utilisez cette fonction uniquement
                  pour signaler du contenu qui viole nos règles.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedType || isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isSubmitting ? "Envoi..." : "Envoyer le signalement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
