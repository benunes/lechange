import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

// Vérifier si l'utilisateur est admin
async function checkAdminAccess() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

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
      users: recentUsers,
      listings: recentListings,
      questions: recentQuestions,
    },
  };
}

export default async function AdminPage() {
  await checkAdminAccess();
  const data = await getAdminStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminDashboard {...data} />
    </div>
  );
}
