import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { generateTherapistReport } from '../utils/pdfGenerator';
import type { DiaryEntry, AppSettings, TherapistReportOptions } from '../types';
import { XIcon, ShieldCheckIcon, LoadingSpinner, DocumentDownloadIcon, AtSymbolIcon, LinkIcon } from './Icons';
import { MoodChart } from './MoodChart';

interface TherapistModeModalProps {
    isOpen: boolean;
    onClose: () => void;
    entries: DiaryEntry[];
    theme: AppSettings['theme'];
}

const today = new Date().toISOString().split('T')[0];

const TherapistModeModal: React.FC<TherapistModeModalProps> = ({ isOpen, onClose, entries, theme }) => {
    const [options, setOptions] = useState<TherapistReportOptions>({
        startDate: '',
        endDate: today,
        includeEntries: true,
        includeSummaries: true,
        includeChart: true,
        isAnonymous: false,
        shareMethod: 'download',
        therapistEmail: '',
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            const entryDate = entry.timestamp.split('T')[0];
            const inRange =
                (!options.startDate || entryDate >= options.startDate) &&
                (!options.endDate || entryDate <= options.endDate);
            return inRange;
        }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [entries, options.startDate, options.endDate]);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            let chartImage: string | undefined = undefined;
            if (options.includeChart && chartRef.current && filteredEntries.length > 1) {
                const canvas = await html2canvas(chartRef.current, { 
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    scale: 2 
                });
                chartImage = canvas.toDataURL('image/png', 1.0);
            }
            
            if (options.shareMethod === 'download') {
                await generateTherapistReport(options, filteredEntries, chartImage);
            } else {
                // Placeholder for email/link logic
                alert(`${options.shareMethod} sharing is coming soon!`);
            }
            
        } catch (error) {
            console.error("Failed to generate report:", error);
            alert("Sorry, an error occurred while generating the report.");
        } finally {
            setIsGenerating(false);
            onClose();
        }
    };

    const handleOptionChange = (field: keyof TherapistReportOptions, value: any) => {
        setOptions(prev => ({ ...prev, [field]: value }));
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    };

    const shareOptions = [
      { id: 'download', label: 'Download PDF', icon: DocumentDownloadIcon },
      { id: 'email', label: 'Email', icon: AtSymbolIcon },
      { id: 'link', label: 'Secure Link', icon: LinkIcon },
    ];

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white dark:bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center">
                  <ShieldCheckIcon className="mr-2 text-green-500" />
                  Therapist Report Generator
                </h2>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                {/* Step 1: Date Range */}
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">1. Select Date Range</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
                      <input type="date" id="startDate" value={options.startDate} onChange={e => handleOptionChange('startDate', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-slate-700"/>
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">End Date</label>
                      <input type="date" id="endDate" max={today} value={options.endDate} onChange={e => handleOptionChange('endDate', e.target.value)}
                        className="w-full mt-1 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-slate-700"/>
                    </div>
                  </div>
                </fieldset>

                {/* Step 2: Content Options */}
                <fieldset>
                   <legend className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">2. Choose Content to Include</legend>
                   <div className="space-y-2">
                       <Checkbox id="includeEntries" checked={options.includeEntries} onChange={v => handleOptionChange('includeEntries', v)} label="Full journal entries"/>
                       <Checkbox id="includeSummaries" checked={options.includeSummaries} onChange={v => handleOptionChange('includeSummaries', v)} label="AI-generated summaries"/>
                       <Checkbox id="includeChart" checked={options.includeChart} onChange={v => handleOptionChange('includeChart', v)} label="Visual mood chart"/>
                   </div>
                </fieldset>
                
                 {/* Step 3: Anonymity */}
                <fieldset>
                   <legend className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">3. Privacy</legend>
                    <Checkbox id="isAnonymous" checked={options.isAnonymous} onChange={v => handleOptionChange('isAnonymous', v)} label="Anonymize report (removes your name and personal details)"/>
                </fieldset>

                 {/* Step 4: Share Method */}
                <fieldset>
                    <legend className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">4. Select Sharing Method</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                         {shareOptions.map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => handleOptionChange('shareMethod', id)}
                                className={`flex items-center justify-center text-sm p-2.5 rounded-md border-2 transition-colors ${options.shareMethod === id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/40' : 'border-slate-300 dark:border-slate-600 hover:border-brand-400 dark:hover:border-brand-500'}`}
                            >
                                <Icon className="h-5 w-5 mr-2"/>
                                {label}
                            </button>
                         ))}
                    </div>
                    <AnimatePresence>
                        {options.shareMethod === 'email' && (
                            <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="mt-4 overflow-hidden">
                                <label htmlFor="therapistEmail" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Therapist's Email</label>
                                <input type="email" id="therapistEmail" placeholder="therapist@example.com" value={options.therapistEmail} onChange={e => handleOptionChange('therapistEmail', e.target.value)}
                                    className="w-full mt-1 px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-slate-700"/>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </fieldset>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">{filteredEntries.length} entries selected.</p>
                <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating || filteredEntries.length === 0}
                    className="flex items-center justify-center bg-green-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? <><LoadingSpinner/> Generating...</> : 'Generate Report'}
                </button>
              </div>
            </motion.div>
            {/* Off-screen container for chart rendering */}
            <div ref={chartRef} style={{ position: 'absolute', left: '-9999px', width: '700px', height: '350px', padding: '1rem', background: theme === 'dark' ? '#1e293b' : '#ffffff' }}>
                 {options.includeChart && filteredEntries.length > 1 && <MoodChart data={filteredEntries} theme={theme} />}
            </div>
          </div>
        )}
      </AnimatePresence>
    );
};

const Checkbox: React.FC<{id: string, checked: boolean, onChange: (checked: boolean) => void, label: string}> = ({ id, checked, onChange, label }) => (
    <div className="flex items-center">
        <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-brand-600 focus:ring-brand-500 bg-slate-100 dark:bg-slate-700"
        />
        <label htmlFor={id} className="ml-2 text-sm text-slate-700 dark:text-slate-200">{label}</label>
    </div>
);


export default TherapistModeModal;