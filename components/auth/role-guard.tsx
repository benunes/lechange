"use client";

import { ReactNode } from "react";
import { UserRole, useUserRole } from "@/lib/hooks/use-user-role";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RoleGuard({
  children,
  requiredRole,
  requiredRoles,
  fallback,
  redirectTo = "/",
}: RoleGuardProps) {
  const { userData, isPending, error, hasRole, hasAnyRole } = useUserRole();

  // Loading state
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-muted-foreground">
            Vérification des permissions...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Erreur d'authentification
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Not authenticated
  if (!userData) {
    return (
      fallback || (
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connexion requise</h3>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder à cette page.
            </p>
            <Button asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      )
    );
  }

  // Check role permissions
  const hasPermission = requiredRole
    ? hasRole(requiredRole)
    : requiredRoles
      ? hasAnyRole(requiredRoles)
      : true;

  if (!hasPermission) {
    return (
      fallback || (
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès non autorisé</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>
            <Button asChild variant="outline">
              <Link href={redirectTo}>Retour</Link>
            </Button>
          </CardContent>
        </Card>
      )
    );
  }

  return <>{children}</>;
}
