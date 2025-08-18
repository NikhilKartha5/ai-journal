import jsPDF from 'jspdf';
import type { DiaryEntry, TherapistReportOptions, AppSettings } from '../types';

export const generateTherapistReport = async (
    options: TherapistReportOptions,
    entries: DiaryEntry[],
    chartImage?: string
) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
    });
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 30;
    let y = margin;
    
    const addText = (text: string, x: number, currentY: number, options: any = {}) => {
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        doc.text(lines, x, currentY, options);
        return currentY + (lines.length * (options.fontSize || 12) * 1.2);
    };

    const checkPageBreak = (currentY: number) => {
        if (currentY > pageHeight - margin) {
            doc.addPage();
            return margin;
        }
        return currentY;
    };

    // --- Title Page ---
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Aura Diary Report', pageWidth / 2, y, { align: 'center' });
    y += 40;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    if (!options.isAnonymous) {
        doc.text('Generated for: User', margin, y);
        y += 20;
    }
    doc.text(`Report Period: ${new Date(options.startDate).toLocaleDateString()} - ${new Date(options.endDate).toLocaleDateString()}`, margin, y);
    y += 20;
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, margin, y);
    y += 40;

    doc.setFont('helvetica', 'bold');
    doc.text('Included Content:', margin, y);
    y += 15;
    doc.setFont('helvetica', 'normal');
    let contentList = [];
    if(options.includeEntries) contentList.push('Full journal entries');
    if(options.includeSummaries) contentList.push('AI-generated summaries');
    if(options.includeChart && chartImage) contentList.push('Mood chart visualization');
    doc.text(contentList.map(item => `- ${item}`).join('\n'), margin + 10, y);
    
    // --- Mood Chart ---
    if (options.includeChart && chartImage) {
        doc.addPage();
        y = margin;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Mood Chart', pageWidth / 2, y, { align: 'center' });
        y += 20;

        const imgProps = doc.getImageProperties(chartImage);
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        doc.addImage(chartImage, 'PNG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 20;
    }

    // --- Entries ---
    if (options.includeEntries || options.includeSummaries) {
        doc.addPage();
        y = margin;

        for (const entry of entries) {
            y = checkPageBreak(y);
            doc.setDrawColor(200); // Light grey
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 15;

            const entryDate = new Date(entry.timestamp);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(entryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), margin, y);
            y += 15;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100); // Grey text
            doc.text(`Time: ${entryDate.toLocaleTimeString()} | Mood Score: ${entry.analysis.sentimentScore}/10`, margin, y);
            doc.setTextColor(0); // Black text
            y += 20;

            if (options.includeSummaries) {
                y = checkPageBreak(y);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('AI Summary:', margin, y);
                y += 12;
                doc.setFont('helvetica', 'italic');
                y = addText(`"${entry.analysis.summary}"`, margin, y, { fontSize: 10 }) + 10;
                doc.setFont('helvetica', 'normal');
            }

            if (options.includeEntries) {
                y = checkPageBreak(y);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('Full Entry:', margin, y);
                y += 12;
                y = addText(entry.text, margin, y, { fontSize: 10 }) + 20;
            }
        }
    }

    doc.save('Aura_Therapist_Report.pdf');
};

// Simple full data export (entries + settings) to PDF instead of JSON
export const exportFullDataPdf = (entries: DiaryEntry[], settings: AppSettings) => {
        const doc = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 28;
        let y = margin;
        const addWrapped = (text: string, fontSize = 11, gap = 6) => {
                doc.setFontSize(fontSize);
                const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
                lines.forEach(line => {
                        if (y > pageHeight - margin) { doc.addPage(); y = margin; }
                        doc.text(line, margin, y);
                        y += fontSize * 1.2;
                });
                y += gap;
        };
        doc.setFont('helvetica','bold');
        doc.setFontSize(20);
        doc.text('Aura Journal Export', pageWidth/2, y, { align: 'center' });
        y += 30;
        doc.setFont('helvetica','normal');
        addWrapped(`Generated: ${new Date().toLocaleString()}`, 10, 10);
        addWrapped('This PDF contains your saved settings and all diary entries.', 11, 14);
        // Settings
        doc.setFont('helvetica','bold');
        doc.setFontSize(14); doc.text('Settings', margin, y); y += 18; doc.setFont('helvetica','normal');
        addWrapped(`Theme: ${settings.theme}`);
        addWrapped(`Reminders: ${settings.reminders.enabled ? 'Enabled at '+settings.reminders.time : 'Disabled'}`);
        // Summary stats
        doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.text('Summary', margin, y); y += 18; doc.setFont('helvetica','normal');
        addWrapped(`Total Entries: ${entries.length}`);
        if (entries.length) {
                const avg = (entries.reduce((s,e)=>s+e.analysis.sentimentScore,0)/entries.length).toFixed(2);
                addWrapped(`Average Mood Score: ${avg}`);
        }
        // Entries
        doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.text('Entries', margin, y); y += 20; doc.setFont('helvetica','normal');
        entries.sort((a,b)=> new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .forEach(entry => {
                if (y > pageHeight - margin) { doc.addPage(); y = margin; }
                const date = new Date(entry.timestamp);
                doc.setFont('helvetica','bold'); doc.setFontSize(12);
                doc.text(date.toLocaleString(), margin, y); y += 16;
                doc.setFont('helvetica','normal'); doc.setFontSize(10);
                addWrapped(`Mood: ${entry.analysis.sentimentScore}/10 | Emotions: ${entry.analysis.emotions.join(', ')}`,10,4);
                addWrapped('Summary: '+entry.analysis.summary,10,4);
                addWrapped(entry.text,10,12);
            });
        doc.save('Aura_Full_Export.pdf');
};
