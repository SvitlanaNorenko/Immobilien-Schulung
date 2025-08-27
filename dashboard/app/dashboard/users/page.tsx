import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserAnalytics } from "@/components/user-analytics"

export default function UsersPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <UserAnalytics />
      </DashboardLayout>
    </AuthGuard>
  )
}
