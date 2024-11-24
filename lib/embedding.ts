import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { documentEmbeddings } from "@/lib/db/schema";
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate embeddings for a text
export async function generateEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      input: text,
      model: "text-embedding-3-small"
    });
    
    return {
      embedding: response.data[0].embedding,
      model: response.model,
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
