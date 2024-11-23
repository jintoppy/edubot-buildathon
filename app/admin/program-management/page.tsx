'use client'

import React from 'react';
import { DashboardShell } from '@/components/dashboard/shell';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Upload, Search } from 'lucide-react';

interface Program {
  id: string;
  universityId: string;
  name: string;
  level: string;
  duration: string;
  tuitionFee: number;
  currency: string;
  country: string;
  eligibilityCriteria: any;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StatusBadgeProps {
  status: 'Active' | 'Inactive';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    Active: 'bg-green-50 text-green-700',
    Inactive: 'bg-red-50 text-red-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const ProgramsManagement: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs');
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        const data = await response.json();
        setPrograms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleAddProgram = async () => {
    // TODO: Implement add program form
    const newProgram = {
      // Add form data here
    };

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProgram),
      });

      if (!response.ok) {
        throw new Error('Failed to add program');
      }

      // Refresh programs list
      const updatedResponse = await fetch('/api/programs');
      const updatedData = await updatedResponse.json();
      setPrograms(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add program');
    }
  };

  const handleEditProgram = async (programId: string) => {
    // TODO: Implement edit program form
    const updatedProgram = {
      // Add form data here
    };

    try {
      const response = await fetch('/api/programs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: programId, ...updatedProgram }),
      });

      if (!response.ok) {
        throw new Error('Failed to update program');
      }

      // Refresh programs list
      const updatedResponse = await fetch('/api/programs');
      const updatedData = await updatedResponse.json();
      setPrograms(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update program');
    }
  };

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell>
                </TableRow>
              ) : programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{program.level}</TableCell>
                  <TableCell>
                    <StatusBadge status={program.isActive ? 'Active' : 'Inactive'} />
                  </TableCell>
                  <TableCell>{program.eligibilityCriteria ? JSON.stringify(program.eligibilityCriteria) : 'N/A'}</TableCell>
                  <TableCell>{new Date(program.updatedAt).toLocaleDateString()}</TableCell>
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
