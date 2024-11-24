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

// Calculate text similarity score using simple token matching
export function calculateTextSimilarity(text: string, query: string): number {
  const textTokens = new Set(text.toLowerCase().split(/\s+/));
  const queryTokens = query.toLowerCase().split(/\s+/);
  
  let matches = 0;
  for (const token of queryTokens) {
    if (textTokens.has(token)) matches++;
  }
  
  return matches / queryTokens.length;
}

// Combine and rank search results
export function rankAndCombineResults(
  vectorResults: [Document, number][],
  textResults: Document[],
  query: string
): Document[] {
  const scoredResults = new Map<string, { doc: Document; score: number }>();

  // Process vector search results
  vectorResults.forEach(([doc, score], index) => {
    scoredResults.set(doc.pageContent, {
      doc,
      score: score * 0.7 + (1 / (index + 1)) * 0.3 // Weight vector similarity higher
    });
  });

  // Process text search results
  textResults.forEach((doc, index) => {
    const textScore = calculateTextSimilarity(doc.pageContent, query);
    const existing = scoredResults.get(doc.pageContent);
    
    if (existing) {
      existing.score += textScore * 0.5; // Boost score if found in both searches
    } else {
      scoredResults.set(doc.pageContent, {
        doc,
        score: textScore * 0.5 + (1 / (index + 1)) * 0.2
      });
    }
  });

  // Sort by combined score and return documents
  return Array.from(scoredResults.values())
    .sort((a, b) => b.score - a.score)
    .map(item => item.doc)
    .slice(0, 5); // Return top 5 results
}
