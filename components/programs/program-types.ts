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
        level: z.string().optional(),
        requiredStream: z.array(z.string()).optional(),
        specificMajors: z.array(z.string()).optional()
      }).optional(),
      minimumGPA: z.object({
        score: z.number().optional(),
        maxScale: z.number().optional(),
        convertedPercentage: z.number().optional()
      }).optional(),
      requiredSubjects: z.array(z.object({
        subjectName: z.string().optional(),
        minimumGrade: z.string().optional(),
        isCompulsory: z.boolean().optional()
      })).optional()
    }).optional(),
    language: z.object({
      acceptedTests: z.object({
        IELTS: z.object({
          overallScore: z.number().optional(),
          minimumScores: z.object({
            reading: z.number().optional(),
            writing: z.number().optional(),
            speaking: z.number().optional(),
            listening: z.number().optional()
          }).optional()
        }).optional(),
        TOEFL: z.object({
          overallScore: z.number().optional(),
          minimumScores: z.object({
            reading: z.number().optional(),
            writing: z.number().optional(),
            speaking: z.number().optional(),
            listening: z.number().optional()
          }).optional()
        }).optional()
      }).optional()
    }).optional(),
    professional: z.object({
      workExperience: z.object({
        yearsRequired: z.number().optional(),
        isCompulsory: z.boolean().optional(),
        relevantFieldsOnly: z.boolean().optional(),
        acceptedFields: z.array(z.string()).optional()
      }).optional(),
      certifications: z.array(z.object({
        name: z.string().optional(),
        isCompulsory: z.boolean().optional(),
        alternativesAccepted: z.array(z.string()).optional()
      })).optional()
    }).optional(),
    standardizedTests: z.object({
      GRE: z.object({
        required: z.boolean().optional(),
        minimumScores: z.object({
          verbal: z.number().optional(),
          quantitative: z.number().optional(),
          analyticalWriting: z.number().optional(),
          total: z.number().optional()
        }).optional()
      }).optional(),
      GMAT: z.object({
        required: z.boolean().optional(),
        minimumScores: z.object({
          verbal: z.number().optional(),
          quantitative: z.number().optional(),
          analyticalWriting: z.number().optional(),
          integratedReasoning: z.number().optional(),
          total: z.number().optional()
        }).optional()
      }).optional(),
      subjectTests: z.array(z.object({
        testName: z.string(),
        minimumScore: z.number(),
        isCompulsory: z.boolean()
      })).optional()
    }).optional(),
    additional: z.object({
      ageLimit: z.object({
        minimum: z.number().optional(),
        maximum: z.number().optional()
      }).optional(),
      financialRequirements: z.object({
        proofOfFunds: z.boolean().optional(),
        minimumAmount: z.number().optional(),
        currency: z.string().optional(),
        durationInMonths: z.number().optional()
      }).optional(),
      portfolioRequirements: z.object({
        required: z.boolean(),
        type: z.array(z.string()),
        minimumItems: z.number()
      }).optional(),
      interviewRequired: z.object({
        required: z.boolean(),
        type: z.string()
      }).optional(),
      recommendationLetters: z.object({
        required: z.boolean(),
        minimum: z.number(),
        academic: z.number(),
        professional: z.number()
      }).optional()
    }).optional(),
    specialConditions: z.object({
      countrySpecificRequirements: z.array(z.object({
        country: z.string(),
        additionalDocuments: z.array(z.string()),
        specialConditions: z.array(z.string())
      })).optional(),
      quotaReservations: z.array(z.object({
        category: z.string(),
        percentageReserved: z.number(),
        specialCriteria: z.array(z.string())
      })).optional(),
      scholarshipEligibility: z.array(z.object({
        available: z.boolean(),
        criteria: z.array(z.string()),
        amount: z.number().optional(),
        currency: z.string().optional()
      })).optional()
    }).optional()
  }).optional()
});

export type ProgramFormValues = z.infer<typeof programFormSchema>;
