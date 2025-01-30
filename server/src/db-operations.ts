import { PrismaClient, ContentType, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new content entry
async function createContent(data: {
  title: string;
  type: ContentType;
  authors: string[];
  description?: string;
  fileUrl?: string;
  startedAt: Date;
  finishedAt?: Date;
  progress?: number;
  status?: ContentStatus;
}) {
  try {
    const content = await prisma.content.create({
      data: {
        ...data,
        progress: data.progress ?? 0,
        status: data.status ?? ContentStatus.NOT_STARTED,
      },
    });
    return content;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
}

// Read a single content entry by ID
async function getContentById(id: string) {
  try {
    const content = await prisma.content.findUnique({
      where: { id },
    });
    return content;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}

// Update a content entry
async function updateContent(id: string, data: {
  title?: string;
  type?: ContentType;
  authors?: string[];
  description?: string;
  fileUrl?: string;
  startedAt?: Date;
  finishedAt?: Date;
  progress?: number;
  status?: ContentStatus;
}) {
  try {
    const updatedContent = await prisma.content.update({
      where: { id },
      data,
    });
    return updatedContent;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
}

// Delete a content entry
async function deleteContent(id: string) {
  try {
    const deletedContent = await prisma.content.delete({
      where: { id },
    });
    return deletedContent;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
}

// Find content by title (using fuzzy match)
async function findContentByTitle(title: string) {
  const allContent = await prisma.content.findMany();

  // Convert titles to lowercase for comparison
  const searchTitle = title.toLowerCase();

  // Find the best match using simple string inclusion
  const bestMatch = allContent.find(content =>
    content.title.toLowerCase().includes(searchTitle) ||
    searchTitle.includes(content.title.toLowerCase())
  );

  return bestMatch || null;
}

export {
  createContent,
  getContentById,
  updateContent,
  deleteContent,
  findContentByTitle,
};
