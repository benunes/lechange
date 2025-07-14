import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin ou modérateur
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!["ADMIN", "MODERATOR"].includes(admin?.role || "")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Suspendre l'utilisateur (ajouter un champ suspended à la DB ou supprimer temporairement)
    await prisma.user.update({
      where: { id: params.id },
      data: {
        // Vous pouvez ajouter un champ suspended: true dans votre schéma Prisma
        // Ou désactiver le compte d'une autre manière
        role: "SUSPENDED", // Temporaire, idéalement avoir un champ suspended
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suspension:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
