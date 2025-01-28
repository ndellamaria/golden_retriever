import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ContentType, ContentStatus } from '@prisma/client';
import { createContent, updateContent, getContentById } from './db-operations';

// Initialize the LLM
const llm = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.7,
});

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
- reasoning: brief explanation

Previous Progress: {currentProgress}
Previous Status: {currentStatus}
User Update: {userUpdate}
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
const progressUpdateChain = RunnableSequence.from([
  progressUpdatePrompt,
  llm,
  new StringOutputParser(),
  parseJSON,
  async (update: any, { contentId }: { contentId: string }) => {
    const updatedContent = await updateContent(contentId, {
      progress: update.progress,
      status: update.status as ContentStatus,
    });
    return {
      ...updatedContent,
      reasoning: update.reasoning,
    };
  },
]);

// Main workflow functions
export async function processNewContent(userInput: string) {
  try {
    const result = await contentCreationChain.invoke({
      userInput,
    });
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
*/
