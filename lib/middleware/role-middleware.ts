import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export type UserRole = "USER" | "MODERATOR" | "ADMIN";

export async function verifyRole(
  requiredRole: UserRole | UserRole[],
  request?: NextRequest,
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: request ? request.headers : await headers(),
    });

    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, name: true, email: true },
    });

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    const requiredRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!requiredRoles.includes(user.role as UserRole)) {
      return { success: false, error: "Permissions insuffisantes" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Erreur de vérification des rôles:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

export function withRoleCheck(
  requiredRole: UserRole | UserRole[],
  handler: (
    request: NextRequest,
    user: any,
    ...args: any[]
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: any[]) => {
    const roleCheck = await verifyRole(requiredRole, request);

    if (!roleCheck.success) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: roleCheck.error === "Non authentifié" ? 401 : 403 },
      );
    }

    return handler(request, roleCheck.user, ...args);
  };
}
