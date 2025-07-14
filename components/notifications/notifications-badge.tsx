"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function NotificationsBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);

    // Écouter l'événement personnalisé pour actualisation immédiate
    const handleNotificationsUpdate = () => {
      fetchUnreadCount();
    };

    window.addEventListener("notifications-updated", handleNotificationsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdate,
      );
    };
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="relative hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-300"
      >
        <Link href="/notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <Badge className="bg-transparent text-white text-xs font-bold min-w-0 h-auto p-0">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            </motion.div>
          )}
        </Link>
      </Button>
    </motion.div>
  );
}
