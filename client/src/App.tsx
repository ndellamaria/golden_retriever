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
    <div className="bg-stone-100 p-10 min-h-screen">
      <div className="flex items-center justify-center">
        <div className='pr-16'>
          <h1 className="text-5xl font-bold" style={{ fontFamily: 'Istok Web' }}>Explain it to a Golden Retriever</h1>
        </div>
        <img src='/src/assets/images/whos-a-goood-girl.png' alt="Who's a goood girl?" className="w-36"></img>
      </div>
      <div className='flex items-center'>
        <div className='group flex items-center cursor-pointer'>
          <img src='/src/assets/icons/info.svg' alt="info" className="p-4" ></img>
          <div className="overflow-hidden">
            <span className="inline-block transform translate-x-[-110%] group-hover:translate-x-0 transition-transform duration-300 ml-2">
              <p className='font-istok'>This is a personal project I made to help me track self-learning content. The name is inspired by an HBS FIN1 professor who asked us to explain things like Sharpe Ratios to
                a golden retriever &#128522; It is build using React, Typescript, Tailwind CSS.</p>
            </span>
          </div>
        </div>
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