import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";
import { getUserNotifications } from "@/lib/actions/forum.actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const notifications = await getUserNotifications();

  return (
    <div className="min-h-screen py-8">
      <NotificationsPageClient />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mes Notifications</h1>
        <NotificationsPanel notifications={notifications} />
      </div>
    </div>
  );
}
