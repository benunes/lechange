import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { ReportsManagement } from "@/components/admin/reports-management";

// Force dynamic rendering for this page

export const dynamic = "force-dynamic";

async function checkModeratorAccess() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN" && user?.role !== "MODERATOR") {
    redirect("/");
  }

  return session;
}

async function getReportsData() {
  const [reports, stats] = await Promise.all([
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
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
            question: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      take: 50,
    }),
    {
      totalReports: await prisma.report.count(),
      pendingReports: await prisma.report.count({
        where: { status: "PENDING" },
      }),
      resolvedReports: await prisma.report.count({
        where: { status: "RESOLVED" },
      }),
      todayReports: await prisma.report.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    },
  ]);

  return { reports, stats };
}

export default async function AdminReportsPage() {
  await checkModeratorAccess();
  const { reports, stats } = await getReportsData();

  return (
    <RoleGuard requiredRoles={["ADMIN", "MODERATOR"]}>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gestion des Signalements
          </h1>
          <p className="text-muted-foreground mt-2">
            Examinez et traitez les signalements de la communauté
          </p>
        </div>

        <ReportsManagement reports={reports} stats={stats} />
      </div>
    </RoleGuard>
  );
}
