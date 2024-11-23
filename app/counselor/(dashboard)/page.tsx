import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { AssignmentsTabs } from "@/components/counselor/assignments-tabs";

async function getOpenAssignments() {
  console.log('url', process.env.NEXT_PUBLIC_APP_URL);
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/assignments?status=open`);
  if (!response.ok) throw new Error('Failed to fetch open assignments');
  return response.json();
}

async function getCounselorAssignments() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/assignments/counselor`);
  if (!response.ok) throw new Error('Failed to fetch counselor assignments');
  return response.json();
}

export default async function CounselorDashboardHomePage() {

  try {
    const [openAssignments, myAssignments] = await Promise.all([
      getOpenAssignments(),
      getCounselorAssignments(),
    ]);

    return (
      <DashboardShell>
        <DashboardHeader 
          heading="Counselor Dashboard" 
          text="Manage your student assignments and view open requests"
        />
        <div className="mt-8">
          <AssignmentsTabs
            openAssignments={openAssignments}
            myAssignments={myAssignments}
          />
        </div>
      </DashboardShell>
    );
  } catch (error) {
    console.error("Error loading assignments:", error);
    return (
      <DashboardShell>
        <DashboardHeader 
          heading="Counselor Dashboard" 
          text="Error loading assignments"
        />
        <div className="mt-8">
          There was an error loading the assignments. Please try again later.
        </div>
      </DashboardShell>
    );
  }
}
