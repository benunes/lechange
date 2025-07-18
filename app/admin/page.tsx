import { prisma } from "@/lib/db";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { RoleGuard } from "@/components/auth/role-guard";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

// Récupérer les statistiques pour le dashboard
async function getAdminStats() {
  const [
    totalUsers,
    totalListings,
    totalQuestions,
    totalAnswers,
    pendingReports,
    recentUsers,
    recentListings,
    recentQuestions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.question.count(),
    prisma.answer.count(),
    prisma.report?.count() || 0, // Si la table report n'existe pas encore
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.listing.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        createdAt: true,
        createdBy: {
          select: { name: true },
        },
      },
    }),
    prisma.question.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        tags: true,
        createdAt: true,
        author: {
          select: { name: true },
        },
        _count: {
          select: { answers: true },
        },
      },
    }),
  ]);

  return {
    stats: {
      totalUsers,
      totalListings,
      totalQuestions,
      totalAnswers,
      pendingReports,
    },
    recent: {
      users: recentUsers.map((user) => ({
        id: user.id,
        name: user.name || "Utilisateur sans nom",
        email: user.email || "Email non défini",
        image: user.image || undefined,
        role: user.role as string,
        createdAt: user.createdAt,
      })),
      listings: recentListings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        category: listing.category.name, // Retourner seulement le nom de la catégorie
        price: listing.price || undefined,
        createdAt: listing.createdAt,
        createdBy: {
          name: listing.createdBy.name || "Utilisateur sans nom",
        },
      })),
      questions: recentQuestions.map((question) => ({
        id: question.id,
        title: question.title,
        tags: question.tags,
        createdAt: question.createdAt,
        author: {
          name: question.author.name || "Utilisateur sans nom",
        },
        _count: question._count,
      })),
    },
  };
}

export default async function AdminPage() {
  const data = await getAdminStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RoleGuard requiredRole="ADMIN">
        <AdminDashboard {...data} />
      </RoleGuard>
    </div>
  );
}
