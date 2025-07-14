"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  CheckCheck,
  MessageCircle,
  Star,
  TrendingUp,
  User,
} from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/forum.actions";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: Date;
};

interface NotificationsPanelProps {
  notifications: Notification[];
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const [isPending, startTransition] = useTransition();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_ANSWER":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "BEST_ANSWER":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "QUESTION_FOLLOWED":
        return <Bell className="h-4 w-4 text-purple-500" />;
      case "MENTION":
        return <User className="h-4 w-4 text-green-500" />;
      case "UPVOTE":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const markAsRead = async (notificationId: string) => {
    startTransition(async () => {
      await markNotificationAsRead(notificationId);
      // Déclencher une actualisation du badge
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    });
  };

  const markAllAsRead = async () => {
    startTransition(async () => {
      await markAllNotificationsAsRead();
      // Déclencher une actualisation du badge
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    });
  };

  return (
    <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications ({notifications.filter((n) => !n.read).length})
          </CardTitle>
          {notifications.some((n) => !n.read) && (
            <Button
              onClick={markAllAsRead}
              disabled={isPending}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune notification pour le moment</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                notification.read
                  ? "bg-background/50 border-border/50"
                  : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <Badge className="bg-blue-500 text-white text-xs">
                        Nouveau
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                    <div className="flex gap-2">
                      {notification.data?.questionId && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() =>
                            !notification.read && markAsRead(notification.id)
                          }
                        >
                          <Link href={`/forum/${notification.data.questionId}`}>
                            Voir
                          </Link>
                        </Button>
                      )}
                      {!notification.read && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          disabled={isPending}
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
