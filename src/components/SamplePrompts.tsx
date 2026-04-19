import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, ChevronDown, ChevronUp, Sparkles, BookOpen, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SamplePrompts({ t }: { t: any }) {
  const [imageExpanded, setImageExpanded] = useState(false);

  const localizedPrompts = [
    {
      idx: 0,
      category: 'Picture Description',
      icon: <Sparkles className="h-4 w-4" />,
      title: t.prompts.stimulus.title,
      description: t.prompts.stimulus.desc,
      imageUrl: 'https://raw.githubusercontent.com/allisonnicole/CookieTheft/master/CookieTheft.png'
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
          <Card key={item.idx} className="bg-white border-zinc-200 hover:border-zinc-300 transition-all group flex flex-col">
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
                  <>
                    <AnimatePresence>
                      {imageExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-2 bg-zinc-900 rounded-lg mb-3">
                            <img 
                              src={item.imageUrl} 
                              alt="Cookie Theft Picture" 
                              className="rounded w-full h-auto"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/cognitive/800/600";
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[10px] h-8 uppercase font-bold tracking-widest hover:bg-zinc-100"
                      onClick={() => setImageExpanded(!imageExpanded)}
                    >
                      {imageExpanded ? (
                        <>
                          <ChevronUp className="mr-2 h-3 w-3" />
                          {t.discard}
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-2 h-3 w-3" />
                          {t.reportTitle === 'Analysis Report' ? 'View Stimulus' : (t.reportTitle === '分析报告' ? '查看刺激物' : 'View Stimulus')}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
