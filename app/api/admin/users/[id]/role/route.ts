import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRoleCheck } from "@/lib/middleware/role-middleware";
import { z } from "zod";

const roleUpdateSchema = z.object({
  role: z.enum(["USER", "MODERATOR", "ADMIN"]),
});

async function updateUserRole(request: NextRequest, currentUser: any, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role } = roleUpdateSchema.parse(body);

    // Empêcher la modification de son propre rôle
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, role: true },
    });

    // Log de l'action admin
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: "UPDATE_USER_ROLE",
        details: `Changement du rôle de ${targetUser.name} (${id}) de ${targetUser.role} vers ${role}`,
        targetId: id,
        targetType: "USER",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Rôle mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export const PATCH = withRoleCheck("ADMIN", updateUserRole);
