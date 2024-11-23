// @ts-nocheck

import { StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { createStreamableUI } from 'ai/rsc';
import { db } from '@/lib/db';
import { eq, and, like } from 'drizzle-orm';
import { programs, studentProfiles } from '@/lib/db/schema';
import { QdrantVectorStore } from '@langchain/qdrant';

// Define ChatState types
interface ChatState {
  messages: any[];
  currentStep: string;
  queryType?: string;
  context?: any;
  relevanceScore?: number;
  uiStream: ReturnType<typeof createStreamableUI>;
  metadata: {
    userId: string;
    sessionId: string;
  };
}

// OpenAI Models
const routerModel = new ChatOpenAI({ model: "gpt-4", temperature: 0 });
const responseModel = new ChatOpenAI({ model: "gpt-4", temperature: 0.7 });
const relevanceModel = new ChatOpenAI({ model: "gpt-4", temperature: 0 });

// Initialize Vector Store for general questions
const vectorStore = new QdrantVectorStore (/* vector store config */);

// Node 1: Classify Query
async function classifyQueryType(state: ChatState) {
  const lastMessage = state.messages[state.messages.length - 1];
  state.uiStream.update(<p>Understanding your query...</p>);

  const classification = await routerModel.invoke([
    new SystemMessage(`
      Classify the user's query into one of the following:
      - GENERAL_QUESTION
      - SPECIFIC_PROGRAM
      - RECOMMENDATION_REQUEST
      - HUMAN_COUNSELOR
      - IRRELEVANT
      Return only the category.
    `),
    new HumanMessage(lastMessage.content),
  ]);

  return {
    ...state,
    queryType: classification.content.trim(),
    currentStep: 'classified',
  };
}

// Node 2: Retrieve Context
async function retrieveContext(state: ChatState) {
  state.uiStream.update(<p>Retrieving relevant information...</p>);
  let context;

  switch (state.queryType) {
    case 'GENERAL_QUESTION': {
      const query = state.messages[state.messages.length - 1].content;
      const results = await vectorStore.similaritySearch(query);
      context = results;
      break;
    }
    case 'SPECIFIC_PROGRAM': {
      const query = state.messages[state.messages.length - 1].content;
      const programName = await routerModel.invoke([
        new SystemMessage("Extract the program name from this query. Return only the name."),
        new HumanMessage(query),
      ]);

      const programResults = await db.select()
        .from(programs)
        .where(like(programs.name, `%${programName.content.trim()}%`));
      context = programResults;
      break;
    }
    case 'RECOMMENDATION_REQUEST': {
      const profile = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, state.metadata.userId),
      });

      const recommendations = await db.select()
        .from(programs)
        .where(and(eq(programs.level, profile.desiredLevel), eq(programs.isActive, true)))
        .limit(5);

      context = { profile, recommendations };
      break;
    }
  }

  return {
    ...state,
    context,
    currentStep: 'context_retrieved',
  };
}

// Node 3: Generate Response
async function generateResponse(state: ChatState) {
  const uiStream = state.uiStream;

  switch (state.queryType) {
    case 'GENERAL_QUESTION': {
      uiStream.update(<p>Processing your question...</p>);
      const response = await responseModel.invoke([
        new SystemMessage(`Answer the query using the following context: ${JSON.stringify(state.context)}`),
        ...state.messages,
      ]);

      uiStream.done(<p>{response.content}</p>);
      return { ...state, messages: [...state.messages, response], currentStep: 'response_generated' };
    }

    case 'SPECIFIC_PROGRAM': {
      const program = state.context[0];
      uiStream.update(<p>Fetching program details...</p>);

      const response = await responseModel.invoke([
        new SystemMessage(`Provide detailed information about this program: ${JSON.stringify(program)}`),
        ...state.messages,
      ]);

      uiStream.done(
        <div>
          <p>{response.content}</p>
          {/* Include ProgramCard component here */}
        </div>
      );

      return { ...state, messages: [...state.messages, response], currentStep: 'response_generated' };
    }

    case 'RECOMMENDATION_REQUEST': {
      const { profile, recommendations } = state.context;
      uiStream.update(<p>Finding programs for your profile...</p>);

      recommendations.forEach((program) => {
        uiStream.append(
          <div>
            {/* Include ProgramCard component here */}
          </div>
        );
      });

      const response = await responseModel.invoke([
        new SystemMessage(`Recommend programs based on the profile: ${JSON.stringify(profile)}`),
        ...state.messages,
      ]);

      uiStream.done(
        <div>
          <p>{response.content}</p>
        </div>
      );

      return { ...state, messages: [...state.messages, response], currentStep: 'response_generated' };
    }

    case 'HUMAN_COUNSELOR': {
      uiStream.done(
        <div>
          {/* Include HumanCounselorPrompt component here */}
        </div>
      );

      return { ...state, currentStep: 'end_chat' };
    }

    case 'IRRELEVANT': {
      uiStream.done(<p>I can only assist with educational queries. Let me know how I can help!</p>);
      return { ...state, currentStep: 'end_chat' };
    }
  }
}

// Node 4: Relevance Check
async function checkRelevance(state: ChatState) {
  const lastMessage = state.messages[state.messages.length - 2];
  const response = state.messages[state.messages.length - 1];

  state.uiStream.update(<p>Validating response quality...</p>);

  const relevanceCheck = await relevanceModel.invoke([
    new SystemMessage("Evaluate the relevance of the response (0 to 1)."),
    new HumanMessage(`Question: ${lastMessage.content}, Response: ${response.content}`),
  ]);

  const relevanceScore = parseFloat(relevanceCheck.content);

  return {
    ...state,
    relevanceScore,
    currentStep: relevanceScore >= 0.7 ? 'relevant' : 'not_relevant',
  };
}

// State Machine Definition
const workflow = new StateGraph<ChatState>()
  .addNode('classify_query', classifyQueryType)
  .addNode('retrieve_context', retrieveContext)
  .addNode('generate_response', generateResponse)
  .addNode('check_relevance', checkRelevance)
  .addNode('end_chat', async (state) => state)
  .addEdge('start', 'classify_query')
  .addConditionalEdges('classify_query', (state) => state.queryType === 'IRRELEVANT' ? 'end_chat' : 'retrieve_context')
  .addEdge('retrieve_context', 'generate_response')
  .addEdge('generate_response', 'check_relevance')
  .addConditionalEdges('check_relevance', (state) => state.relevanceScore >= 0.7 ? 'end_chat' : 'retrieve_context');

// Main Chat Function
export async function chat(prevMessages: any[], message: string, userId: string) {
  const uiStream = createStreamableUI();
  const result = await workflow.compile().invoke({
    messages: [...prevMessages, new HumanMessage(message)],
    currentStep: 'start',
    uiStream,
    metadata: { userId, sessionId: crypto.randomUUID() },
  });

  return { messages: result.messages, display: result.uiStream.value };
}
