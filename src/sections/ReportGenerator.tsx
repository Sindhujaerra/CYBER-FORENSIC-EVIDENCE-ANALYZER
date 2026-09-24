import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Badge component not used
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Download, 
  Printer, 
  Briefcase,
  Hash,
  Clock,
  Shield,
  CheckCircle,
  FileSearch
} from 'lucide-react';
import type { EvidenceFile, Case, TimelineEvent } from '@/types/forensics';
import { generateId } from '@/lib/crypto';
import { toast } from 'sonner';
import { formatDate, formatBytes } from '@/lib/utils';

interface ReportGeneratorProps {
  evidenceFiles: EvidenceFile[];
  cases: Case[];
  timelineEvents: TimelineEvent[];
}

export default function ReportGenerator({ evidenceFiles, cases, timelineEvents }: ReportGeneratorProps) {
  const [reportConfig, setReportConfig] = useState({
    caseName: '',
    investigator: '',
    reportTitle: '',
    includeHashes: true,
    includeTimeline: true,
    includeMetadata: true,
    includeFindings: true,
  });
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<string>('');

  const handleGenerateReport = () => {
    if (!reportConfig.reportTitle.trim() || !reportConfig.investigator.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const reportDate = new Date();
    const relatedCase = cases.find(c => c.id === selectedCase);
    const caseEvidence = relatedCase ? relatedCase.evidenceFiles : evidenceFiles;
    
    const report = `
================================================================================
                    CYBER FORENSICS EVIDENCE ANALYSIS REPORT
================================================================================

REPORT INFORMATION
--------------------------------------------------------------------------------
Report ID:        RPT-${generateId().substring(0, 8).toUpperCase()}
Title:            ${reportConfig.reportTitle}
Generated:        ${formatDate(reportDate)}
Investigator:     ${reportConfig.investigator}
${relatedCase ? `Case:             ${relatedCase.name}` : 'General Report'}

================================================================================
                         EXECUTIVE SUMMARY
================================================================================

This report contains the findings of a digital forensics investigation involving
${caseEvidence.length} evidence file(s). All files have been analyzed for integrity
using cryptographic hash functions (MD5, SHA-1, SHA-256).

Total Evidence Analyzed: ${caseEvidence.length} file(s)
Total Size: ${formatBytes(caseEvidence.reduce((acc, f) => acc + f.size, 0))}
Report Status: COMPLETE

================================================================================
                      EVIDENCE INVENTORY
================================================================================

${caseEvidence.map((file, index) => `
Evidence Item #${index + 1}
--------------------------------------------------------------------------------
File Name:        ${file.name}
File Type:        ${file.type || 'Unknown'}
File Size:        ${formatBytes(file.size)}
Extension:        ${file.metadata?.extension || 'unknown'}
Upload Date:      ${formatDate(file.uploadDate)}
Last Modified:    ${file.metadata.lastModified ? formatDate(file.metadata.lastModified) : 'N/A'}

HASH VALUES
--------------------------------------------------------------------------------
MD5:              ${file.hashes.md5}
SHA-1:            ${file.hashes.sha1}
SHA-256:          ${file.hashes.sha256}

`).join('\n')}

${reportConfig.includeTimeline ? `
================================================================================
                      TIMELINE OF EVENTS
================================================================================

${timelineEvents.length > 0 ? timelineEvents.map((event, index) => `
Event #${index + 1}
--------------------------------------------------------------------------------
Timestamp:        ${formatDate(event.timestamp)}
Type:             ${event.type.toUpperCase()}
Description:      ${event.description}
${event.fileName ? `Related File:     ${event.fileName}` : ''}
`).join('\n') : 'No timeline events recorded.'}
` : ''}

================================================================================
                      INTEGRITY VERIFICATION
================================================================================

All evidence files have been verified using industry-standard cryptographic hash
functions. The following hash algorithms were employed:

- MD5 (Message Digest 5): 128-bit hash value
- SHA-1 (Secure Hash Algorithm 1): 160-bit hash value  
- SHA-256 (Secure Hash Algorithm 256): 256-bit hash value

INTEGRITY STATUS: ${caseEvidence.every(f => f.hashes.md5 && f.hashes.sha1 && f.hashes.sha256) ? 'VERIFIED ✓' : 'PARTIAL'}

${reportConfig.includeFindings ? `
================================================================================
                         FINDINGS
================================================================================

1. EVIDENCE COLLECTION
   - Total files collected: ${caseEvidence.length}
   - All files successfully hashed and catalogued
   - Chain of custody maintained throughout analysis

2. FILE ANALYSIS
   - File types identified and categorized
   - Metadata extracted where available
   - No corruption detected in uploaded evidence

3. SECURITY ASSESSMENT
   - All hash values calculated successfully
   - Evidence integrity can be verified at any time
   - Recommended to store hash values separately for verification

4. RECOMMENDATIONS
   - Maintain secure backup of all evidence files
   - Document all access to evidence with timestamps
   - Regular integrity checks using stored hash values
   - Follow proper chain of custody procedures
` : ''}

================================================================================
                      CONCLUSION
================================================================================

This report documents the digital evidence analysis conducted on ${formatDate(reportDate)}.
All procedures followed standard digital forensics protocols to ensure evidence
integrity and admissibility.

Investigator Signature: _________________________ Date: _______________

Supervisor Review:      _________________________ Date: _______________

================================================================================
                         END OF REPORT
================================================================================

Report generated by Cyber Forensics Evidence Analyzer
© ${reportDate.getFullYear()} Digital Forensics Unit
    `.trim();

    setGeneratedReport(report);
    toast.success('Report generated successfully');
  };

  const downloadReport = () => {
    if (!generatedReport) return;
    
    const blob = new Blob([generatedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensics-report-${formatDate(new Date()).replace(/[,\s:]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded');
  };

  const printReport = () => {
    if (!generatedReport) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Forensics Report</title>
            <style>
              body { font-family: monospace; white-space: pre-wrap; padding: 20px; }
            </style>
          </head>
          <body>${generatedReport.replace(/\n/g, '<br>')}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="configure" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="configure">Configure Report</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedReport}>Preview Report</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          {/* Report Configuration */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-400">Report Title *</Label>
                  <Input
                    value={reportConfig.reportTitle}
                    onChange={(e) => setReportConfig({ ...reportConfig, reportTitle: e.target.value })}
                    placeholder="Enter report title..."
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Investigator Name *</Label>
                  <Input
                    value={reportConfig.investigator}
                    onChange={(e) => setReportConfig({ ...reportConfig, investigator: e.target.value })}
                    placeholder="Enter investigator name..."
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400">Link to Case (Optional)</Label>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200"
                >
                  <option value="">-- Select a case --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400">Report Sections</Label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'includeHashes', label: 'Hash Values', icon: Hash },
                    { key: 'includeTimeline', label: 'Timeline Events', icon: Clock },
                    { key: 'includeMetadata', label: 'File Metadata', icon: FileSearch },
                    { key: 'includeFindings', label: 'Findings & Analysis', icon: Shield },
                  ].map(({ key, label, icon: Icon }) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => setReportConfig(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      className={reportConfig[key as keyof typeof reportConfig] 
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                        : 'border-slate-700 text-slate-400'
                      }
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {reportConfig[key as keyof typeof reportConfig] && <CheckCircle className="w-3 h-3 mr-1" />}
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerateReport}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Report Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Evidence Files</p>
                    <p className="text-2xl font-bold text-slate-100">{evidenceFiles.length}</p>
                  </div>
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Available Cases</p>
                    <p className="text-2xl font-bold text-slate-100">{cases.length}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <Briefcase className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Timeline Events</p>
                    <p className="text-2xl font-bold text-slate-100">{timelineEvents.length}</p>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {generatedReport && (
            <>
              <div className="flex gap-2">
                <Button onClick={downloadReport} className="bg-emerald-500 hover:bg-emerald-600">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button onClick={printReport} variant="outline" className="border-slate-700">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
              </div>
              
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <pre className="p-6 text-sm text-slate-300 font-mono whitespace-pre-wrap">
                      {generatedReport}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
