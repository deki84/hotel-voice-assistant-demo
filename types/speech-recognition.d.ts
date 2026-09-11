export {};

declare global {
  interface MinimalSpeechRecognitionEvent extends Event {
    results: { [index: number]: { [index: number]: { transcript: string } } };
  }

  interface MinimalSpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    onresult: ((event: MinimalSpeechRecognitionEvent) => void) | null;
    start: () => void;
  }

  interface Window {
    SpeechRecognition?: new () => MinimalSpeechRecognition;
    webkitSpeechRecognition?: new () => MinimalSpeechRecognition;
  }
}
