import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type CustomData } from "./types";

async function getCustomData(): Promise<CustomData[]> {
  // TODO: Implement your API call here
  const response = await fetch("/api/custom-data");
  if (!response.ok) throw new Error("Failed to fetch custom data");
  return response.json();
}

const AdminDataPage = async () => {
  const data = await getCustomData();
  const router = useRouter();

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader
          heading="Custom Data"
          text="Manage your custom data entries"
        />
        <Button onClick={() => router.push("/admin/data/add")}>
          Add New Data
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{new Date(item.createdAt!).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(item.updatedAt!).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/data/${item.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  );
};

export default AdminDataPage;
