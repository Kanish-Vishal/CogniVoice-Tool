import React from 'react';
import { AnalysisResult } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Brain, ScrollText, Mic2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts';

import { cn } from '@/lib/utils';

interface AnalysisReportProps {
  result: AnalysisResult;
  t: any;
}

export function AnalysisReport({ result, t }: AnalysisReportProps) {
  const radarData = [
    { subject: t.meaningfulness || 'Meaning', A: result.linguisticMetrics.semanticDensity * 100 },
    { subject: t.sentenceStyle || 'Sentence', A: result.linguisticMetrics.syntacticComplexity * 100 },
    { subject: t.vocabularyVariety || 'Words', A: result.linguisticMetrics.lexicalRichness * 100 },
    { subject: t.speechSmoothness || 'Flow', A: (1 - result.linguisticMetrics.disfluencyRate) * 100 },
    { subject: t.voiceSteady || 'Voice', A: result.vocalCharacteristics.toneStability * 100 },
  ];

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-600 bg-emerald-50';
    if (score < 60) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return t.riskLow || 'Normal patterns';
    if (score < 60) return t.riskMedium || 'Some changes';
    return t.riskHigh || 'Significant signs';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Gauge */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-500">{t.analysisSummary}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center p-6 pt-0">
            <div className="relative w-48 h-48 mb-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-zinc-100"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={565.5}
                  strokeDashoffset={565.5 - (565.5 * result.riskScore) / 100}
                  className={cn(
                    "transition-all duration-1000",
                    result.riskScore < 30 ? "text-emerald-500" : 
                    result.riskScore < 60 ? "text-amber-500" : "text-rose-500"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{result.riskScore}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-tighter font-bold">{t.indicator}</span>
              </div>
            </div>
            <Badge className={cn("mb-2", getRiskColor(result.riskScore))}>
              {getRiskLabel(result.riskScore)}
            </Badge>
            {result.language && (
              <div className="mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <Mic2 size={10} />
                {t.languageDetected}: {result.language}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metrics Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-500">{t.patternSignature}</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e4e4e7" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#71717a' }} />
                <Radar
                name="Score"
                dataKey="A"
                stroke="#18181b"
                fill="#18181b"
                fillOpacity={0.1}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linguistic Findings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-zinc-900" />
              <CardTitle>{t.linguisticMarkers}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>{t.meaningfulness || 'Meaningfulness'}</span>
                <span>{(result.linguisticMetrics.semanticDensity * 100).toFixed(0)}%</span>
              </div>
              <Progress value={result.linguisticMetrics.semanticDensity * 100} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>{t.sentenceStyle || 'Sentence style'}</span>
                <span>{(result.linguisticMetrics.syntacticComplexity * 100).toFixed(0)}%</span>
              </div>
              <Progress value={result.linguisticMetrics.syntacticComplexity * 100} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>{t.stumbles || 'Stumbles'}</span>
                <span>{(result.linguisticMetrics.disfluencyRate * 100).toFixed(0)}%</span>
              </div>
              <Progress value={result.linguisticMetrics.disfluencyRate * 100} className="h-1.5 bg-rose-50" />
            </div>
          </CardContent>
        </Card>

        {/* Key Findings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-zinc-900" />
              <CardTitle>{t.detailedObservations}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-zinc-600">
                  <span className="shrink-0 text-zinc-300">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Alert className="bg-zinc-900 text-white border-none shadow-xl">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <AlertTitle className="font-bold">{t.recommendations}</AlertTitle>
        <AlertDescription className="text-zinc-300">
          <ul className="list-disc list-inside mt-2 space-y-1">
            {(result.riskScore < 30 
              ? t.tailoredRecs?.low 
              : result.riskScore < 60 
                ? t.tailoredRecs?.medium 
                : t.tailoredRecs?.high)?.map((rec: string, idx: number) => (
              <li key={idx}>{rec}</li>
            )) || result.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      {/* Brain Training Section */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-zinc-900" />
            {t.brainExercises || 'Brain Training'}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-zinc-50 border-dashed border-2">
            <CardContent className="pt-6">
              <h4 className="font-bold text-sm mb-2">Mental Stimulation Tips</h4>
              <ul className="text-xs text-zinc-500 space-y-2">
                <li>• Try reading a book in a different language then translating one paragraph.</li>
                <li>• Practice counting backwards from 100 by increments of 7 (e.g., 100, 93, 86...).</li>
                <li>• Socialize daily—conversation is one of the best cognitive exercises.</li>
              </ul>
            </CardContent>
          </Card>
          <div className="bg-white">
            <p className="text-sm text-zinc-500 mb-4 italic">
              "Regular cognitive exercise can improve mental agility and build cognitive reserve."
            </p>
            <Button 
              variant="outline" 
              className="w-full text-xs font-bold uppercase tracking-wider"
              onClick={() => {
                const element = document.getElementById('memory-journal');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {t.memoryJournal.start || 'Start Memory Journaling'}
            </Button>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <Alert variant="destructive" className="bg-rose-50 border-rose-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-rose-900 font-bold">{t.medicalDisclaimer}</AlertTitle>
        <AlertDescription className="text-rose-800 text-xs">
          {t.medicalDisclaimerDesc}
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Helper to handle class merging removed
