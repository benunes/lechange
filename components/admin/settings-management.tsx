"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertCircle,
  Bell,
  Globe,
  Lock,
  MessageSquare,
  Package,
  Plus,
  Save,
  Settings,
  Shield,
  Upload,
  X,
} from "lucide-react";

interface SettingsProps {
  settings: {
    general: {
      appName: string;
      appDescription: string;
      appLogo: string;
      contactEmail: string;
      maintenanceMode: boolean;
    };
    moderation: {
      autoModeration: boolean;
      bannedWords: string[];
      maxReportsBeforeSuspension: number;
      requireApprovalForNewUsers: boolean;
    };
    notifications: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      dailyDigest: boolean;
      weeklyReport: boolean;
    };
    upload: {
      maxImageSize: number;
      allowedFormats: string[];
      maxImagesPerListing: number;
      imageQuality: number;
    };
    security: {
      sessionDuration: number;
      maxLoginAttempts: number;
      requireEmailVerification: boolean;
      twoFactorAuth: boolean;
    };
    forum: {
      maxQuestionsPerDay: number;
      maxAnswersPerQuestion: number;
      pointsSystem: boolean;
      allowAnonymousQuestions: boolean;
    };
    listings: {
      listingDuration: number;
      maxPrice: number;
      requireApproval: boolean;
      autoDeleteExpired: boolean;
    };
  };
}

export function SettingsManagement({
  settings: initialSettings,
}: SettingsProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [newBannedWord, setNewBannedWord] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      toast.success(result.message || "Paramètres sauvegardés avec succès!");
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la sauvegarde des paramètres");
    } finally {
      setIsLoading(false);
    }
  };

  const addBannedWord = () => {
    if (
      newBannedWord.trim() &&
      !settings.moderation.bannedWords.includes(newBannedWord.trim())
    ) {
      setSettings((prev) => ({
        ...prev,
        moderation: {
          ...prev.moderation,
          bannedWords: [...prev.moderation.bannedWords, newBannedWord.trim()],
        },
      }));
      setNewBannedWord("");
    }
  };

  const removeBannedWord = (word: string) => {
    setSettings((prev) => ({
      ...prev,
      moderation: {
        ...prev.moderation,
        bannedWords: prev.moderation.bannedWords.filter((w) => w !== word),
      },
    }));
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const SettingCard = ({
    icon: Icon,
    title,
    description,
    children,
    className = "",
  }: {
    icon: any;
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <Card
      className={`hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {description}
              </p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );

  const SettingRow = ({
    label,
    description,
    children,
    alert,
  }: {
    label: string;
    description?: string;
    children: React.ReactNode;
    alert?: boolean;
  }) => (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border ${alert ? "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20" : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20"} transition-colors`}
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{label}</Label>
          {alert && <AlertCircle className="h-4 w-4 text-orange-500" />}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );

  const tabs = [
    { id: "general", label: "Général", icon: Globe },
    { id: "moderation", label: "Modération", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "security", label: "Sécurité", icon: Lock },
    { id: "forum", label: "Forum", icon: MessageSquare },
    { id: "listings", label: "Annonces", icon: Package },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header moderne - version corrigée */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Configuration
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez tous les paramètres de votre plateforme
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 lg:ml-8">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              size="lg"
              className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Sauvegarde en cours...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-3" />
                  Sauvegarder les paramètres
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        {/* Navigation moderne */}
        <div className="overflow-x-auto">
          <TabsList className="flex w-full h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl gap-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-2 p-3 h-auto data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 rounded-lg transition-all min-w-0 flex-1"
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Contenu des onglets */}
        <div className="min-h-[600px]">
          {/* Paramètres généraux */}
          <TabsContent value="general" className="space-y-6">
            <SettingCard
              icon={Globe}
              title="Informations générales"
              description="Configurez les informations de base de votre application"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="appName">Nom de l'application</Label>
                  <Input
                    id="appName"
                    value={settings.general.appName}
                    onChange={(e) =>
                      updateSetting("general", "appName", e.target.value)
                    }
                    className="transition-all focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) =>
                      updateSetting("general", "contactEmail", e.target.value)
                    }
                    className="transition-all focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appDescription">
                  Description de l'application
                </Label>
                <Textarea
                  id="appDescription"
                  value={settings.general.appDescription}
                  onChange={(e) =>
                    updateSetting("general", "appDescription", e.target.value)
                  }
                  rows={3}
                  className="transition-all focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <SettingRow
                label="Mode maintenance"
                description="Désactiver temporairement l'accès à l'application"
                alert={settings.general.maintenanceMode}
              >
                <Switch
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) =>
                    updateSetting("general", "maintenanceMode", checked)
                  }
                />
              </SettingRow>
            </SettingCard>
          </TabsContent>

          {/* Modération */}
          <TabsContent value="moderation" className="space-y-6">
            <SettingCard
              icon={Shield}
              title="Paramètres de modération"
              description="Configurez les outils de modération automatique et manuelle"
            >
              <SettingRow
                label="Auto-modération"
                description="Détecter automatiquement le contenu inapproprié"
              >
                <Switch
                  checked={settings.moderation.autoModeration}
                  onCheckedChange={(checked) =>
                    updateSetting("moderation", "autoModeration", checked)
                  }
                />
              </SettingRow>

              <SettingRow
                label="Approbation des nouveaux utilisateurs"
                description="Requiert une validation manuelle pour les nouveaux comptes"
              >
                <Switch
                  checked={settings.moderation.requireApprovalForNewUsers}
                  onCheckedChange={(checked) =>
                    updateSetting(
                      "moderation",
                      "requireApprovalForNewUsers",
                      checked,
                    )
                  }
                />
              </SettingRow>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre de signalements avant suspension</Label>
                  <Input
                    type="number"
                    value={settings.moderation.maxReportsBeforeSuspension}
                    onChange={(e) =>
                      updateSetting(
                        "moderation",
                        "maxReportsBeforeSuspension",
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="20"
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Mots interdits</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter un mot interdit"
                      value={newBannedWord}
                      onChange={(e) => setNewBannedWord(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addBannedWord()}
                      className="flex-1"
                    />
                    <Button onClick={addBannedWord} size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.moderation.bannedWords.map((word) => (
                      <Badge
                        key={word}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {word}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                          onClick={() => removeBannedWord(word)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </SettingCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <SettingCard
              icon={Bell}
              title="Paramètres de notification"
              description="Configurez les différents types de notifications"
            >
              <SettingRow
                label="Notifications par email"
                description="Envoyer des notifications par email"
              >
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting(
                      "notifications",
                      "emailNotifications",
                      checked,
                    )
                  }
                />
              </SettingRow>

              <SettingRow
                label="Notifications push"
                description="Envoyer des notifications push dans le navigateur"
              >
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting("notifications", "pushNotifications", checked)
                  }
                />
              </SettingRow>

              <SettingRow
                label="Digest quotidien"
                description="Résumé quotidien des activités"
              >
                <Switch
                  checked={settings.notifications.dailyDigest}
                  onCheckedChange={(checked) =>
                    updateSetting("notifications", "dailyDigest", checked)
                  }
                />
              </SettingRow>

              <SettingRow
                label="Rapport hebdomadaire"
                description="Rapport hebdomadaire pour les administrateurs"
              >
                <Switch
                  checked={settings.notifications.weeklyReport}
                  onCheckedChange={(checked) =>
                    updateSetting("notifications", "weeklyReport", checked)
                  }
                />
              </SettingRow>
            </SettingCard>
          </TabsContent>

          {/* Upload */}
          <TabsContent value="upload" className="space-y-6">
            <SettingCard
              icon={Upload}
              title="Paramètres d'upload"
              description="Configurez les limites et formats d'upload"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Taille maximale des images (MB)</Label>
                  <Input
                    type="number"
                    value={settings.upload.maxImageSize}
                    onChange={(e) =>
                      updateSetting(
                        "upload",
                        "maxImageSize",
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre max d'images par annonce</Label>
                  <Input
                    type="number"
                    value={settings.upload.maxImagesPerListing}
                    onChange={(e) =>
                      updateSetting(
                        "upload",
                        "maxImagesPerListing",
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Qualité d'image (compression %)</Label>
                <Input
                  type="number"
                  value={settings.upload.imageQuality}
                  onChange={(e) =>
                    updateSetting(
                      "upload",
                      "imageQuality",
                      parseInt(e.target.value),
                    )
                  }
                  min="10"
                  max="100"
                  className="max-w-xs"
                />
              </div>

              <div className="space-y-2">
                <Label>Formats autorisés</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.upload.allowedFormats.map((format) => (
                    <Badge key={format} variant="outline" className="px-3 py-1">
                      .{format}
                    </Badge>
                  ))}
                </div>
              </div>
            </SettingCard>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <SettingCard
              icon={Lock}
              title="Paramètres de sécurité"
              description="Configurez les paramètres de sécurité et d'authentification"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Durée de session (jours)</Label>
                  <Input
                    type="number"
                    value={settings.security.sessionDuration}
                    onChange={(e) =>
                      updateSetting(
                        "security",
                        "sessionDuration",
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="365"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tentatives de connexion max</Label>
                  <Input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) =>
                      updateSetting(
                        "security",
                        "maxLoginAttempts",
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <SettingRow
                label="Vérification email obligatoire"
                description="Requiert une vérification d'email pour s'inscrire"
              >
                <Switch
                  checked={settings.security.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    updateSetting(
                      "security",
                      "requireEmailVerification",
                      checked,
                    )
                  }
                />
              </SettingRow>

              <SettingRow
                label="Authentification à deux facteurs"
                description="Activer la 2FA pour les comptes administrateurs"
              >
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    updateSetting("security", "twoFactorAuth", checked)
                  }
                />
              </SettingRow>
            </SettingCard>
          </TabsContent>

          {/* Forum */}
          <TabsContent value="forum" className="space-y-6">
            <SettingCard
              icon={MessageSquare}
              title="Paramètres du forum"
              description="Configurez les limites et fonctionnalités du forum"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Questions max par jour</Label>
                  <Input
                    type="number"
                    value={settings.forum.maxQuestionsPerDay}
                    onChange={(e) =>
                      updateSetting(
                        "forum",
                        "maxQuestionsPerDay",
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Réponses max par question</Label>
                  <Input
                    type="number"
                    value={settings.forum.maxAnswersPerQuestion}
                    onChange={(e) =>
                      updateSetting(
                        "forum",
                        "maxAnswersPerQuestion",
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="200"
                  />
                </div>
              </div>

              <SettingRow
                label="Système de points"
                description="Activer le système de points pour les contributions"
              >
                <Switch
                  checked={settings.forum.pointsSystem}
                  onCheckedChange={(checked) =>
                    updateSetting("forum", "pointsSystem", checked)
                  }
                />
              </SettingRow>

              <SettingRow
                label="Questions anonymes"
                description="Permettre aux utilisateurs de poser des questions anonymement"
              >
                <Switch
                  checked={settings.forum.allowAnonymousQuestions}
                  onCheckedChange={(checked) =>
                    updateSetting("forum", "allowAnonymousQuestions", checked)
                  }
                />
              </SettingRow>
            </SettingCard>
          </TabsContent>

          {/* Annonces */}
          <TabsContent value="listings" className="space-y-6">
            <SettingCard
              icon={Package}
              title="Paramètres des annonces"
              description="Configurez les limites et règles des annonces"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Durée de vie des annonces (jours)</Label>
                  <Input
                    type="number"
                    value={settings.listings.listingDuration}
                    onChange={(e) =>
                      updateSetting(
                        "listings",
                        "listingDuration",
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="365"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prix maximum (€)</Label>
                  <Input
                    type="number"
                    value={settings.listings.maxPrice}
                    onChange={(e) =>
                      updateSetting(
                        "listings",
                        "maxPrice",
                        parseInt(e.target.value),
                      )
                    }
                    min="1"
                    max="100000"
                  />
                </div>
              </div>

              <SettingRow
                label="Approbation manuelle"
                description="Requiert une validation manuelle pour les nouvelles annonces"
              >
                <Switch
                  checked={settings.listings.requireApproval}
                  onCheckedChange={(checked) =>
                    updateSetting("listings", "requireApproval", checked)
                  }
                />
              </SettingRow>

              <SettingRow
                label="Suppression automatique"
                description="Supprimer automatiquement les annonces expirées"
              >
                <Switch
                  checked={settings.listings.autoDeleteExpired}
                  onCheckedChange={(checked) =>
                    updateSetting("listings", "autoDeleteExpired", checked)
                  }
                />
              </SettingRow>
            </SettingCard>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
