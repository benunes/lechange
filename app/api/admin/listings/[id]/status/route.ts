import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRoleCheck } from "@/lib/middleware/role-middleware";
import { z } from "zod";

const statusSchema = z.object({
  action: z.enum(["suspend", "activate"]),
  reason: z.string().optional(),
});

async function updateListingStatus(
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason } = statusSchema.parse(body);

    // Vérifier que l'annonce existe
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      );
    }

    // Pour l'instant, on va juste logger l'action
    // Dans une version future, on pourrait ajouter un champ "status" au modèle Listing
    await prisma.adminLog.create({
      data: {
        adminId: currentUser.id,
        action: action === "suspend" ? "SUSPEND_LISTING" : "ACTIVATE_LISTING",
        details: `${action === "suspend" ? "Suspension" : "Réactivation"} de l'annonce "${listing.title}" de ${listing.createdBy.name}${reason ? `. Raison: ${reason}` : ""}`,
        targetType: "LISTING",
        targetId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la modification du statut:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du statut" },
      { status: 500 }
    );
  }
}

export const PATCH = withRoleCheck(["ADMIN"], updateListingStatus);
