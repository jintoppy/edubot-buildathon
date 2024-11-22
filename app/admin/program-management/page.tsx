'use client'

import React from 'react';
import { DashboardShell } from '@/components/dashboard/shell';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Upload, Search } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  university: string;
  status: 'Active' | 'Inactive' | 'Draft';
  eligibility: string;
  lastUpdated: string;
}

interface StatusBadgeProps {
  status: Program['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    Active: 'bg-green-50 text-green-700',
    Inactive: 'bg-red-50 text-red-700',
    Draft: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const ProgramsManagement: React.FC = () => {
  const programs: Program[] = [
    {
      id: 1,
      name: 'MS in Computer Science',
      university: 'Tech University',
      status: 'Active',
      eligibility: 'Bachelor\'s in CS/IT, GPA 3.0',
      lastUpdated: '2024-03-15',
    },
    {
      id: 2,
      name: 'MBA',
      university: 'Business School',
      status: 'Active',
      eligibility: 'Bachelor\'s degree, 2 years experience',
      lastUpdated: '2024-03-14',
    },
  ];

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    // Implement search functionality
    console.log(event.target.value);
  };

  const handleBulkUpload = (): void => {
    // Implement bulk upload functionality
  };

  const handleAddProgram = (): void => {
    // Implement add program functionality
  };

  const handleEditProgram = (programId: number): void => {
    // Implement edit program functionality
    console.log('Editing program:', programId);
  };

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Program Management" 
        text="Manage your educational programs and eligibility criteria"
      >
        <div className="flex space-x-2">
          <Button onClick={handleBulkUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={handleAddProgram}>
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        </div>
      </DashboardHeader>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search programs..." 
              className="pl-8" 
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{program.university}</TableCell>
                  <TableCell>
                    <StatusBadge status={program.status} />
                  </TableCell>
                  <TableCell>{program.eligibility}</TableCell>
                  <TableCell>{program.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditProgram(program.id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ProgramsManagement;