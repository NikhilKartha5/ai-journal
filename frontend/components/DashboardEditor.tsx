import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $getSelection, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW, $createTextNode } from 'lexical';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { MicIcon, StopCircleIcon } from '../components/Icons'; // adjust path if needed
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import './lexical.css';

interface DashboardEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DashboardEditor: React.FC<DashboardEditorProps> = ({ value, onChange, placeholder = 'Write your note...', disabled }) => {
  const initialConfig = React.useMemo(() => ({
    namespace: 'DashboardEditor',
    editable: !disabled,
    theme: {
      text: {
        bold: 'font-semibold',
        italic: 'italic',
        underline: 'underline underline-offset-2'
      }
    },
    onError(error: Error) { throw error; }
  }), [disabled]);

  const speech = useSpeechRecognition();

  // Toolbar plugin with speech controls
  const Toolbar: React.FC = () => {
    const [editor] = useLexicalComposerContext();
    const [formats, setFormats] = React.useState({ bold:false, italic:false, underline:false });
    const lastTranscriptRef = React.useRef('');

    React.useEffect(() => {
      return editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
        editor.getEditorState().read(() => {
          const selection: any = $getSelection();
          if (selection && selection.hasFormat) {
            setFormats({
              bold: selection.hasFormat('bold'),
              italic: selection.hasFormat('italic'),
              underline: selection.hasFormat('underline')
            });
          }
        });
        return false;
      }, COMMAND_PRIORITY_LOW);
    }, [editor]);

    // Append new transcript text while listening
    React.useEffect(() => {
      if (!speech.isListening) { lastTranscriptRef.current = speech.transcript; return; }
      const prev = lastTranscriptRef.current;
      const curr = speech.transcript;
      if (curr && curr.length > prev.length) {
        const diff = curr.slice(prev.length);
        if (diff.trim().length) {
          editor.update(() => {
            const root = $getRoot();
            const currentText = root.getTextContent();
            const needsSpace = currentText && !/\s$/.test(currentText);
            root.append($createTextNode((needsSpace ? ' ' : '') + diff));
          });
        }
        lastTranscriptRef.current = curr;
      }
    }, [speech.transcript, speech.isListening, editor]);

    const toggle = (fmt: 'bold'|'italic'|'underline') => editor.dispatchCommand(FORMAT_TEXT_COMMAND, fmt);
    const btnCls = (active:boolean) => `px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${active?'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-100':''}`;
    return (
      <div className="flex items-center gap-2 mb-2 bg-slate-900/5 dark:bg-slate-50/5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <button type="button" onClick={()=>toggle('bold')} className={btnCls(formats.bold)}>B</button>
        <button type="button" onClick={()=>toggle('italic')} className={btnCls(formats.italic)+ ' italic'}>I</button>
        <button type="button" onClick={()=>toggle('underline')} className={btnCls(formats.underline)+ ' underline'}>U</button>
        {speech.isSupported && (
          <button
            type="button"
            onClick={speech.isListening ? speech.stopListening : speech.startListening}
            className={`flex items-center gap-1 px-2 py-1 rounded transition text-xs ${speech.isListening ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
          >
            {speech.isListening ? <StopCircleIcon className="h-4 w-4"/> : <MicIcon className="h-4 w-4"/>}
            {speech.isListening ? 'Stop' : 'Voice'}
          </button>
        )}
        {speech.error && <span className="text-[10px] text-red-500 ml-2 truncate max-w-[120px]" title={speech.error}>{speech.error}</span>}
        <div className="ml-auto text-[10px] uppercase tracking-wide opacity-70">Draft</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="relative flex-1">
          <RichTextPlugin
            contentEditable={<ContentEditable className="ContentEditable custom-diary-editor bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow duration-200 dark:placeholder-slate-400 p-6 text-base leading-relaxed h-full min-h-[380px] overflow-y-auto shadow-sm hover:shadow-md" />}
            placeholder={<div className="pointer-events-none select-none text-slate-400 text-sm absolute left-6 top-6">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <OnChangePlugin onChange={editorState => {
          editorState.read(() => {
            const root = $getRoot();
            onChange(root.getTextContent());
          });
        }} />
      </LexicalComposer>
    </div>
  );
};
