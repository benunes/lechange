import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { ModeratorDashboard } from "@/components/moderator/moderator-dashboard";

// Vérifier si l'utilisateur est modérateur ou admin
async function checkModeratorAccess() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

// Récupérer les statistiques pour le dashboard modérateur
async function getModeratorStats() {
  const [
    pendingReports,
    todayReports,
    totalResolvedReports,
    suspendedUsers,
    flaggedListings,
    flaggedQuestions,
    recentReports,
    topReportedUsers,
  ] = await Promise.all([
    prisma.report.count({
      where: { status: "PENDING" },
    }),
    prisma.report.count({
      where: {
        status: "PENDING",
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.report.count({
      where: { status: "RESOLVED" },
    }),
    prisma.user.count({
      where: { role: "SUSPENDED" },
    }),
    prisma.listing.count({
      where: {
        reports: {
          some: {
            status: "PENDING",
          },
        },
      },
    }),
    prisma.question.count({
      where: {
        reports: {
          some: {
            status: "PENDING",
          },
        },
      },
    }),
    prisma.report.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
        question: {
          select: {
            id: true,
            title: true,
          },
        },
        answer: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        reports: {
          some: {
            status: "PENDING",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: {
            reports: {
              where: {
                status: "PENDING",
              },
            },
          },
        },
      },
      orderBy: {
        reports: {
          _count: "desc",
        },
      },
      take: 5,
    }),
  ]);

  return {
    pendingReports,
    todayReports,
    totalResolvedReports,
    suspendedUsers,
    flaggedListings,
    flaggedQuestions,
    recentReports,
    topReportedUsers,
  };
}

export default async function ModeratorPage() {
  await checkModeratorAccess();
  const stats = await getModeratorStats();

  return (
    <RoleGuard requiredRoles={["ADMIN", "MODERATOR"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tableau de bord Modérateur
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez les signalements et modérez le contenu de la communauté
            </p>
          </div>

          <ModeratorDashboard stats={stats} />
        </div>
      </div>
    </RoleGuard>
  );
}
