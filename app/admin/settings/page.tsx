import { prisma } from "@/lib/db";
import { SettingsManagement } from "@/components/admin/settings-management";
import { RoleGuard } from "@/components/auth/role-guard";

export const dynamic = "force-dynamic";

async function getSettings() {
  // Pour l'instant, on utilise des valeurs par défaut
  // Dans une version future, on pourrait les stocker en base
  return {
    general: {
      appName: "LeChange",
      appDescription: "Plateforme d'échange pour les jeunes",
      appLogo: "/logo.png",
      contactEmail: "contact@lechange.com",
      maintenanceMode: false,
    },
    moderation: {
      autoModeration: true,
      bannedWords: ["spam", "arnaque", "fake"],
      maxReportsBeforeSuspension: 5,
      requireApprovalForNewUsers: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      dailyDigest: true,
      weeklyReport: true,
    },
    upload: {
      maxImageSize: 5, // MB
      allowedFormats: ["jpg", "jpeg", "png", "webp"],
      maxImagesPerListing: 8,
      imageQuality: 80,
    },
    security: {
      sessionDuration: 30, // days
      maxLoginAttempts: 5,
      requireEmailVerification: true,
      twoFactorAuth: false,
    },
    forum: {
      maxQuestionsPerDay: 10,
      maxAnswersPerQuestion: 50,
      pointsSystem: true,
      allowAnonymousQuestions: false,
    },
    listings: {
      listingDuration: 90, // days
      maxPrice: 10000,
      requireApproval: false,
      autoDeleteExpired: true,
    },
  };
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <RoleGuard requiredRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SettingsManagement />
      </div>
    </RoleGuard>
  );
}
