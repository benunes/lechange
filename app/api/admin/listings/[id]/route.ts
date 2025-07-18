import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRoleCheck } from "@/lib/middleware/role-middleware";
import { z } from "zod";

const deleteListingSchema = z.object({
  reason: z.string().min(1, "La raison est requise"),
});

async function deleteListing(
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = deleteListingSchema.parse(body);

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

    // Supprimer l'annonce et les données associées
    await prisma.$transaction([
      // Supprimer les favoris
      prisma.favorite.deleteMany({
        where: { listingId: id },
      }),
      // Supprimer les conversations et messages
      prisma.message.deleteMany({
        where: {
          conversation: {
            listingId: id,
          },
        },
      }),
      prisma.conversation.deleteMany({
        where: { listingId: id },
      }),
      // Supprimer les signalements
      prisma.report.deleteMany({
        where: { listingId: id },
      }),
      // Supprimer l'annonce
      prisma.listing.delete({
        where: { id },
      }),
      // Logger l'action
      prisma.adminLog.create({
        data: {
          adminId: currentUser.id,
          action: "DELETE_LISTING",
          details: `Suppression de l'annonce "${listing.title}" de ${listing.createdBy.name}. Raison: ${reason}`,
          targetType: "LISTING",
          targetId: id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'annonce" },
      { status: 500 }
    );
  }
}

export const DELETE = withRoleCheck(["ADMIN"], deleteListing);
