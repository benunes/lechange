import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ListingsClient } from "@/components/listings/listings-client";

async function getListings() {
  const listings = await prisma.listing.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          parent: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return listings;
}

async function getCategories() {
  const categories = await prisma.listingCategory.findMany({
    where: {
      isActve: true,
    },
    include: {
      parent: {
        select: {
          id: true,
          nme: true,
       },
      },
      _count: {
        select: {
          listigs: true,
       }
      },
    },
    orderBy: [
      { parentId: "asc" },
      { order: "asc" },
      { name "asc"},
    ],
  });
  return categories;
}

export default async function ListingsPage() {
  const [listings, categories] = await Promise.all([
    getListings(),
    getCategories()
  ]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 py-12 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Toutes les{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  annonces
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Découvre {listings.length} annonces de la communauté
              </p>
            </div>

            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 mt-4 md:mt-0"
            >
              <Link href="/listings/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Créer une annonce
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Client Component with filters */}
      <ListingsClient listings={listings} categories={categories} />
    </div>
  );
}
