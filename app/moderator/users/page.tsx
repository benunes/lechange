import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UsersManagement } from "@/components/moderator/users-management";

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

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          listings: true,
          questions: true,
          answers: true,
          reports: {
            where: {
              status: "PENDING",
            },
          },
        },
      },
    },
  });
}

export default async function ModeratorUsersPage() {
  await checkModeratorAccess();
  const users = await getUsers();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Gestion des utilisateurs
        </h1>
        <p className="text-muted-foreground mt-2">
          Modérez et gérez les comptes utilisateurs
        </p>
      </div>

      <UsersManagement users={users} />
    </div>
  );
}
