export interface AnalysisResult {
  riskScore: number; // 0 to 100
  linguisticMetrics: {
    semanticDensity: number;
    syntacticComplexity: number;
    lexicalRichness: number;
    disfluencyRate: number;
  };
  vocalCharacteristics: {
    pauseFrequency: number;
    speechRate: number;
    toneStability: number;
  };
  keyFindings: string[];
  recommendations: string[];
  disclaimer: string;
  language?: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  result: AnalysisResult;
  transcript?: string;
}
