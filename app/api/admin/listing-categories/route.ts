import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.listingCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        subcategories: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            slug: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: [{ parentId: "asc" }, { order: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 },
    );
  }
}
