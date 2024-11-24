import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";

const AdminDataPage = () => {
  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader
          heading="Custom Data"
          text="List of all custom data"
        />
        {/* Button to Add data comes here */}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        Display list here
      </div>
    </DashboardShell>
  );
};

export default AdminDataPage;