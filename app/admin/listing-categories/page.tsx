import { prisma } from "@/lib/db";
import { RoleGuard } from "@/components/auth/role-guard";
import { ListingCategoriesManagement } from "@/components/admin/listing-categories-management";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

async function getListingCategories() {
  return prisma.listingCategory.findMany({
    orderBy: [{ parentId: "asc" }, { order: "asc" }],
    include: {
      subcategories: {
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { listings: true },
          },
        },
      },
      _count: {
        select: { listings: true ,
      },
    },
  });
}

export default async function AdminListingCategoriesPage() {
  const categories = await getListingCategories();

  return (
    <RoleGuard requiredRole="ADMIN">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Administration des Catégories d'Annonces
          </h1>
          <p className="text-muted-foreground mt-2">
            Créez et gérez les catégories et sous-catégories pour organiser les
            annonces
          </p>
        </div>

        <ListingCategoriesManagement categories={categories} />
      </div>
    </RoleGuard>
  );
}
