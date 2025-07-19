import { SettingsManagement } from "@/components/admin/settings-management";
import { RoleGuard } from "@/components/auth/role-guard";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  return (
    <RoleGuard requiredRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SettingsManagement />
      </div>
    </RoleGuard>
  );
}
