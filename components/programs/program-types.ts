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
    }),
    professional: z.object({
      workExperience: z.object({
        yearsRequired: z.number(),
        isCompulsory: z.boolean(),
        relevantFieldsOnly: z.boolean(),
        acceptedFields: z.array(z.string()).optional()
      }),
      certifications: z.array(z.object({
        name: z.string(),
        isCompulsory: z.boolean(),
        alternativesAccepted: z.array(z.string())
      }))
    }).optional(),
    standardizedTests: z.object({
      GRE: z.object({
        required: z.boolean(),
        minimumScores: z.object({
          verbal: z.number(),
          quantitative: z.number(),
          analyticalWriting: z.number(),
          total: z.number().optional()
        })
      }).optional(),
      GMAT: z.object({
        required: z.boolean(),
        minimumScores: z.object({
          verbal: z.number(),
          quantitative: z.number(),
          analyticalWriting: z.number(),
          integratedReasoning: z.number(),
          total: z.number()
        })
      }).optional(),
      subjectTests: z.array(z.object({
        testName: z.string(),
        minimumScore: z.number(),
        isCompulsory: z.boolean()
      })).optional()
    }).optional(),
    additional: z.object({
      ageLimit: z.object({
        minimum: z.number(),
        maximum: z.number().optional()
      }).optional(),
      financialRequirements: z.object({
        proofOfFunds: z.boolean(),
        minimumAmount: z.number(),
        currency: z.string(),
        durationInMonths: z.number()
      }),
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
