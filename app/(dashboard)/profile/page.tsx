import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProfileForm } from "@/components/profile/student-profile-form"

export default async function DashboardProfilePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Profile"
        text="Complete your profile to get personalized program recommendations"
      />
      <ProfileForm />
    </DashboardShell>
  )
}