import { chat } from '@/app/actions/graph';
import { LangChainAdapter, Message } from 'ai';

export async function POST(req: Request) {
  const { messages, userId } = await req.json()
  const lastMessage = messages[messages.length - 1]
  
  // Remove the last message from the messages array
  const previousMessages = messages.slice(0, -1)
  
  const responseStream = await chat(previousMessages, lastMessage.content, userId)
  
  const transformedStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of responseStream) {
        // Extract the actual message content from the chunk
        const nodeOutput: any = Object.values(chunk)[0];
        if (
          nodeOutput &&
          nodeOutput.messages &&
          nodeOutput.messages.length > 0
        ) {
          const message = nodeOutput.messages[0];
          console.log('message', message);
          if(message && message.content){
            const responseObject = {
              message: message.content ?? 'Some error occurred',
              state: {
                currentProcess: nodeOutput.currentProcess,
                bankBalance: nodeOutput.bankBalance,
                transactions: nodeOutput.transactionHistory,
              }
            };
            const jsonString = JSON.stringify(responseObject);
            controller.enqueue(jsonString);
          }
          
        }
      }
      controller.close();
    },
  });

  return LangChainAdapter.toDataStreamResponse(transformedStream);
}