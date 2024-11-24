'use server';

import { StateGraph, MessagesAnnotation, Annotation, START, END } from "@langchain/langgraph";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, BaseMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { createStreamableUI } from 'ai/rsc';
import { db } from '@/lib/db';
import { eq, and, like } from 'drizzle-orm';
import { programs, studentProfiles } from '@/lib/db/schema';
import { loadVectorStore } from "@/lib/chat-utils";

const ProgramCard = ({ program }: { program: ProgramInterface }) => (
  <div className="rounded-lg border p-4 mb-4 bg-white shadow-sm">
    <h3 className="text-lg font-bold">{program.name}</h3>
    <p className="text-sm text-gray-600">{program.level} • {program.country}</p>
    <div className="mt-2 space-y-2">
      <p>Duration: {program.duration}</p>
      <p>Tuition: {program.tuitionFee} {program.currency}</p>
      {program.description && (
        <p className="text-sm text-gray-700">{program.description}</p>
      )}
      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Learn More
        </button>
        <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50">
          Compare
        </button>
      </div>
    </div>
  </div>
);

const StudentProfileView = ({ profile }: { profile: StudentProfileInterface }) => (
  <div className="bg-gray-50 rounded-lg p-4 mb-4">
    <h3 className="font-bold mb-2">Your Profile</h3>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>Current Education: {profile.currentEducation}</div>
      <div>Desired Level: {profile.desiredLevel}</div>
      <div>Preferred Countries: {profile.preferredCountries.join(', ')}</div>
      {profile.budgetRange && <div>Budget Range: {profile.budgetRange}</div>}
      {profile.testScores && (
        <div className="col-span-2">
          <p className="font-semibold mt-2">Test Scores:</p>
          {Object.entries(profile.testScores).map(([test, score]) => (
            <span key={test} className="mr-4">
              {test}: {score}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

interface ProgramInterface {
  id: string;
  name: string;
  level: string;
  duration: string;
  tuitionFee: number;
  currency: string;
  country: string;
  description?: string;
  eligibilityCriteria?: Record<string, any>;
}

interface StudentProfileInterface {
  currentEducation: string;
  desiredLevel: string;
  preferredCountries: string[];
  budgetRange?: string;
  testScores?: Record<string, number>;
}

interface UIStreamInterface extends ReturnType<typeof createStreamableUI> {}

// Define the Graph State
const GraphState = Annotation.Root({
  messages: Annotation({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y)
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
    reducer: (x, y) => y === null ? null : (y ?? x ?? null),
    default: () => null,
  }),

  relevanceScore: Annotation<number | null>({
    reducer: (x, y) => y ?? x ?? null,
    default: () => null,
  }),

  uiStream: Annotation<UIStreamInterface>({
    reducer: (x, y) => y ?? x,
  }),

  currentStep: Annotation<string>({
    reducer: (x, y) => y ?? x ?? 'start',
    default: () => 'start',
  }),

  metadata: Annotation<{
    userId: string;
    sessionId: string;
  }>({
    reducer: (x, y) => ({...x, ...y}),
    default: () => ({
      userId: '',
      sessionId: '',
    }),
  }),
});

// Export the type
type GraphStateType = typeof GraphState.State;

const topK = 3;

// OpenAI Models
const routerModel = new ChatAnthropic({ model: "claude-3-5-sonnet-20241022", temperature: 0 });
const responseModel = new ChatAnthropic({ model: "claude-3-5-sonnet-20241022", temperature: 0.7 });
const relevanceModel = new ChatAnthropic({ model: "claude-3-5-sonnet-20241022", temperature: 0 });


// Node 1: Classify Query
async function classifyQueryType(state: GraphStateType) {
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
    new HumanMessage(lastMessage.content.toString()),
  ]);

  console.log(classification);

  return {
    ...state,
    queryType: classification.content.toString().trim(),
    currentStep: 'classified',
  };
}

// Node 2: Retrieve Context
async function retrieveContext(state: GraphStateType) {
  const vectorStore = await loadVectorStore();
  // const retriever = vectorStore.asRetriever({ k: topK, searchType: 'similarity' });
  
  state.uiStream.update(<p>Retrieving relevant information...</p>);
  let context;

  switch (state.queryType) {
    case 'GENERAL_QUESTION': {
      const query = state.messages[state.messages.length - 1].content;
      const results = await vectorStore.similaritySearch(query.toString(), topK);
      context = results;
      break;
    }
    case 'SPECIFIC_PROGRAM': {
      const query = state.messages[state.messages.length - 1].content;
      const programName = await routerModel.invoke([
        new SystemMessage("Extract the program name from this query. Return only the name."),
        new HumanMessage(query.toString()),
      ]);

      const programResults = await db.select()
        .from(programs)
        .where(like(programs.name, `%${programName.content.toString().trim()}%`));
      context = programResults;
      break;
    }
    case 'RECOMMENDATION_REQUEST': {
      const profile = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, state.metadata.userId),
      });

      const conditions = [eq(programs.isActive, true)]
      if(profile?.desiredLevel){
        conditions.push(eq(programs.level, profile.desiredLevel));
      }

      const recommendations = await db.select()
        .from(programs)
        .where(and(...conditions))
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
async function generateResponse(state: GraphStateType): Promise<Partial<GraphStateType>> {
  if (!state.queryType || !state.context) {
    return {
      messages: [
        new AIMessage("I'm sorry, but I couldn't process your request properly. Could you please try again?")
      ],
      currentStep: END
    };
  }

  switch (state.queryType) {
    case 'GENERAL_QUESTION': {
      state.uiStream.update(
        <div className="animate-pulse">
          <p className="text-gray-500">Finding the answer to your question...</p>
        </div>
      );

      const response = await responseModel.invoke([
        new SystemMessage(`
          Answer the query using this context. Be concise but informative. 
          Format the response to be easily readable.
          Context: ${JSON.stringify(state.context.generalInfo)}
        `),
        ...state.messages
      ]);

      state.uiStream.done(
        <div className="prose max-w-none">
          <div className="mb-4 text-gray-700" style={{ whiteSpace: 'pre-wrap' }}>
            {response.content.toString()}
          </div>
        </div>
      );

      return {
        messages: [...state.messages, response],
        currentStep: 'response_generated'
      };
    }

    case 'SPECIFIC_PROGRAM': {
      const program = state.context.programs?.[0];
      if (!program) {
        state.uiStream.done(
          <div className="text-yellow-600">
            {`I couldn't find the specific program you're looking for. 
            Would you like to browse similar programs instead?`}
          </div>
        );
        return {
          messages: [new AIMessage("I couldn't find that specific program. Would you like to explore similar options?")],
          currentStep: 'response_generated'
        };
      }

      state.uiStream.update(
        <div className="animate-pulse">
          <p className="text-gray-500">Retrieving program details...</p>
        </div>
      );

      const response = await responseModel.invoke([
        new SystemMessage(`
          Provide detailed information about this program. 
          Include key benefits and requirements.
          Program details: ${JSON.stringify(program)}
        `),
        ...state.messages
      ]);

      const showEnrollment = response.content.toString().toLowerCase().includes('enroll') ||
                            state.messages[state.messages.length - 1].content.toString().toLowerCase().includes('enroll');

      state.uiStream.done(
        <div className="space-y-4">
          <ProgramCard program={program} />
          <div className="prose max-w-none">
            {response.content.toString()}
          </div>
          {showEnrollment && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
              <div className="max-w-2xl mx-auto flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{program.name}</h4>
                  <p className="text-sm text-gray-600">Ready to take the next step?</p>
                </div>
                <button className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold">
                  Start Enrollment
                </button>
              </div>
            </div>
          )}
        </div>
      );

      return {
        messages: [...state.messages, response],
        currentStep: 'response_generated'
      };
    }

    case 'RECOMMENDATION_REQUEST': {
      const { profile, programs: recommendations } = state.context;
      if (!profile || !recommendations?.length) {
        state.uiStream.done(
          <div className="text-yellow-600">
            I need more information about your preferences to make personalized recommendations. 
            Would you like to complete your profile?
          </div>
        );
        return {
          messages: [new AIMessage("I need more information to make personalized recommendations. Shall we update your profile?")],
          currentStep: 'response_generated'
        };
      }

      state.uiStream.update(
        <div className="space-y-4">
          <StudentProfileView profile={profile} />
          <div className="animate-pulse">
            <p className="text-gray-500">Finding the best programs for your profile...</p>
          </div>
        </div>
      );

      // Stream program cards one by one
      recommendations.forEach((program, index) => {
        setTimeout(() => {
          state.uiStream.append(
            <div className="animate-fade-in transform transition-all duration-500 translate-y-0">
              <ProgramCard program={program} />
            </div>
          );
        }, index * 300);
      });

      const response = await responseModel.invoke([
        new SystemMessage(`
          Recommend programs based on this student's profile.
          Explain why each program is a good fit.
          Profile: ${JSON.stringify(profile)}
          Programs: ${JSON.stringify(recommendations)}
        `),
        ...state.messages
      ]);

      state.uiStream.done(
        <div className="space-y-6">
          <StudentProfileView profile={profile} />
          <div className="prose max-w-none">
            {response.content.toString()}
          </div>
          <div className="space-y-4">
            {recommendations.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold">Want to explore more options?</p>
            <p className="text-sm text-gray-600">We can refine these recommendations based on your preferences.</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Refine Search
            </button>
          </div>
        </div>
      );

      return {
        messages: [...state.messages, response],
        currentStep: 'response_generated'
      };
    }

    case 'HUMAN_COUNSELOR': {
      state.uiStream.done(
        <div className="rounded-lg border p-4 bg-blue-50">
          <h3 className="font-bold text-lg">Connect with a Counselor</h3>
          <p className="mt-2 text-gray-700">
            Our education counselors are here to help you make the best choice for your future.
          </p>
          <div className="mt-4 space-x-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Schedule a Call
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Continue with AI Assistant
            </button>
          </div>
        </div>
      );

      return {
        messages: [new AIMessage("I'll help you connect with a human counselor who can provide personalized guidance.")],
        currentStep: END
      };
    }

    case 'IRRELEVANT': {
      state.uiStream.done(
        <div className="rounded-lg border p-4 bg-gray-50">
          <p className="text-gray-700">
            I specialize in educational guidance and can help you with:
          </p>
          <ul className="mt-2 space-y-1 text-gray-600">
            <li>• Finding suitable programs</li>
            <li>• Understanding program requirements</li>
            <li>• Getting program recommendations</li>
            <li>• Connecting with counselors</li>
          </ul>
          <button className="mt-4 text-blue-500 hover:underline">
            Browse Popular Programs
          </button>
        </div>
      );

      return {
        messages: [new AIMessage("I can help you with educational guidance. What would you like to know about our programs?")],
        currentStep: END
      };
    }

    default: {
      return {
        messages: [new AIMessage("I'm not sure how to help with that. Could you please rephrase your question?")],
        currentStep: END
      };
    }
  }
}

// Node 4: Relevance Check
async function checkRelevance(state: GraphStateType) {
  const lastMessage = state.messages[state.messages.length - 2];
  const response = state.messages[state.messages.length - 1];

  state.uiStream.update(<p>Validating response quality...</p>);

  const relevanceCheck = await relevanceModel.invoke([
    new SystemMessage("Evaluate the relevance of the response (0 to 1)."),
    new HumanMessage(`Question: ${lastMessage.content}, Response: ${response.content}`),
  ]);

  const relevanceScore = parseFloat(relevanceCheck.content.toString());

  return {
    ...state,
    relevanceScore,
    currentStep: relevanceScore >= 0.7 ? 'relevant' : 'not_relevant',
  };
}

const channels = {
  messages: MessagesAnnotation,
  currentStep: { value: "start" as string },
  queryType: { value: undefined as string | undefined },
  context: { value: undefined as any },
  relevanceScore: { value: undefined as number | undefined },
  uiStream: { value: undefined as ReturnType<typeof createStreamableUI> | undefined },
  metadata: { 
    value: undefined as { userId: string; sessionId: string; } | undefined 
  }
};

// State Machine Definition
const workflow = new StateGraph(GraphState)
  .addNode('classify_query', classifyQueryType)
  .addNode('retrieve_context', retrieveContext)
  .addNode('generate_response', generateResponse)
  .addNode('check_relevance', checkRelevance)
  .addEdge(START, 'classify_query')
  .addConditionalEdges('classify_query', (state) => state.queryType === 'IRRELEVANT' ? END : 'retrieve_context')
  .addEdge('retrieve_context', 'generate_response')
  .addEdge('generate_response', 'check_relevance')
  .addConditionalEdges('check_relevance', (state) => state.relevanceScore && state.relevanceScore >= 0.7 ? END : 'retrieve_context');

// Main Chat Function
export async function chat(prevMessages: any[], message: string, userId: string) {
  const uiStream = createStreamableUI();
  const result = await workflow.compile().stream({
    messages: [...prevMessages, new HumanMessage(message)],
    currentStep: START,
    uiStream,
    metadata: { userId, sessionId: crypto.randomUUID() },
  },  { configurable: { thread_id: userId } });

  return result;

  //return { messages: result.messages, display: result.uiStream.value };
}
