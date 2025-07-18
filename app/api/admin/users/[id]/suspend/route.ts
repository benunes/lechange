import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRoleCheck } from "@/lib/middleware/role-middleware";
import { z } from "zod";

const suspendSchema = z.object({
  suspend: z.boolean(),
});

async function toggleUserSuspension(request: NextRequest, currentUser: any, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { suspend } = suspendSchema.parse(body);

    // Empêcher la suspension de soi-même
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous suspendre vous-même" },
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

    // Empêcher la suspension d'autres admins
    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Impossible de suspendre un administrateur" },
        { status: 403 }
      );
    }

    // Mettre à jour le statut
    const newRole = suspend ? "SUSPENDED" : "USER";
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: { id: true, name: true, role: true },
    });

    // Log de l'action admin
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: suspend ? "SUSPEND_USER" : "UNSUSPEND_USER",
        details: `${suspend ? "Suspension" : "Levée de suspension"} de ${targetUser.name} (${id})`,
        targetId: id,
        targetType: "USER",
      },
    });

    return NextResponse.json({
      success: true,
      message: suspend ? "Utilisateur suspendu" : "Suspension levée",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la modification de suspension:", error);

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

export const PATCH = withRoleCheck("ADMIN", toggleUserSuspension);
