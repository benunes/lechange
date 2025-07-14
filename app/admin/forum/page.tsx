import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ForumModeration } from "@/components/admin/forum-moderation";

async function checkAdminAccess() {
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

async function getForumData() {
  const [questions, answers, reports] = await Promise.all([
    prisma.question.findMany({
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { answers: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.answer.findMany({
      include: {
        author: { select: { id: true, name: true, image: true } },
        question: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    // Simuler les signalements pour l'instant
    [],
  ]);

  return { questions, answers, reports };
}

export default async function AdminForumPage() {
  await checkAdminAccess();
  const data = await getForumData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ForumModeration {...data} />
    </div>
  );
}
