import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimText: string;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  clear: () => void;
  appendText: (text: string) => void;
}

export const usePulseSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    return recognition;
  }, [isSupported]);

  const start = useCallback(() => {
    if (!isSupported) return;
    const recognition = createRecognition();
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) setTranscript(prev => prev + final);
      setInterimText(interim);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported, createRecognition]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      const ref = recognitionRef.current;
      recognitionRef.current = null;
      ref.onend = null;
      ref.stop();
      setIsListening(false);
      setInterimText('');
    }
  }, []);

  const clear = useCallback(() => {
    setTranscript('');
    setInterimText('');
  }, []);

  const appendText = useCallback((text: string) => {
    setTranscript(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + text + ' ');
  }, []);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { isListening, transcript, interimText, isSupported, start, stop, clear, appendText };
};
