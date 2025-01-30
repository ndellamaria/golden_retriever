import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ContentType, ContentStatus } from '@prisma/client';
import { createContent, updateContent, getContentById, findContentByTitle } from './db-operations';
import { ArxivRetriever } from "@langchain/community/retrievers/arxiv";

// Initialize the LLM
const llm = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.7,
});

// Initialize tools
const arxivTool = new ArxivRetriever();

// Define the content analysis prompt
const contentAnalysisPrompt = PromptTemplate.fromTemplate(`
Analyze the following user input and extract key information for content management.
Format the response as JSON with the following fields:
- title: A clear, concise title
- type: One of [BLOG, RESEARCH_PAPER, PDF, BOOK]
- authors: Array of author names
- description: A brief description
- estimatedProgress: Number between 0-100

User Input: {userInput}
`);

// Define the progress update prompt
const progressUpdatePrompt = PromptTemplate.fromTemplate(`
Based on the following update from the user, estimate the current progress (0-100) 
and determine if the status should be updated.
Format the response as JSON with:
- progress: number between 0-100
- status: One of [NOT_STARTED, IN_PROGRESS, COMPLETED, ON_HOLD, BACKLOG]

Previous Progress: {currentProgress}
Previous Status: {currentStatus}
User Update: {userUpdate}
`);

// Define the intent analysis prompt
const intentAnalysisPrompt = PromptTemplate.fromTemplate(`
Analyze the following user input and determine if they are creating new content or updating existing content.
Also extract the title or any identifying information about the content.
Format the response as JSON with:
- action: "create" or "update"
- title: The title or identifying information of the content
- confidence: number between 0-1 indicating confidence in the action

User Input: {userInput}
`);

// Define the paper analysis prompt
const paperAnalysisPrompt = PromptTemplate.fromTemplate(`
Given the search results from arXiv, extract the following information:
- title: The full title of the paper
- authors: Array of author names
- description: Brief summary of the paper
- url: The paper URL
- publishedDate: Publication date

arXiv Results: {arxivResults}
`);

// Parse JSON string to object
const parseJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    throw e;
  }
};

// Content Creation Chain
const contentCreationChain = RunnableSequence.from([
  contentAnalysisPrompt,
  llm,
  new StringOutputParser(),
  parseJSON,
  async (analysis: any) => {
    const content = await createContent({
      title: analysis.title,
      type: analysis.type as ContentType,
      authors: analysis.authors,
      description: analysis.description,
      startedAt: new Date(),
      progress: analysis.estimatedProgress,
      status: ContentStatus.IN_PROGRESS,
    });
    return content;
  },
]);

// Progress Update Chain
const progressUpdateChain = {
  invoke: async (input: { currentProgress: number; currentStatus: string; userUpdate: string; contentId: string }) => {
    const prompt = await progressUpdatePrompt.format(input);
    const llmResult = await llm.invoke(prompt);
    const outputStr = await new StringOutputParser().invoke(llmResult);
    const update = parseJSON(outputStr);

    const updatedContent = await updateContent(input.contentId, {
      progress: update.progress,
      status: update.status as ContentStatus,
    });

    return {
      ...updatedContent,
    };
  }
};

// Intent Analysis Chain
const intentAnalysisChain = {
  invoke: async (input: { userInput: string }) => {
    const prompt = await intentAnalysisPrompt.format(input);
    const llmResult = await llm.invoke(prompt);
    const outputStr = await new StringOutputParser().invoke(llmResult);
    return parseJSON(outputStr);
  }
};

// Paper enrichment chain
const paperEnrichmentChain = {
  invoke: async (input: { userInput: string }) => {
    try {
      // Extract potential paper title or keywords from user input
      const searchIntent = await llm.invoke(
        `Extract the paper title or main keywords from this text for arXiv search: "${input.userInput}". 
         Return only the search terms, no explanation.`
      );
      const searchQuery = await new StringOutputParser().invoke(searchIntent);

      // Search arXiv
      const arxivResults = await arxivTool.invoke(searchQuery);

      // Parse the results
      const prompt = await paperAnalysisPrompt.format({ arxivResults });
      const llmResult = await llm.invoke(prompt);
      const paperInfo = parseJSON(await new StringOutputParser().invoke(llmResult));

      return {
        ...paperInfo,
        type: ContentType.RESEARCH_PAPER,
        source: 'arXiv'
      };
    } catch (error) {
      console.error('Error enriching paper data:', error);
      return null;
    }
  }
};

// Main workflow functions
export async function processNewContent(userInput: string) {
  try {
    const result = await contentCreationChain.invoke({
      userInput,
    });

    // If it's a research paper, try to enrich with arXiv data
    if (result.type === ContentType.RESEARCH_PAPER) {
      const enrichedData = await paperEnrichmentChain.invoke({ userInput });
      if (enrichedData) {
        // Update the content with enriched data
        const updatedContent = await updateContent(result.id, {
          title: enrichedData.title,
          authors: enrichedData.authors,
          description: enrichedData.description,
          fileUrl: enrichedData.url,
          startedAt: new Date(),
        });
        return updatedContent;
      }
    }

    return result;
  } catch (error) {
    console.error('Error processing new content:', error);
    throw error;
  }
}

export async function processContentUpdate(contentId: string, userUpdate: string) {
  try {
    const content = await getContentById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    const result = await progressUpdateChain.invoke({
      currentProgress: content.progress,
      currentStatus: content.status,
      userUpdate,
      contentId,
    });
    return result;
  } catch (error) {
    console.error('Error processing content update:', error);
    throw error;
  }
}

// Smart process function that handles both creation and updates
export async function processUserInput(userInput: string) {
  try {
    // First analyze the intent
    const intent = await intentAnalysisChain.invoke({ userInput });

    if (intent.action === "create") {
      return await processNewContent(userInput);
    } else {
      // For updates, we need to find the content by title
      const content = await findContentByTitle(intent.title);
      if (!content) {
        throw new Error(`Could not find content with title similar to "${intent.title}"`);
      }
      return await processContentUpdate(content.id, userInput);
    }
  } catch (error) {
    console.error('Error processing user input:', error);
    throw error;
  }
}

// Example usage:
/*
// Creating new content
const newContent = await processNewContent(
  "I'm starting a research paper about AI's impact on software development. Authors are Jane Smith and John Doe."
);

// Updating existing content
const updatedContent = await processContentUpdate(
  newContent.id,
  "I've completed the literature review section and started on methodology. About halfway through."
);

// Smart process
const result = await processUserInput("I'm starting a new blog post about my favorite books.");
*/
