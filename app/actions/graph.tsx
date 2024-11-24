"use server";

import {
  StateGraph,
  Annotation,
  START,
  END,
} from "@langchain/langgraph";
import {
  HumanMessage,
  BaseMessage,
  AIMessage,
} from "@langchain/core/messages";
import { createStreamableUI } from "ai/rsc";
import {
  ProgramInterface,
} from "@/components/programs/program-card";
import {
  StudentProfileInterface,
} from "@/components/profile/student-profile-view";
import { classifyQueryType } from "./graph-steps/classifyQueryType";
import { retrieveContext } from "./graph-steps/retrieveContext";
import { generateResponse } from "./graph-steps/generateResponse";

interface SerializedMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

// Define the Graph State
const GraphState = Annotation.Root({
  messages: Annotation({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
  }),
  queryType: Annotation<string | null>({
    reducer: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  context: Annotation<{
    programs?: ProgramInterface[];
    profile?: StudentProfileInterface;
    generalInfo?: any[];
  } | null>({
    reducer: (x, y) => (y === null ? null : y ?? x ?? null),
    default: () => null,
  }),
  relevanceScore: Annotation<number | null>({
    reducer: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  uiStream: Annotation<any>({
    reducer: (x, y) => y ?? x,
  }),
  currentStep: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "start",
    default: () => "start",
  }),
  metadata: Annotation<{
    userId: string;
    sessionId: string;
  }>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({
      userId: "",
      sessionId: "",
    }),
  }),
});

export type GraphStateType = typeof GraphState.State;

// State Machine Definition
const workflow = new StateGraph(GraphState)
  .addNode("classify_query", classifyQueryType)
  .addNode("retrieve_context", retrieveContext)
  .addNode("generate_response", generateResponse)
  .addEdge(START, "classify_query")
  .addConditionalEdges("classify_query", (state) =>
    state.queryType === "IRRELEVANT" ? END : "retrieve_context"
  )
  .addEdge("retrieve_context", "generate_response")
  .addEdge("generate_response", END);

const chatGraph = workflow.compile();

// Serialization helpers
function convertToLangChainMessages(messages: SerializedMessage[]) {
  return messages.map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );
}

function serializeMessages(messages: (AIMessage | HumanMessage)[]) {
  return messages.map((msg) => ({
    role: msg instanceof HumanMessage ? "user" : "assistant",
    content: msg.content.toString(),
    id: crypto.randomUUID(),
  }));
}

async function chat(
  prevMessages: SerializedMessage[],
  message: string,
  userId: string,
  uiStream: any
) {
  return chatGraph
    .invoke(
      {
        messages: [
          ...convertToLangChainMessages(prevMessages),
          new HumanMessage(message),
        ],
        currentStep: START,
        uiStream,
        metadata: {
          userId,
          sessionId: crypto.randomUUID(),
        },
      },
      {
        configurable: { thread_id: userId },
      }
    )
    .then((result) => {
      return {
        messages: serializeMessages(result.messages),
      };
    });
}
// Updated server action
export async function chatAction(
  messages: SerializedMessage[],
  input: string,
  userId: string
) {
  try {
    const uiStream = createStreamableUI();
    const resultPromise = chat(messages, input, userId, uiStream);
    return {
      resultPromise,
      serverUi: uiStream.value,
    };
  } catch (error) {
    console.error("Chat action error:", error);
    throw error;
  }
}
