"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export type UserRole = "USER" | "MODERATOR" | "ADMIN";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
}

export function useUserRole() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user?.id) {
        setUserData(null);
        setIsPending(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/me`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setError(null);
        } else {
          setUserData(null);
          setError("Erreur lors de la récupération des données utilisateur");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
        setUserData(null);
        setError("Erreur de connexion");
      } finally {
        setIsPending(false);
      }
    };

    if (!isSessionPending) {
      fetchUserRole();
    }
  }, [session?.user?.id, isSessionPending]);

  return {
    userData,
    userRole: userData?.role || null,
    isPending: isPending || isSessionPending,
    error,
    isAdmin: userData?.role === "ADMIN",
    isModerator: userData?.role === "MODERATOR" || userData?.role === "ADMIN",
    isUser: !!userData,
    hasRole: (role: UserRole) => userData?.role === role,
    hasAnyRole: (roles: UserRole[]) =>
      userData ? roles.includes(userData.role) : false,
    refresh: () => {
      if (session?.user?.id) {
        setIsPending(true);
        setError(null);
      }
    },
  };
}
