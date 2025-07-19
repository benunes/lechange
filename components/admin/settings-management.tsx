"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSettings, updateSettings, type AppSettings } from "@/lib/hooks/use-settings";
import { useUserRole } from "@/lib/hooks/use-user-role";
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

export function SettingsManagement() {
  const { settings, isLoading, error, refreshSettings } = useSettings();
  const { isAdmin, isPending: userRolePending } = useUserRole();
  const [isPending, startTransition] = useTransition();
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
  const [newBannedWord, setNewBannedWord] = useState("");
  const [newFormat, setNewFormat] = useState("");

  // Initialiser les paramètres locaux quand les paramètres sont chargés
  if (settings && !localSettings) {
    setLocalSettings({ ...settings });
  }

  // Vérification des permissions
  if (userRolePending || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Accès non autorisé</h3>
          <p className="text-muted-foreground">
            Vous devez être administrateur pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Erreur</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshSettings} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!localSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const updateLocalSetting = (category: string, key: string, value: any) => {
    setLocalSettings((prev) => ({
      ...prev!,
      [category]: {
        ...prev![category as keyof AppSettings],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await updateSettings(localSettings);
        if (result.success) {
          toast.success("Paramètres sauvegardés avec succès");
          await refreshSettings();
        } else {
          toast.error(result.error || "Erreur lors de la sauvegarde des paramètres");
        }
      } catch (error) {
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  const addBannedWord = () => {
    if (newBannedWord.trim()) {
      const updatedWords = [...localSettings.moderation.bannedWords, newBannedWord.trim()];
      updateLocalSetting("moderation", "bannedWords", updatedWords);
      setNewBannedWord("");
    }
  };

  const removeBannedWord = (word: string) => {
    const updatedWords = localSettings.moderation.bannedWords.filter(w => w !== word);
    updateLocalSetting("moderation", "bannedWords", updatedWords);
  };

  const addFormat = () => {
    if (newFormat.trim() && !localSettings.upload.allowedFormats.includes(newFormat.trim())) {
      const updatedFormats = [...localSettings.upload.allowedFormats, newFormat.trim()];
      updateLocalSetting("upload", "allowedFormats", updatedFormats);
      setNewFormat("");
    }
  };

  const removeFormat = (format: string) => {
    const updatedFormats = localSettings.upload.allowedFormats.filter(f => f !== format);
    updateLocalSetting("upload", "allowedFormats", updatedFormats);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-muted-foreground">
            Gérez les paramètres globaux de l'application
          </p>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="min-w-[120px]">
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Modération
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="forum" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Forum
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Annonces
          </TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Paramètres généraux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">Nom de l'application</Label>
                  <Input
                    id="appName"
                    value={localSettings.general.appName}
                    onChange={(e) => updateLocalSetting("general", "appName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={localSettings.general.contactEmail}
                    onChange={(e) => updateLocalSetting("general", "contactEmail", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appDescription">Description</Label>
                <Textarea
                  id="appDescription"
                  value={localSettings.general.appDescription}
                  onChange={(e) => updateLocalSetting("general", "appDescription", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={localSettings.general.maintenanceMode}
                  onCheckedChange={(checked) => updateLocalSetting("general", "maintenanceMode", checked)}
                />
                <Label htmlFor="maintenanceMode">Mode maintenance</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Modération */}
        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paramètres de modération
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoModeration"
                    checked={localSettings.moderation.autoModeration}
                    onCheckedChange={(checked) => updateLocalSetting("moderation", "autoModeration", checked)}
                  />
                  <Label htmlFor="autoModeration">Modération automatique</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireApproval"
                    checked={localSettings.moderation.requireApprovalForNewUsers}
                    onCheckedChange={(checked) => updateLocalSetting("moderation", "requireApprovalForNewUsers", checked)}
                  />
                  <Label htmlFor="requireApproval">Approbation requise pour nouveaux utilisateurs</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxReports">Nombre max de signalements avant suspension</Label>
                <Input
                  id="maxReports"
                  type="number"
                  min="1"
                  value={localSettings.moderation.maxReportsBeforeSuspension}
                  onChange={(e) => updateLocalSetting("moderation", "maxReportsBeforeSuspension", parseInt(e.target.value) || 5)}
                />
              </div>
              <div className="space-y-2">
                <Label>Mots bannis</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Ajouter un mot banni"
                    value={newBannedWord}
                    onChange={(e) => setNewBannedWord(e.target.value)}
                  />
                  <Button onClick={addBannedWord} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localSettings.moderation.bannedWords.map((word, index) => (
                    <Badge key={index} variant="secondary">
                      {word}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() => removeBannedWord(word)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Paramètres de notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={localSettings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateLocalSetting("notifications", "emailNotifications", checked)}
                />
                <Label htmlFor="emailNotifications">Notifications par email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="pushNotifications"
                  checked={localSettings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateLocalSetting("notifications", "pushNotifications", checked)}
                />
                <Label htmlFor="pushNotifications">Notifications push</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="messageNotifications"
                  checked={localSettings.notifications.messageNotifications}
                  onCheckedChange={(checked) => updateLocalSetting("notifications", "messageNotifications", checked)}
                />
                <Label htmlFor="messageNotifications">Notifications de messages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="forumNotifications"
                  checked={localSettings.notifications.forumNotifications}
                  onCheckedChange={(checked) => updateLocalSetting("notifications", "forumNotifications", checked)}
                />
                <Label htmlFor="forumNotifications">Notifications du forum</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="marketingEmails"
                  checked={localSettings.notifications.marketingEmails}
                  onCheckedChange={(checked) => updateLocalSetting("notifications", "marketingEmails", checked)}
                />
                <Label htmlFor="marketingEmails">Emails marketing</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="digestFrequency">Fréquence du digest</Label>
                <select
                  id="digestFrequency"
                  value={localSettings.notifications.digestFrequency}
                  onChange={(e) => updateLocalSetting("notifications", "digestFrequency", e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="never">Jamais</option>
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Upload */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Paramètres d'upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxImageSize">Taille max des images (MB)</Label>
                  <Input
                    id="maxImageSize"
                    type="number"
                    min="1"
                    value={localSettings.upload.maxImageSize}
                    onChange={(e) => updateLocalSetting("upload", "maxImageSize", parseInt(e.target.value) || 5)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxImagesPerListing">Images max par annonce</Label>
                  <Input
                    id="maxImagesPerListing"
                    type="number"
                    min="1"
                    value={localSettings.upload.maxImagesPerListing}
                    onChange={(e) => updateLocalSetting("upload", "maxImagesPerListing", parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageQuality">Qualité d'image (compression %)</Label>
                <Input
                  id="imageQuality"
                  type="number"
                  min="10"
                  max="100"
                  value={localSettings.upload.imageQuality}
                  onChange={(e) => updateLocalSetting("upload", "imageQuality", parseInt(e.target.value) || 75)}
                />
              </div>
              <div className="space-y-2">
                <Label>Formats d'upload autorisés</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Ajouter un format"
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                  />
                  <Button onClick={addFormat} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localSettings.upload.allowedFormats.map((format, index) => (
                    <Badge key={index} variant="secondary">
                      .{format}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() => removeFormat(format)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Paramètres de sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Durée de session (heures)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    value={localSettings.security.sessionTimeout}
                    onChange={(e) => updateLocalSetting("security", "sessionTimeout", parseInt(e.target.value) || 24)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Tentatives de connexion max</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="1"
                    value={localSettings.security.maxLoginAttempts}
                    onChange={(e) => updateLocalSetting("security", "maxLoginAttempts", parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lockoutDuration">Durée de verrouillage (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  min="1"
                  value={localSettings.security.lockoutDuration}
                  onChange={(e) => updateLocalSetting("security", "lockoutDuration", parseInt(e.target.value) || 30)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireEmailVerification"
                  checked={localSettings.security.requireEmailVerification}
                  onCheckedChange={(checked) => updateLocalSetting("security", "requireEmailVerification", checked)}
                />
                <Label htmlFor="requireEmailVerification">Vérification email requise</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactorEnabled"
                  checked={localSettings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => updateLocalSetting("security", "twoFactorEnabled", checked)}
                />
                <Label htmlFor="twoFactorEnabled">Authentification à deux facteurs</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Forum */}
        <TabsContent value="forum">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Paramètres du forum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxQuestionsPerDay">Questions max par jour</Label>
                  <Input
                    id="maxQuestionsPerDay"
                    type="number"
                    min="1"
                    value={localSettings.forum.maxQuestionsPerDay}
                    onChange={(e) => updateLocalSetting("forum", "maxQuestionsPerDay", parseInt(e.target.value) || 5)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAnswersPerQuestion">Réponses max par question</Label>
                  <Input
                    id="maxAnswersPerQuestion"
                    type="number"
                    min="1"
                    value={localSettings.forum.maxAnswersPerQuestion}
                    onChange={(e) => updateLocalSetting("forum", "maxAnswersPerQuestion", parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="pointsSystem"
                  checked={localSettings.forum.pointsSystem}
                  onCheckedChange={(checked) => updateLocalSetting("forum", "pointsSystem", checked)}
                />
                <Label htmlFor="pointsSystem">Système de points</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowAnonymousQuestions"
                  checked={localSettings.forum.allowAnonymousQuestions}
                  onCheckedChange={(checked) => updateLocalSetting("forum", "allowAnonymousQuestions", checked)}
                />
                <Label htmlFor="allowAnonymousQuestions">Questions anonymes</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Annonces */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Paramètres des annonces
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxListingsPerUser">Nombre max d'annonces par utilisateur</Label>
                  <Input
                    id="maxListingsPerUser"
                    type="number"
                    min="1"
                    value={localSettings.listings.maxListingsPerUser}
                    onChange={(e) => updateLocalSetting("listings", "maxListingsPerUser", parseInt(e.target.value) || 50)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoExpireDays">Expiration automatique (jours)</Label>
                  <Input
                    id="autoExpireDays"
                    type="number"
                    min="1"
                    value={localSettings.listings.autoExpireDays}
                    onChange={(e) => updateLocalSetting("listings", "autoExpireDays", parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="featuredListingPrice">Prix pour mettre en avant une annonce (€)</Label>
                <Input
                  id="featuredListingPrice"
                  type="number"
                  min="0"
                  step="0.50"
                  value={localSettings.listings.featuredListingPrice}
                  onChange={(e) => updateLocalSetting("listings", "featuredListingPrice", parseFloat(e.target.value) || 5)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireApproval"
                  checked={localSettings.listings.requireApproval}
                  onCheckedChange={(checked) => updateLocalSetting("listings", "requireApproval", checked)}
                />
                <Label htmlFor="requireApproval">Approbation manuelle requise</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowPriceNegotiation"
                  checked={localSettings.listings.allowPriceNegotiation}
                  onCheckedChange={(checked) => updateLocalSetting("listings", "allowPriceNegotiation", checked)}
                />
                <Label htmlFor="allowPriceNegotiation">Autoriser la négociation de prix</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
