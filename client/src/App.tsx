import React, { useEffect, useState } from 'react';
import type { Content, ContentList } from '@your-project/shared-types';

function App() {
    const [content, setContent] = useState<Content | null>(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/content')
            .then(res => res.json())
            .then(content => setContent(content));
    }, []);

    return (
        <div>
            <h1>Frontend is running!</h1>
            <ContentList />
        </div>
    );
}

const ContentList = () => {
    const [contentList, setContentList] = useState<ContentList>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/content');
                if (!response.ok) {
                    throw new Error('Failed to fetch content');
                }
                const data = await response.json();
                setContentList(data);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch content');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (error) return <div>Error: {error}</div>;
    if (loading) return <div>Loading...</div>;
    if (!contentList) return <div>No content found</div>;

    return (
        <div>
            {contentList.map((content, i) => (
                <ContentRow key={content.id} content={content} />
            ))}
        </div>
    );
}

function ContentRow({ content }: { content: Content | null }) {
    if (!content) return null;

    return (
        <div>
            <p>{content.title} </p>
            <p>Started: {new Date(content.started).toLocaleDateString()} | Status: {content.progress === 100 ? 'Completed' : 'In Progress'}</p>
        </div>
    );
}

export default App;