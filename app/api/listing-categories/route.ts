import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.listingCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
      include: {
        subcategories: {
          where: {
            isActive: true,
          },
          orderBy: { order: "asc" },
        },
      },
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
