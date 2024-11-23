'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { programFormSchema, ProgramFormValues } from "./program-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

interface Program {
  id: string;
  name: string;
  level: string;
  duration: string;
  tuitionFee: number;
  currency: string;
  country: string;
  description: string;
  eligibilityCriteria: any;
}

interface EditProgramModalProps {
  program: Program;
  onSubmit: (programId: string, programData: ProgramFormValues) => Promise<void>;
}

export function EditProgramModal({ program, onSubmit }: EditProgramModalProps) {
  const [open, setOpen] = React.useState(false)
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      name: program.name,
      level: program.level as "bachelors" | "masters" | "phd",
      duration: program.duration,
      tuitionFee: program.tuitionFee,
      currency: program.currency as "USD" | "EUR" | "GBP",
      country: program.country,
      description: program.description || '',
      eligibilityCriteria: program.eligibilityCriteria || {
        academic: {
          minimumEducationLevel: {
            level: '',
            requiredStream: [],
            specificMajors: []
          },
          minimumGPA: {
            score: 0,
            maxScale: 4,
            convertedPercentage: 0
          },
          requiredSubjects: []
        },
        language: {
          acceptedTests: {
            IELTS: {
              overallScore: 6.5,
              minimumScores: {
                reading: 6,
                writing: 6,
                speaking: 6,
                listening: 6
              }
            }
          }
        }
      }
    }
  });

  const handleSubmit = async (data: ProgramFormValues) => {
    await onSubmit(program.id, data)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                {...form.register("name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={form.watch("level")}
                onValueChange={(value) => form.setValue("level", value as "bachelors" | "masters" | "phd")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bachelors">Bachelor's</SelectItem>
                  <SelectItem value="masters">Master's</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                {...form.register("duration")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuitionFee">Tuition Fee</Label>
              <div className="flex space-x-2">
                <Input
                  id="tuitionFee"
                  type="number"
                  {...form.register("tuitionFee", { valueAsNumber: true })}
                />
                <Select
                  value={form.watch("currency")}
                  onValueChange={(value) => form.setValue("currency", value as "USD" | "EUR" | "GBP")}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...form.register("country")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Program</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
