import { createInterface } from 'readline';
import { processUserInput } from './content-workflow';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

async function promptUser(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('Welcome to Golden Retriever CLI!');
  console.log('Just tell me what you\'re working on, and I\'ll help you track it.');
  console.log('Examples:');
  console.log('- "I started reading a paper on LLM architectures"');
  console.log('- "Just finished chapter 3 of the ML book"');
  console.log('- "Made progress on my research paper, completed the methods section"');
  console.log('\nType "exit" to quit\n');

  while (true) {
    const input = await promptUser('\nWhat are you working on? ');

    if (input.toLowerCase() === 'exit') {
      break;
    }

    try {
      const result = await processUserInput(input);
      console.log('\nProcessed successfully!');
      console.log('Title:', result.title);
      console.log('Progress:', result.progress + '%');
      console.log('Status:', result.status);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unexpected error occurred');
      }
    }
  }

  rl.close();
  process.exit(0);
}

main().catch(console.error);
