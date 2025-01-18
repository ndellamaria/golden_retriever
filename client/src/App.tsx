import React, { useEffect, useState } from 'react';
import { Content } from '@your-project/shared-types';

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
            <ContentRow content={content} />
        </div>
    );
}

function ContentRow({ content }: { content: Content | null }) {
    if (!content) return null;

    return (
        <div>
            <p>{content.title} </p>
            <p>Started: {content.started} | Status: {content.progress === 100 ? 'Completed' : 'In Progress'}</p>
        </div>
    );
}

export default App;