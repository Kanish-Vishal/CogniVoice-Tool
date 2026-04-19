import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, Play, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (base64Audio: string, mimeType: string) => void;
  isAnalyzing: boolean;
  t: any;
}

export function AudioRecorder({ onRecordingComplete, isAnalyzing, t }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording Error:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Content = reader.result as string;
      const base64Data = base64Content.split(',')[1];
      const mimeType = audioBlob.type;
      onRecordingComplete(base64Data, mimeType);
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-zinc-900">{t.recorderTitle}</h3>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto">
          {t.recorderDesc}
        </p>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {!audioUrl ? (
            <motion.div
              key="recording"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
                isRecording ? "bg-red-500 animate-pulse scale-110 shadow-lg shadow-red-200" : "bg-zinc-900"
              )}>
                {isRecording ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={stopRecording}
                    className="w-full h-full text-white hover:bg-transparent"
                  >
                    <Square fill="currentColor" size={32} />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={startRecording}
                    className="w-full h-full text-white hover:bg-transparent"
                  >
                    <Mic size={32} />
                  </Button>
                )}
              </div>
              <p className={cn(
                "font-mono text-2xl font-bold transition-colors",
                isRecording ? "text-red-500" : "text-zinc-400"
              )}>
                {formatTime(recordingTime)}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <audio src={audioUrl} controls className="w-full max-w-sm mb-2" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetRecording} disabled={isAnalyzing}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t.discard}
                </Button>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing}
                  className="bg-zinc-900 hover:bg-zinc-800"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.analyzing}
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      {t.beginAnalysis}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
