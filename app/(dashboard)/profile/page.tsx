import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProfileForm } from "@/components/profile/student-profile-form"
import { auth } from "@clerk/nextjs"
import { db } from "@/lib/db"
import { studentProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function DashboardProfilePage() {
  const { userId } = auth();
  
  // Fetch existing profile if it exists
  const profile = userId ? await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, userId)
  }) : null;

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Profile"
        text="Complete your profile to get personalized program recommendations"
      />
      <ProfileForm initialData={profile} />
    </DashboardShell>
  )
}
