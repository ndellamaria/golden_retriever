import { useEffect, useState } from 'react';
import type { Content, ContentList } from '@your-project/shared-types';

function App() {
  const [, setContent] = useState<Content | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/content')
      .then(res => res.json())
      .then(content => setContent(content));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-start">
        <div className='pr-16'>
          <h1 className="text-6xl font-bold" style={{ fontFamily: 'Istok Web' }}>Explain it to a Golden Retriever</h1>
          <img src='/src/assets/icons/info.svg' alt="info" className="!w-10 !h-10" ></img>
        </div>
        <img src='/src/assets/images/whos-a-goood-girl.jpeg' alt="Who's a goood girl?" className="w-1/6"></img>
      </div>
      <ContentList />
    </div >
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
      {contentList.map((content,) => (
        <ContentRow key={content.id} content={content} />
      ))}
    </div>
  );
}

function ContentRow({ content }: { content: Content | null }) {
  if (!content) return null;

  return (
    <div className="p-2">
      <p className="text-lg font-bold" style={{ fontFamily: 'Istok Web' }}>{content.title} </p>
      <p className="text-sm font-istok">Started: {new Date(content.started).toLocaleDateString()} | Status: {content.progress === 100 ? 'Completed' : 'In Progress'}</p>
    </div>
  );
}

export default App;