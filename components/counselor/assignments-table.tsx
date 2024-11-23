import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

interface Assignment {
  id: string;
  createdAt: Date;
  status: string;
  userFullName: string;
  userEmail: string;
  programName?: string;
  programLevel?: string;
  chatSessionSummary: string | null;
  chatSessionStartTime: Date;
}

interface AssignmentsTableProps {
  assignments: Assignment[];
}

export function AssignmentsTable({ assignments }: AssignmentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>Program</TableHead>
          <TableHead>Date of Request</TableHead>
          <TableHead>Conversation Summary</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell>{assignment.userFullName}</TableCell>
            <TableCell>{assignment.programName || "N/A"}</TableCell>
            <TableCell>{formatDate(assignment.createdAt)}</TableCell>
            <TableCell>{assignment.chatSessionSummary || "No summary available"}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
