import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReportsManagement } from "@/components/moderator/reports-management";

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

async function getReports() {
  return await prisma.report.findMany({
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
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      question: {
        select: {
          id: true,
          title: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      answer: {
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export default async function ModeratorReportsPage() {
  await checkModeratorAccess();
  const reports = await getReports();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Gestion des signalements
        </h1>
        <p className="text-muted-foreground mt-2">
          Examinez et traitez les signalements de la communauté
        </p>
      </div>

      <ReportsManagement reports={reports} />
    </div>
  );
}
