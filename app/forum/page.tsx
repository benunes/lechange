import { prisma } from "@/lib/db";
import ForumClientPage from "./forum-client";
import { getCategories } from "@/lib/actions/categories.actions";

async function getQuestions(categoryId?: string) {
  const whereClause = categoryId ? { categoryId } : {};

  return prisma.question.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          // Inclure les stats pour les badges
          _count: {
            select: {
              questions: true,
              answers: true,
            },
          },
          answers: {
            select: {
              upvotes: true,
            },
          },
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          slug: true,
        },
      },
      _count: {
        select: {
          answers: true,
        },
      },
    },
  });
}

async function getForumStats() {
  const [questionsCount, answersCount] = await Promise.all([
    prisma.question.count(),
    prisma.answer.count(), // Correction: aswer -> answer
  ]);
  return { questionsCount, answersCount };
}

interface ForumPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const params = await searchParams;
  const selectedCategorySlug = params.category;

  const [categories, stats] = await Promise.all([
    getCategories(),
    getForumStats(),
  ]);

  // Trouver la catégorie sélectionnée par son slug
  const selectedCategory = selectedCategorySlug
    ? categories.find((cat) => cat.slug === selectedCategorySlug)
    : null;

  // Charger les questions seulement si une catégorie est sélectionnée
  const questions = selectedCategory
    ? await getQuestions(selectedCategory.id)
    : [];

  return (
    <ForumClientPage
      initialQuestions={questions}
      initialStats={stats}
      categories={categories}
      selectedCategory={selectedCategory}
      showCategorySelection={!selectedCategory}
    />
  );
}
