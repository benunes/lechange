import { prisma } from "@/lib/db";
import { RoleGuard } from "@/components/auth/role-guard";
import { UsersManagement } from "@/components/admin/users-management";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

async function getUsersData() {
  const [rawUsers, stats] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            listings: true,
            questions: true,
            answers: true,
            messages: true,
            reports: true,
          },
        },
      },
      take:0, // Pagination basique
    }),
    {
      totalUsers: await prisma.user.count(),
      adminCount: await prisma.user.count({ where: { role: "ADMIN" } }),
      moderatorCount: await prisma.user.count({ where: { role: "MODERATOR" } }),
      activeUsersThisMonth: await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), ),
         },
       },
      ),
   },
  ]);

  // Transformer les données pour correspondre à l'interface User
  const users = rawUsers.map((user) => ({
    id: user.id,
    name: user.name || "Utilisateur sans nom",
    email: user.email || "Email non défini",
    image: user.image || undefined,
    role: user.role,
    createdAt: user.createdAt,
    _count: user._count,
  }));

  return { users, stats };
}

export default async function AdminUsersPage() {
  const { users, stats } = await getUsersData();

  return (
    <RoleGuard requiredRole="ADMIN">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les comptes utilisateurs, les rôles et les permissions
          </p>
        </div>

        <UsersManagement users={users} stats={stats} />
      </div>
    </RoleGuard>
  );
}
