import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { QuestionManagement } from "@/components/question-management"

export default function QuestionsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <QuestionManagement />
      </DashboardLayout>
    </AuthGuard>
  )
}
