import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const categories = await prisma.listingCategory.findMany({
      orderBy: [
        { parentId:"asc"' },
        { order:"asc"' ,
      ],
      include: {
        subcategories: {
          orderBy: { order: "asc" }
        },
        _count: {
          select: {
            listings: true
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, icon, color, parentId } = data;

    // Générer le slug
    const slug = name.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Vérifier l'unicité du slug
    const existing = await prisma.listingCategory.findFirst({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Une catégorie avec ce nom existe déjà" },
        { status: 400 }
      );
    }

    // Obtenir l'ordre suivant
    const lastCategory = await prisma.listingCategory.findFirst({
      where: { parentId: parentId || null },
      orderBy: { order: "desc" }
    });

    const order = lastCategory ? lastCategory.order + 1 : 0;

    const category = await prisma.listingCategory.create({
      data: {
        name,
        description,
        icon,
        color,
        slug,
        parentId: parentId || null,
        order,
        createdById: session.user.id
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}
