import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ count: 0 });
    }

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json({ count: 0 });
  }
}
