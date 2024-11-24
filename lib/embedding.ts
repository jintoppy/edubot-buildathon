import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { documentEmbeddings } from "@/lib/db/schema";
import { OpenAIEmbeddings } from "@langchain/openai";

// Initialize OpenAI client
const embeddings = new OpenAIEmbeddings({
  dimensions: 1536,
  model: 'text-embedding-3-small',
});

// Function to generate embeddings for a text
export async function generateEmbedding(text: string) {
  try {
    const response = await embeddings.embedQuery(text);
    
    return {
      embedding: response,
      model: 'text-embedding-3-small',
      error: null
    };
  } catch (error) {
    console.error('Error generating embedding:', error);
    return {
      embedding: null,
      model: null,
      error
    };
  }
}

// Function to prepare text for embedding
export function prepareTextForEmbedding(doc: any) {
  // Combine relevant fields for embedding
  return `
    Title: ${doc.title}
    Description: ${doc.description || ''}
    Category: ${doc.category}
    Subcategory: ${doc.subcategory || ''}
    Content: ${doc.content}
    Keywords: ${doc.keywords ? doc.keywords.join(', ') : ''}
  `.trim();
}

// Function to handle embedding storage
export async function storeEmbedding(documentId: string, embeddingData: number[], modelName: string) {
  try {
    await db.insert(documentEmbeddings).values({
      documentId,
      embedding: embeddingData,
      modelName,
      modelVersion: "text-embedding-3-small"
    });
  } catch (error) {
    console.error('Error storing embedding:', error);
    throw error;
  }
}

// Function to update existing embedding
export async function updateEmbedding(documentId: string, embeddingData: number[], modelName: string) {
  try {
    await db.update(documentEmbeddings)
      .set({
        embedding: embeddingData,
        modelName,
        modelVersion: "text-embedding-3-small",
        updatedAt: new Date()
      })
      .where(eq(documentEmbeddings.documentId, documentId));
  } catch (error) {
    console.error('Error updating embedding:', error);
    throw error;
  }
}

// Function to generate query embedding for similarity search
export async function generateQueryEmbedding(query: string) {
  const result = await generateEmbedding(query);
  
  if (result.error || !result.embedding) {
    throw new Error('Failed to generate query embedding');
  }

  return result.embedding;
}
