import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProfileForm } from "@/components/profile/student-profile-form"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { studentProfiles, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function DashboardProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // First get the user's UUID from our database
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId)
  });

  if (!user) {
    return null;
  }
  
  // Fetch existing profile if it exists
  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, user.id)
  });

  console.log(profile);

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
