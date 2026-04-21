import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollText, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { expandJournal } from '../lib/gemini';

export function MemoryJournal({ t, language }: { t: any, language: string }) {
  const [entry, setEntry] = useState('');
  const [expansion, setExpansion] = useState<string | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleExpand = async () => {
    if (!entry.trim() || entry.length < 10) return;
    
    setIsExpanding(true);
    try {
      const response = await expandJournal(entry, language);
      setExpansion(response);
    } catch (err) {
      console.error(err);
      alert("Failed to expand memory. Please try again.");
    } finally {
      setIsExpanding(false);
    }
  };

  const labels = t.memoryJournal || {
    title: "Memory Journal",
    desc: "Write your thoughts below.",
    placeholder: "Write here...",
    expand: "Expand",
    expanding: "Working..."
  };

  return (
    <Card className="bg-white border-zinc-200 overflow-hidden shadow-sm flex flex-col h-full">
      <CardHeader className="bg-zinc-50 border-b p-4">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-900">
            {labels.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col gap-4">
        <p className="text-xs text-zinc-500 leading-relaxed">
          {labels.desc}
        </p>

        <div className="flex-1 flex flex-col gap-3">
          <Textarea 
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder={labels.placeholder}
            className="flex-1 min-h-[120px] text-sm resize-none focus-visible:ring-emerald-500/20"
          />
          
          <Button 
            onClick={handleExpand} 
            disabled={isExpanding || entry.length < 10}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 transition-all hover:shadow-lg hover:shadow-emerald-100"
          >
            {isExpanding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {labels.expanding}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {labels.expand}
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {expansion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 mt-2 relative group mt-4">
                <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap italic">
                  {expansion}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setExpansion(null)}
                >
                  <RefreshCw size={12} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
