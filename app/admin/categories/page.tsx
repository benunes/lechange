import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAllCategoriesForAdmin } from "@/lib/actions/categories.actions";
import { CategoriesManagement } from "@/components/admin/categories-management";
import { RoleGuard } from "@/components/auth/role-guard";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

async function checkAdminAccess() {
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

export default async function AdminCategoriesPage() {
  try {
    await checkAdminAccess();
    const categories = await getAllCategoriesForAdmin();

    return (
      <RoleGuard requiredRoles={["ADMIN", "MODERATOR"]}>
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Administration des Catégories
            </h1>
            <p className="text-muted-foreground mt-2">
              Créez et gérez les catégories pour organiser les questions du
              forum
            </p>
          </div>

          <CategoriesManagement categories={categories} />
        </div>
      </RoleGuard>
    );
  } catch (error) {
    console.error("Erreur dans AdminCategoriesPage:", error);
    redirect("/admin");
  }
}
