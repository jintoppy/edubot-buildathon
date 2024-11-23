import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";

const CounselorDashboardHomePage = () => {
  return (
    <DashboardShell>
      <DashboardHeader heading="Counselor Dashboard" text="Dashboard" />
      Hi Counselor
    </DashboardShell>
  );
};

export default CounselorDashboardHomePage