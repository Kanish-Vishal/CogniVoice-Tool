import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, BookOpen, UserCircle } from 'lucide-react';

const STIMULUS_IMAGES = [
  'https://picsum.photos/seed/cognitive-scene-1/600/400',
  'https://picsum.photos/seed/cognitive-scene-2/600/400',
  'https://picsum.photos/seed/cognitive-scene-3/600/400',
  'https://picsum.photos/seed/cognitive-scene-4/600/400',
  'https://picsum.photos/seed/cognitive-scene-5/600/400',
  'https://picsum.photos/seed/cognitive-scene-6/600/400'
];

export function SamplePrompts({ t }: { t: any }) {
  const [randomImage, setRandomImage] = useState<string>('');

  useEffect(() => {
    // Select a random image on mount
    const idx = Math.floor(Math.random() * STIMULUS_IMAGES.length);
    setRandomImage(STIMULUS_IMAGES[idx]);
  }, []);

  const localizedPrompts = [
    {
      idx: 0,
      category: 'Picture Description',
      icon: <Sparkles className="h-4 w-4" />,
      title: t.prompts.stimulus.title,
      description: t.prompts.stimulus.desc,
      imageUrl: randomImage
    },
    {
      idx: 1,
      category: 'Procedural Memory',
      icon: <BookOpen className="h-4 w-4" />,
      title: t.prompts.procedural.title,
      description: t.prompts.procedural.desc
    },
    {
      idx: 2,
      category: 'Semantic Recall',
      icon: <UserCircle className="h-4 w-4" />,
      title: t.prompts.memory.title,
      description: t.prompts.memory.desc
    }
  ];

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-100">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">{t.promptsTitle}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {localizedPrompts.map((item) => (
          <Card key={item.idx} className="bg-white border-zinc-200 hover:border-zinc-300 transition-all group flex flex-col overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-zinc-100 rounded-md text-zinc-600 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-tighter">{item.category}</span>
              </div>
              <CardTitle className="text-sm font-bold">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 flex flex-col">
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                {item.description}
              </p>
              
              <div className="mt-auto">
                {item.imageUrl && (
                  <div className="bg-zinc-100 rounded-lg group-hover:bg-zinc-50 transition-colors p-1">
                    <img 
                      src={item.imageUrl} 
                      alt="Description Stimulus" 
                      className="rounded shadow-inner w-full aspect-video object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
