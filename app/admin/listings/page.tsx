import { prisma } from "@/lib/db";
import { ListingsManagement } from "@/components/admin/listings-management";
import { RoleGuard } from "@/components/auth/role-guard";

export const dynamic = "force-dynamic";

async function getListingsData() {
  const [listings, stats] = await Promise.all([
    prisma.listing.findMany({
      include: {
        createdBy: {
          select: { name: true, email: true, image: true },
        },
        category: {
          select: { name: true, icon: true, color: true },
        },
        favorites: {
          select: { userId: true },
        },
        reports: {
          where: { status: "PENDING" },
          select: { id: true, type: true },
        },
        _count: {
          select: {
            favorites: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.listing.groupBy({
      by: ["categoryId"],
      _count: true,
    }),
  ]);

  return { listings, stats };
}

export default async function AdminListingsPage() {
  const { listings, stats } = await getListingsData();

  return (
    <RoleGuard requiredRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Annonces</h1>
            <p className="text-muted-foreground">
              Gérez toutes les annonces de la plateforme
            </p>
          </div>
        </div>

        <ListingsManagement listings={listings} stats={stats} />
      </div>
    </RoleGuard>
  );
}
