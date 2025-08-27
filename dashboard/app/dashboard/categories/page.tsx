import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CategoryManagement } from "@/components/category-management"

export default function CategoriesPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <CategoryManagement />
      </DashboardLayout>
    </AuthGuard>
  )
}
