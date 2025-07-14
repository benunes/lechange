import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLogsView } from "@/components/admin/admin-logs-view";

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

async function getAdminLogs() {
  const logs = await prisma.adminLog.findMany({
    include: {
      admin: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Limiter à 100 logs récents
  });

  return logs;
}

export default async function AdminLogsPage() {
  await checkAdminAccess();
  const logs = await getAdminLogs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminLogsView logs={logs} />
    </div>
  );
}
