import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const moderator = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (moderator?.role !== "MODERATOR" && moderator?.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { role } = await request.json();

    if (!["USER", "MODERATOR", "SUSPENDED"].includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    // Un modérateur ne peut pas modifier un admin
    if (targetUser.role === "ADMIN" && moderator?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Permissions insuffisantes" },
        { status: 403 },
      );
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role,
        updatedAt: new Date(),
      },
    });

    console.log(
      `Modérateur ${session.user.id} a changé le rôle de l'utilisateur ${id} de ${targetUser.role} vers ${role}`,
    );

    return NextResponse.json({
      id: updatedUser.id,
      role: updatedUser.role,
      message: "Rôle mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
