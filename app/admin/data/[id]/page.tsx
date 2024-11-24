'use client';

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
import { type CustomData } from "@/types/data";
import { useEffect, useState } from "react";



const AdminDataPage = () => {
  
  const router = useRouter();

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-4">
        <DashboardHeader
          heading="View Custom Data"
          text="Data Details"
        />
        <Button onClick={() => router.push("/admin/data")}>
          Back
        </Button>
      </div>
      <div className="border rounded-md">
        Show data here
      </div>
    </DashboardShell>
  );
};

export default AdminDataPage;
