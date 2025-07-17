import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { ListingCategoriesManagement } from "@/components/admin/listing-categories-management";

export default async function AdminListingCategoriesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const categories = await prisma.listingCategory.findMany({
    orderBy: [{ parentId: "asc" }, { order: "asc" }],
    include: {
      subcategories: {
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: {
              listings: true,
            },
          },
        },
      },
      _count: {
        select: {
          listings: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Catégories d'Annonces
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez les catégories et sous-catégories pour les annonces
          </p>
        </div>

        <ListingCategoriesManagement categories={categories} />
      </div>
    </div>
  );
}
