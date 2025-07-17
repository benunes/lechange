import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect("/login");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, icon, color, parentId } = data;

    const category = await prisma.listingCategory.update({
      where: { id },
      data: {
        name,
        description,
        icon,
        color,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur lors de la modification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    const { isActive } = data;

    const category = await prisma.listingCategory.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur lors de la modification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier s'il y a des annonces liées
    const listingsCount = await prisma.listing.count({
      where: { categoryId: id },
    });

    if (listingsCount > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer: ${listingsCount} annonce(s) utilisent cette catégorie`,
        },
        { status: 400 },
      );
    }

    // Supprimer les sous-catégories d'abord
    await prisma.listingCategory.deleteMany({
      where: { parentId: id },
    });

    // Supprimer la catégorie
    await prisma.listingCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }
}
