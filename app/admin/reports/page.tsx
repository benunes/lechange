import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReportsManagement } from "@/components/admin/reports-management";

async function checkModerationAccess() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!["ADMIN", "MODERATOR"].includes(user?.role || "")) {
    redirect("/");
  }

  return session;
}

async function getReports() {
  return await prisma.report.findMany({
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      listing: {
        select: {
          id: true,
          title: true,
          createdBy: { select: { name: true } },
        },
      },
      question: {
        select: { id: true, title: true, author: { select: { name: true } } },
      },
      answer: {
        select: {
          id: true,
          content: true,
          author: { select: { name: true } },
          question: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminReportsPage() {
  await checkModerationAccess();
  const reports = await getReports();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ReportsManagement reports={reports} />
    </div>
  );
}
