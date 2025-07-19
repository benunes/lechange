import { prisma } from "@/lib/db";
import { ForumManagement } from "@/components/admin/forum-management";
import { RoleGuard } from "@/components/auth/role-guard";

export const dynamic = "force-dynamic";

async function getForumData() {
  const [questions, answers, categories, stats] = await Promise.all([
    prisma.question.findMany({
      include: {
        author: {
          select: { name: true, email: true, image: true },
        },
        category: {
          select: { name: true, icon: true, color: true },
        },
        answers: {
          select: { id: true, author: { select: { name: true } } },
        },
        followers: {
          select: { userId: true },
        },
        reports: {
          where: { status: "PENDING" },
          select: { id: true, type: true },
        },
        _count: {
          select: {
            answers: true,
            followers: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.answer.findMany({
      include: {
        author: {
          select: { name: true, email: true, image: true },
        },
        question: {
          select: { title: true, author: { select: { name: true } } },
        },
        votes: {
          select: { isUpvote: true },
        },
        reports: {
          where: { status: "PENDING" },
          select: { id: true, type: true },
        },
        _count: {
          select: {
            votes: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.question.groupBy({
      by: ["categoryId"],
      _count: true,
    }),
  ]);

  return { questions, answers, categories, stats };
}

export default async function AdminForumPage() {
  const { questions, answers, categories, stats } = await getForumData();

  return (
    <RoleGuard requiredRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion du Forum</h1>
            <p className="text-muted-foreground">
              Gérez les questions, réponses et catégories du forum
            </p>
          </div>
        </div>

        <ForumManagement
          questions={questions}
          answers={answers}
          categories={categories}
          stats={stats}
        />
      </div>
    </RoleGuard>
  );
}
