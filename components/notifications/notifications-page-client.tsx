"use client";
import { useEffect } from "react";

export function NotificationsPageClient() {
  useEffect(() => {
    // Déclencher l'actualisation du badge dès que la page se charge
    window.dispatchEvent(new CustomEvent("notifications-updated"));
  }, []);

  return null; // Ce composant n'affiche rien, il sert juste à déclencher l'événement
}
