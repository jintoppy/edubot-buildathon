import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";

const AdminAddDataPage = () => {
  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader
          heading="Add Custom Data"
          text="Add the custom custom data"
        />
        {/* Button to Add data comes here */}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        Show the content editor form here
      </div>
    </DashboardShell>
  );
};

export default AdminAddDataPage;