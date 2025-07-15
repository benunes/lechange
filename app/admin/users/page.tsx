import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UsersManagement } from "@/components/admin/users-management";

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

async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          questions: true,
          answers: true,
          listings: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transformer les données pour convertir null en valeurs par défaut
  return users.map((user) => ({
    id: user.id,
    name: user.name || "Utilisateur sans nom",
    email: user.email || "Email non défini",
    image: user.image || undefined,
    role: user.role as string,
    createdAt: user.createdAt,
    _count: user._count,
  }));
}

export default async function AdminUsersPage() {
  await checkAdminAccess();
  const users = await getUsers();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UsersManagement users={users} />
    </div>
  );
}
