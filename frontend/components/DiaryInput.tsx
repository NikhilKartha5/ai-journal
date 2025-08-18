import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $getSelection } from 'lexical';
import './lexical.css';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { MicIcon, StopCircleIcon, SendIcon, LoadingSpinner } from './Icons';

interface DiaryInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const DiaryInput: React.FC<DiaryInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState(''); // Plain text content
  const { t } = useTranslation();
  const { transcript, isListening, startListening, stopListening, error, isSupported } = useSpeechRecognition();
  const baseTextRef = useRef('');

  useEffect(() => {
    if (isListening) {
      setText((baseTextRef.current ? `${baseTextRef.current} ${transcript}` : transcript));
    }
  }, [transcript, isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text);
      setText('');
    }
  };
  
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      baseTextRef.current = text;
      startListening();
    }
  };

  const initialConfig = {
    namespace: 'DiaryEditor',
    theme: {},
    onError(error: Error) {
      throw error;
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={<ContentEditable className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow duration-200 dark:placeholder-slate-400 p-4 pr-12 h-40" />}
            placeholder={<div className="text-slate-400 px-4 pt-4">{t('diaryInput.placeholder')}</div>}
            ErrorBoundary={({ children, error }) => error ? <div className="text-red-600">Error: {error.message}</div> : children}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={editorState => {
            editorState.read(() => {
              const root = $getRoot();
              setText(root.getTextContent());
            });
          }} />
        </LexicalComposer>
        <button
          type="button"
          onClick={handleMicClick}
          className="absolute top-3 right-3 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
          aria-label={isListening ? t('diaryInput.stopRecording') : t('diaryInput.startRecording')}
          disabled={isLoading || !isSupported}
        >
          {isListening ? <StopCircleIcon className="text-red-500 animate-pulse" /> : <MicIcon />}
        </button>
      </div>
      {!isSupported && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error || t('diaryInput.speechUnsupported')}
        </p>
      )}
      {error && isSupported && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        className="w-full flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
        disabled={isLoading || !text.trim()}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            {t('diaryInput.analyzing')}
          </>
        ) : (
          <>
            <SendIcon />
            {t('diaryInput.analyzeButton')}
          </>
        )}
      </button>
    </form>
  );
};