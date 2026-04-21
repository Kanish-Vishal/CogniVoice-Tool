import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SCRAMBLED_WORDS = [
  { word: 'GARDEN', hint: 'A place where flowers grow' },
  { word: 'MORNING', hint: 'The start of the day' },
  { word: 'FAMILY', hint: 'The people you live with' },
  { word: 'HEALTH', hint: 'Your well-being' },
  { word: 'MEMORY', hint: 'What you use to remember things' }
];

export function CognitiveGames({ t }: { t: any }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [scrambled, setScrambled] = useState('');

  const scramble = (word: string) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  useEffect(() => {
    setScrambled(scramble(SCRAMBLED_WORDS[currentIdx].word));
    setUserInput('');
    setIsCorrect(null);
  }, [currentIdx]);

  const handleCheck = () => {
    if (userInput.toUpperCase() === SCRAMBLED_WORDS[currentIdx].word) {
      setIsCorrect(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % SCRAMBLED_WORDS.length);
      }, 1500);
    } else {
      setIsCorrect(false);
    }
  };

  return (
    <Card className="bg-white border-zinc-200 overflow-hidden shadow-sm">
      <CardHeader className="bg-zinc-50 border-b p-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-900">
            {t.brainExercises || 'Brain Exercises'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {t.games?.wordScramble?.title || 'Word Scramble'}
            </span>
            <motion.h4 
              key={scrambled}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-black tracking-widest text-zinc-900 font-mono"
            >
              {scrambled}
            </motion.h4>
            <p className="text-xs text-zinc-500 italic">
              Hint: {SCRAMBLED_WORDS[currentIdx].hint}
            </p>
          </div>

          <div className="flex gap-2">
            <Input 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Your answer..."
              className="font-mono uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
            <Button onClick={handleCheck} className="bg-zinc-900">
              Check
            </Button>
          </div>

          <AnimatePresence>
            {isCorrect === true && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-emerald-600 font-bold text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Correct! Well done.
              </motion.div>
            )}
            {isCorrect === false && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-rose-500 font-bold text-sm"
              >
                Not quite. Try again!
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-[10px] uppercase font-bold text-zinc-400"
            onClick={() => setCurrentIdx((prev) => (prev + 1) % SCRAMBLED_WORDS.length)}
          >
            <RotateCcw className="h-3 w-3 mr-2" />
            Skip Word
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
