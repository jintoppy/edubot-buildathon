import { z } from "zod";

export const programFormSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  level: z.enum(["bachelors", "masters", "phd"]),
  duration: z.string().min(1, "Duration is required"),
  tuitionFee: z.number().min(0, "Tuition fee must be positive"),
  currency: z.enum(["USD", "EUR", "GBP"]),
  country: z.string().min(1, "Country is required"),
  description: z.string().optional(),
  eligibilityCriteria: z.object({
    academic: z.object({
      minimumEducationLevel: z.object({
        level: z.string(),
        requiredStream: z.array(z.string()).optional(),
        specificMajors: z.array(z.string()).optional()
      }),
      minimumGPA: z.object({
        score: z.number(),
        maxScale: z.number(),
        convertedPercentage: z.number()
      }),
      requiredSubjects: z.array(z.object({
        subjectName: z.string(),
        minimumGrade: z.string(),
        isCompulsory: z.boolean()
      }))
    }),
    language: z.object({
      acceptedTests: z.object({
        IELTS: z.object({
          overallScore: z.number(),
          minimumScores: z.object({
            reading: z.number(),
            writing: z.number(),
            speaking: z.number(),
            listening: z.number()
          })
        }).optional(),
        TOEFL: z.object({
          overallScore: z.number(),
          minimumScores: z.object({
            reading: z.number(),
            writing: z.number(),
            speaking: z.number(),
            listening: z.number()
          })
        }).optional()
      })
    })
  }).optional()
});

export type ProgramFormValues = z.infer<typeof programFormSchema>;
