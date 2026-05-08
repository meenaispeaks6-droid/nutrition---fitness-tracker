'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, X, Sparkles, Send } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

interface AIInputHubProps {
  onClose: () => void;
  onAnalysisStart: (type: 'photo' | 'voice' | 'text', data: any) => void;
}

export function AIInputHub({ onClose, onAnalysisStart }: AIInputHubProps) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<'text' | 'camera' | 'voice'>('text');
  const [recognition, setRecognition] = useState<any>(null);
  const [isNativeMobile, setIsNativeMobile] = useState(false);
  const [nativeSpeechAvailable, setNativeSpeechAvailable] = useState(false);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNativeMobile(native);

    if (native) {
      const checkNativeSpeech = async () => {
        try {
          const { available } = await SpeechRecognition.available();
          setNativeSpeechAvailable(available);
        } catch {
          setNativeSpeechAvailable(false);
        }
      };
      checkNativeSpeech();
      return;
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setInputText(prev => prev + event.results[i][0].transcript);
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const startListening = () => {
    if (isNativeMobile) {
      void (async () => {
        if (!nativeSpeechAvailable) {
          alert('Speech recognition is not available on this device.');
          return;
        }
        try {
          const permission = await SpeechRecognition.requestPermissions();
          if (permission.speechRecognition !== 'granted') {
            alert('Microphone permission is required for voice logging.');
            return;
          }

          setInputText('');
          await SpeechRecognition.removeAllListeners();
          await SpeechRecognition.addListener('partialResults', ({ matches }) => {
            setInputText(matches?.[0] || '');
          });
          await SpeechRecognition.addListener('listeningState', ({ status }) => {
            setIsListening(status === 'started');
          });

          await SpeechRecognition.start({
            language: 'en-US',
            maxResults: 1,
            partialResults: true,
            popup: false,
          });
          setIsListening(true);
        } catch {
          setIsListening(false);
        }
      })();
      return;
    }

    if (recognition) {
      setInputText('');
      recognition.start();
      setIsListening(true);
    } else {
      alert('Speech recognition not supported in this browser.');
    }
  };

  const stopListening = () => {
    if (isNativeMobile) {
      void (async () => {
        try {
          await SpeechRecognition.stop();
          await SpeechRecognition.removeAllListeners();
        } catch {
          // no-op
        }
        setIsListening(false);
        if (inputText.trim()) {
          onAnalysisStart('voice', inputText.trim());
        }
      })();
      return;
    }

    if (recognition) {
      recognition.stop();
      setIsListening(false);
      // Brief delay to ensure last bits are processed
      setTimeout(() => {
        if (inputText) {
          onAnalysisStart('voice', inputText);
        }
      }, 500);
    }
  };

  // Simulated waveform animation
  const [waveform, setWaveform] = useState([40, 70, 45, 90, 65, 80, 50, 60, 30, 85]);

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setWaveform(prev => prev.map(() => Math.floor(Math.random() * 60) + 20));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  const handleNativePhotoCapture = async (source: CameraSource) => {
    try {
      const photo = await CapacitorCamera.getPhoto({
        source,
        quality: 90,
        resultType: CameraResultType.Uri,
        correctOrientation: true,
      });

      if (!photo.webPath) {
        return;
      }

      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const extension = photo.format || 'jpeg';
      const file = new File(
        [blob],
        `meal-${Date.now()}.${extension}`,
        { type: blob.type || `image/${extension}` }
      );

      onAnalysisStart('photo', file);
    } catch {
      // User canceled or camera failed; keep UI open.
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed inset-x-6 bottom-24 z-[100] max-w-lg mx-auto glass-card rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-white/10"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-lg">AI Meal Logger</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/5 rounded-2xl">
          {(['text', 'camera', 'voice'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                mode === m ? 'bg-primary text-black shadow-lg' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="min-h-[200px] flex flex-col justify-center">
            {mode === 'camera' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 text-center"
              >
                {isNativeMobile ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => void handleNativePhotoCapture(CameraSource.Camera)}
                      className="w-full h-14 rounded-2xl gradient-primary text-black font-bold"
                    >
                      Capture Meal Photo
                    </button>
                    <button
                      onClick={() => void handleNativePhotoCapture(CameraSource.Photos)}
                      className="w-full h-12 rounded-2xl bg-white/10 border border-white/15 text-white font-semibold"
                    >
                      Choose from Gallery
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden group cursor-pointer">
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                      <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                        <Camera className="w-8 h-8 text-white/40 group-hover:text-primary transition-colors" />
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onAnalysisStart('photo', file);
                        }} 
                      />
                    </label>
                    <div className="absolute bottom-4 left-0 right-0 text-[10px] text-white/40 font-bold uppercase tracking-widest pointer-events-none">Tap to capture</div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">Snap a photo of your plate for instant analysis</p>
              </motion.div>
            )}

          {mode === 'voice' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 text-center py-4"
            >
              <div className="flex items-end justify-center gap-1.5 h-12">
                {waveform.map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isListening ? `${h}%` : '10%' }}
                    className="w-1.5 bg-primary rounded-full min-h-[4px]"
                  />
                ))}
              </div>
              
                <div className="flex flex-col items-center gap-4">
                  <motion.button
                    onPointerDown={startListening}
                    onPointerUp={stopListening}
                    onClick={() => {
                      if (isNativeMobile) {
                        if (isListening) {
                          stopListening();
                        } else {
                          startListening();
                        }
                      }
                    }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                      isListening ? 'bg-primary text-black glow-primary scale-110' : 'bg-white/5 text-primary hover:bg-white/10'
                    }`}
                  >
                    <Mic className="w-8 h-8" />
                  </motion.button>
                  <p className="text-sm font-medium text-white/60">
                    {isNativeMobile ? (isListening ? 'Tap to stop' : 'Tap to speak') : (isListening ? 'Recording...' : 'Hold to speak')}
                  </p>
                  {inputText && !isListening && (
                    <p className="text-xs text-primary/60 italic px-8">"{inputText}"</p>
                  )}
                </div>

            </motion.div>
          )}

          {mode === 'text' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tell me what you ate... e.g., 'A bowl of Greek yogurt with honey and almonds'"
                  className="w-full min-h-[120px] p-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all resize-none text-sm leading-relaxed"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && inputText) {
                      e.preventDefault();
                      onAnalysisStart('text', inputText);
                    }
                  }}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-[10px] text-white/20 font-medium">Press Enter to send</span>
                  <button 
                    disabled={!inputText}
                    onClick={() => onAnalysisStart('text', inputText)}
                    className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center disabled:opacity-50 disabled:bg-white/10 transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
