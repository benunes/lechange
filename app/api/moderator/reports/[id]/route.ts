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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { status } = await request.json();

    if (!["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    console.log(
      `Modérateur ${session.user.id} a changé le statut du signalement ${id} vers ${status}`,
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du signalement:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
