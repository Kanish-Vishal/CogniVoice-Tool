import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BrainCircuit, History, Info, Activity, Database, AlertCircle, Quote, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from './components/AudioRecorder';
import { AnalysisReport } from './components/AnalysisReport';
import { SamplePrompts } from './components/SamplePrompts';
import { MemoryJournal } from './components/MemoryJournal';
import { analyzeSpeech } from './lib/gemini';
import { AnalysisResult, HistoryItem } from './types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { translations } from './lib/translations';

import { cn } from '@/lib/utils';

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  const statusMessages = [
    'Listening to patterns...',
    'Analyzing linguistic richness...',
    'Checking vocal stability...',
    'Comparing with research data...',
    'Finalizing your report...'
  ];
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('assess');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showResearch, setShowResearch] = useState(false);

  const t = translations[selectedLanguage] || translations.English;

  const languages = [
    { id: 'English', label: 'English' },
    { id: 'Mandarin', label: '华语 (Mandarin)' },
    { id: 'Malay', label: 'Bahasa Melayu (Malay)' },
    { id: 'Tamil', label: 'தமிழ் (Tamil)' },
    { id: 'Hokkien', label: '福建话 (Hokkien)' },
    { id: 'Cantonese', label: '广东话 (Cantonese)' },
    { id: 'Teochew', label: '潮州话 (Teochew)' }
  ];

  const handleRecordingComplete = async (base64Audio: string, mimeType: string) => {
    setIsAnalyzing(true);
    setAnalysisStatus(statusMessages[0]);
    const statusInterval = setInterval(() => {
      setAnalysisStatus(prev => {
        const idx = statusMessages.indexOf(prev);
        return statusMessages[(idx + 1) % statusMessages.length];
      });
    }, 4000);

    try {
      const analysis = await analyzeSpeech(base64Audio, mimeType, selectedLanguage);
      clearInterval(statusInterval);
      setCurrentResult(analysis);
      
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleString(),
        result: analysis,
        transcript: (analysis as any).transcript
      };
      
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Analysis failed. Please check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 selection:bg-zinc-200">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <BrainCircuit className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">{t.title}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <TabsList className="bg-zinc-100 p-1 rounded-full w-fit">
              <TabsTrigger value="assess" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BrainCircuit className="mr-2 h-4 w-4" />
                {t.assessTab}
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <History className="mr-2 h-4 w-4" />
                {t.historyTab}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Assessment Tab */}
          <TabsContent value="assess" className="mt-0">
            <AnimatePresence mode="wait">
              {!currentResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2 mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900">{t.subtitle}</h1>
                    <p className="text-zinc-500 text-lg">{t.description}</p>
                  </div>

                  <div className="flex flex-col items-center gap-2 mb-4">
                    <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">{t.langLabel}</label>
                    <div className="flex flex-wrap justify-center gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setSelectedLanguage(lang.id)}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
                            selectedLanguage === lang.id 
                              ? "bg-zinc-900 text-white border-zinc-900" 
                              : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                          )}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <AudioRecorder onRecordingComplete={handleRecordingComplete} isAnalyzing={isAnalyzing} analysisStatus={analysisStatus} t={t} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-1 space-y-6">
                      <SamplePrompts t={t} />
                      <div className="grid grid-cols-1 gap-4">
                        <Card className="bg-white border-zinc-200">
                          <CardContent className="pt-6 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <Info className="text-blue-600 h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-semibold text-sm">{t.howItWorks}</p>
                              <p className="text-xs text-zinc-500 leading-relaxed">
                                {t.howItWorksDesc}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-white border-zinc-200">
                          <CardContent className="pt-6 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                              <AlertCircle className="text-amber-600 h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-semibold text-sm">{t.researchPromptTitle}</p>
                              <p className="text-xs text-zinc-500 leading-relaxed">
                                {t.researchPromptDesc}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">{t.reportTitle}</h2>
                    <button 
                      onClick={() => setCurrentResult(null)}
                      className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
                    >
                      {t.newAssessment}
                    </button>
                  </div>
                  <AnalysisReport result={currentResult} t={t} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Persistent Content Below Recorder/Report */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div id="memory-journal">
                  <MemoryJournal t={t} language={selectedLanguage} />
                </div>
              </div>
              
              <div className="md:col-span-1">
                {/* Research Segment Toggle - Moved inside persistent area */}
                <div className="flex flex-col items-center justify-start h-full">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowResearch(!showResearch)}
                    className="text-zinc-500 hover:text-zinc-900 font-bold uppercase text-[10px] tracking-widest gap-2 bg-zinc-50/50 w-full rounded-2xl py-8"
                  >
                    {showResearch ? t.hideResearch || 'Hide Research' : t.viewResearch || 'Show Research & Science'}
                    <motion.div animate={{ rotate: showResearch ? 180 : 0 }}>
                      <Activity size={12} />
                    </motion.div>
                  </Button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showResearch && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden w-full pb-12"
                >
                  <div className="pt-12 space-y-12">
                    <section className="space-y-4 text-left">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Info size={20} className="text-zinc-400" />
                        {t.scientificFoundations}
                      </h3>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        {t.scientificFoundationsDesc}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { title: t.vocabularyVariety, desc: t.vocabularyVarietyDesc },
                          { title: t.meaningfulness, desc: t.meaningfulnessDesc },
                          { title: t.sentenceStyle, desc: t.sentenceStyleDesc },
                          { title: t.speechSmoothness, desc: t.speechSmoothnessDesc }
                        ].map((item, idx) => (
                          <Card key={idx} className="bg-zinc-900 border-none">
                            <CardContent className="pt-4">
                              <span className="text-zinc-400 font-mono text-[10px] uppercase">{t.indicator}</span>
                              <h4 className="text-white font-bold mb-1">{item.title}</h4>
                              <p className="text-zinc-400 text-xs">{item.desc}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4 text-left">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Database className="h-5 w-5 text-zinc-400" />
                        {t.sourceDatasets}
                      </h3>
                      <div className="space-y-4">
                        <div className="p-5 bg-white border rounded-2xl shadow-sm">
                          <h4 className="font-bold text-zinc-900 mb-2">Pitt Corpus & ADReSS Challenge</h4>
                          <p className="text-sm text-zinc-500 mb-4">
                            {t.sourceDatasetsDesc}
                          </p>
                          <div className="flex gap-2">
                            <Badge variant="outline">ML Benchmark</Badge>
                            <Badge variant="outline">Advanced Standards</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Alert>
                        <Quote className="h-4 w-4" />
                        <AlertTitle>{t.scientificContext}</AlertTitle>
                        <AlertDescription className="text-xs">
                          {t.scientificContextDesc}
                        </AlertDescription>
                      </Alert>
                    </section>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>{t.historyTitle}</CardTitle>
                <CardDescription>{t.historyDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 italic">{t.noHistory}</div>
                ) : (
                  <div className="space-y-4">
                    {history.map(item => (
                      <div key={item.id} className="p-4 border rounded-xl hover:bg-zinc-50 transition-colors group cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-sm">{item.date}</p>
                            <p className="text-xs text-zinc-500">{t.riskIndicator}: {item.result.riskScore}%</p>
                          </div>
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            item.result.riskScore < 30 ? "bg-emerald-500" : 
                            item.result.riskScore < 60 ? "bg-amber-500" : "bg-rose-500"
                          )} />
                        </div>
                        {item.transcript && (
                          <div className="mt-2 pl-3 border-l-2 border-zinc-100">
                            <p className="text-xs text-zinc-400 line-clamp-2 italic">"{item.transcript}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// No local cn needed anymore
