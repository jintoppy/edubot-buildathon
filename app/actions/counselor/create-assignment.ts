import { db } from "@/lib/db";
import { counselorAssignments } from "@/lib/db/schema";
import { GraphStateType } from "../graph";

export async function createCounselorAssignment(state: GraphStateType) {
  try {
    // Extract relevant information from state
    const studentId = state.context?.profile?.id || state.context?.studentId;
    const programId = state.context?.programs?.[0]?.id;
    
    if (!studentId) {
      throw new Error("Student ID is required to create counselor assignment");
    }

    // Create the assignment
    const assignment = await db.insert(counselorAssignments).values({
      studentId,
      programId: programId || null,
      status: "OPEN", // From assignmentStatusEnum
      priority: "MEDIUM",
      notes: state.messages.length > 0 
        ? `Last message: ${state.messages[state.messages.length - 1].content}`
        : "Student requested counselor assistance",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return assignment;
  } catch (error) {
    console.error("Error creating counselor assignment:", error);
    throw error;
  }
}
