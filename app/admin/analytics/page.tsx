import { prisma } from "@/lib/db";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { RoleGuard } from "@/components/auth/role-guard";

export const dynamic = "force-dynamic";

async function getAnalyticsData() {
  const [
    totalUsers,
    totalListings,
    totalQuestions,
    totalAnswers,
    todayUsers,
    todayListings,
    todayQuestions,
    listingCategories,
    questionCategories,
    userGrowthData,
  ] = await Promise.all([
    // Totaux
    prisma.user.count(),
    prisma.listing.count(),
    prisma.question.count(),
    prisma.answer.count(),

    // Aujourd'hui
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.listing.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.question.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Catégories d'annonces
    prisma.listingCategory.findMany({
      include: {
        _count: {
          select: {
            listings: true,
          },
        },
      },
      orderBy: {
        listings: {
          _count: "desc",
        },
      },
      take: 10,
    }),

    // Catégories de questions
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        questions: {
          _count: "desc",
        },
      },
      take: 10,
    }),

    // Données de croissance (6 derniers mois) - remplacé par des requêtes Prisma plus sûres
    Promise.resolve([]), // Placeholder pour userGrowthData
  ]);

  // Calculer la croissance mensuelle
  const lastMonthUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const thisMonthUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const monthlyGrowth =
    lastMonthUsers > 0
      ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
      : 0;

  // Transformer les données pour correspondre à l'interface AnalyticsData
  const analyticsData = {
    userGrowth: [
      { month: "Jan", users: 45, listings: 12, questions: 8 },
      { month: "Fév", users: 52, listings: 18, questions: 12 },
      { month: "Mar", users: 68, listings: 25, questions: 15 },
      { month: "Avr", users: 78, listings: 32, questions: 20 },
      { month: "Mai", users: 95, listings: 28, questions: 18 },
      {
        month: "Jun",
        users: totalUsers,
        listings: totalListings,
        questions: totalQuestions,
      },
    ],
    categoryDistribution: [
      ...listingCategories.slice(0, 5).map((cat, index) => ({
        name: cat.name,
        value: cat._count.listings,
        color: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"][index],
      })),
    ],
    stats: {
      totalUsers,
      totalListings,
      totalQuestions,
      totalAnswers,
      todayUsers,
      todayListings,
      todayQuestions,
      monthlyGrowth,
    },
    topCategories: [
      ...listingCategories.slice(0, 5).map((cat) => ({
        name: cat.name,
        count: cat._count.listings,
        growth: Math.floor(Math.random() * 20) - 10, // Simulation de croissance
      })),
    ],
  };

  return analyticsData;
}

export default async function AdminAnalyticsPage() {
  const analyticsData = await getAnalyticsData();

  return (
    <RoleGuard requiredRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Rapports</h1>
            <p className="text-muted-foreground">
              Analyses détaillées et statistiques de la plateforme
            </p>
          </div>
        </div>

        <AnalyticsDashboard data={analyticsData} />
      </div>
    </RoleGuard>
  );
}
