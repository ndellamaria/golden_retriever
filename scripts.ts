import { Content } from './types';

async function loadReadingList(): Promise<void> {
    try {
        const response: Response = await fetch('content.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const papers: Content[] = await response.json();
        displayPapers(papers);
    } catch (error) {
        console.error('Error loading reading list:', error);
        const container = document.getElementById('readingList');
        if (container) {
            container.innerHTML = '<p style="color: red;">Error loading reading list. Please try again later.</p>';
        }
    }
}

function displayPapers(papers: Content[]): void {
    const container = document.getElementById('readingList');
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    papers.forEach(paper => {
        const paperElement = createPaperElement(paper);
        container.appendChild(paperElement);
    });
}

function formatDate(dateString: string | null): string {
    if (!dateString) return 'Not yet';
    return new Date(dateString).toLocaleString();
}

function createPaperElement(paper: Content): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'paper-card';

    div.innerHTML = `
        <div class="paper-title">${paper.title}</div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${paper.progress}%"></div>
        </div>
        <div class="progress-text">
            <span>Progress: ${paper.progress}%</span>
        </div>
        <div class="dates">
            <div>Started: ${formatDate(paper.started)}</div>
            <div>Finished: ${formatDate(paper.finished)}</div>
        </div>
    `;

    return div;
}

// Load reading list when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadReadingList();

    // Refresh every 30 seconds
    setInterval(loadReadingList, 30000);
});