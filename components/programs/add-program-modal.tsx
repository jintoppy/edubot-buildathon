'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from 'lucide-react'

import { programFormSchema, ProgramFormValues } from "./program-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface AddProgramModalProps {
  onSubmit: (programData: ProgramFormValues) => Promise<void>
}

export function AddProgramModal({ onSubmit }: AddProgramModalProps) {
  const [open, setOpen] = React.useState(false)
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      name: '',
      level: 'bachelors',
      duration: '',
      tuitionFee: 0,
      currency: 'USD',
      country: '',
      description: '',
      eligibilityCriteria: {
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
        },
        professional: {
          workExperience: {
            yearsRequired: 0,
            isCompulsory: false,
            relevantFieldsOnly: true,
            acceptedFields: []
          },
          certifications: []
        },
        standardizedTests: {
          GRE: {
            required: false,
            minimumScores: {
              verbal: 150,
              quantitative: 150,
              analyticalWriting: 3.5,
              total: 300
            }
          },
          GMAT: {
            required: false,
            minimumScores: {
              verbal: 0,
              quantitative: 0,
              analyticalWriting: 0,
              integratedReasoning: 0,
              total: 0
            }
          },
          subjectTests: []
        },
        additional: {
          financialRequirements: {
            proofOfFunds: true,
            minimumAmount: 0,
            currency: 'USD',
            durationInMonths: 12
          },
          recommendationLetters: {
            required: false,
            minimum: 0,
            academic: 0,
            professional: 0
          }
        },
        specialConditions: {
          countrySpecificRequirements: [],
          quotaReservations: [],
          scholarshipEligibility: []
        }
      }
    }
  });

  const onFormSubmit = async (data: ProgramFormValues) => {
    await onSubmit(data)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-6">
            {/* Basic Information */}
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
                    <SelectItem value="bachelors">{`Bachelor's`}</SelectItem>
                    <SelectItem value="masters">{`Master's`}</SelectItem>
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
              />
            </div>

            {/* Academic Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Requirements</h3>
              
              {/* Minimum Education Level */}
              <div className="space-y-2">
                <Label>Minimum Education Level</Label>
                <Input
                  {...form.register("eligibilityCriteria.academic.minimumEducationLevel.level")}
                  placeholder="e.g., Bachelor's Degree"
                />
              </div>

              {/* Minimum GPA */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>GPA Score</Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register("eligibilityCriteria.academic.minimumGPA.score", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Scale</Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register("eligibilityCriteria.academic.minimumGPA.maxScale", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Percentage</Label>
                  <Input
                    type="number"
                    {...form.register("eligibilityCriteria.academic.minimumGPA.convertedPercentage", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Language Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Language Requirements</h3>
              
              {/* IELTS Scores */}
              <div className="space-y-4">
                <Label>IELTS Requirements</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Overall Score</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("eligibilityCriteria.language.acceptedTests.IELTS.overallScore", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reading</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("eligibilityCriteria.language.acceptedTests.IELTS.minimumScores.reading", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Writing</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("eligibilityCriteria.language.acceptedTests.IELTS.minimumScores.writing", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Speaking</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("eligibilityCriteria.language.acceptedTests.IELTS.minimumScores.speaking", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Listening</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...form.register("eligibilityCriteria.language.acceptedTests.IELTS.minimumScores.listening", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Program</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
