import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Hash, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Search,
  RefreshCw,
  Shield
} from 'lucide-react';
import type { EvidenceFile } from '@/types/forensics';
import { calculateHashes } from '@/lib/crypto';
import { toast } from 'sonner';

interface HashAnalyzerProps {
  evidenceFiles: EvidenceFile[];
}

export default function HashAnalyzer({ evidenceFiles }: HashAnalyzerProps) {
  const [textInput, setTextInput] = useState('');
  const [calculatedHashes, setCalculatedHashes] = useState<{md5: string; sha1: string; sha256: string} | null>(null);
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<'match' | 'mismatch' | null>(null);
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);

  const handleCalculateHashes = () => {
    if (!textInput.trim()) {
      toast.error('Please enter text to hash');
      return;
    }
    const hashes = calculateHashes(textInput);
    setCalculatedHashes(hashes);
    toast.success('Hashes calculated successfully');
  };

  const handleVerifyHash = () => {
    if (!selectedFile || !verifyHash.trim()) {
      toast.error('Please select a file and enter a hash to verify');
      return;
    }
    
    const fileHash = selectedFile.hashes.md5.toLowerCase();
    const inputHash = verifyHash.toLowerCase();
    
    setVerifyResult(fileHash === inputHash ? 'match' : 'mismatch');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-6">
      {/* Hash Calculator */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Hash className="w-5 h-5 text-cyan-400" />
            Hash Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-400">Enter text to calculate hashes</Label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type or paste text here..."
              className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
            />
          </div>
          
          <Button 
            onClick={handleCalculateHashes}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Calculate Hashes
          </Button>

          {calculatedHashes && (
            <div className="space-y-3 mt-4">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-400">MD5</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 text-slate-500 hover:text-cyan-400"
                    onClick={() => copyToClipboard(calculatedHashes.md5, 'MD5')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <code className="text-sm text-emerald-400 break-all">{calculatedHashes.md5}</code>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-400">SHA-1</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 text-slate-500 hover:text-cyan-400"
                    onClick={() => copyToClipboard(calculatedHashes.sha1, 'SHA-1')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <code className="text-sm text-emerald-400 break-all">{calculatedHashes.sha1}</code>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-400">SHA-256</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 text-slate-500 hover:text-cyan-400"
                    onClick={() => copyToClipboard(calculatedHashes.sha256, 'SHA-256')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <code className="text-sm text-emerald-400 break-all">{calculatedHashes.sha256}</code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hash Verification */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Hash Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="file">Verify File Hash</TabsTrigger>
              <TabsTrigger value="manual">Manual Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-400">Select Evidence File</Label>
                <ScrollArea className="h-[200px] border border-slate-700 rounded-md">
                  <div className="p-2 space-y-2">
                    {evidenceFiles.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No evidence files available</p>
                    ) : (
                      evidenceFiles.map((file) => (
                        <button
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedFile?.id === file.id 
                              ? 'bg-cyan-500/20 border border-cyan-500/50' 
                              : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-200 truncate">{file.name}</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            MD5: {file.hashes.md5}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {selectedFile && (
                <div className="space-y-2">
                  <Label className="text-slate-400">Enter hash to verify (MD5)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={verifyHash}
                      onChange={(e) => setVerifyHash(e.target.value)}
                      placeholder="Paste MD5 hash here..."
                      className="flex-1 bg-slate-800 border-slate-700 text-slate-200"
                    />
                    <Button onClick={handleVerifyHash} className="bg-emerald-500 hover:bg-emerald-600">
                      <Search className="w-4 h-4 mr-2" />
                      Verify
                    </Button>
                  </div>
                  
                  {verifyResult && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 ${
                      verifyResult === 'match' 
                        ? 'bg-emerald-500/10 border border-emerald-500/30' 
                        : 'bg-rose-500/10 border border-rose-500/30'
                    }`}>
                      {verifyResult === 'match' ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Hash matches! File integrity verified.</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-rose-400" />
                          <span className="text-rose-400 font-medium">Hash mismatch! File may have been tampered with.</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400">
                  Use the Hash Calculator above to generate hashes for any text or file content, 
                  then compare with known hash values to verify integrity.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Evidence File Hashes */}
      {evidenceFiles.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Evidence File Hashes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {evidenceFiles.map((file) => (
                  <div key={file.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-200">{file.name}</span>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {file.metadata?.extension || 'unknown'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-16">MD5:</span>
                        <code className="text-xs text-emerald-400 flex-1">{file.hashes.md5}</code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 text-slate-500 hover:text-cyan-400"
                          onClick={() => copyToClipboard(file.hashes.md5, 'MD5')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-16">SHA-1:</span>
                        <code className="text-xs text-emerald-400 flex-1">{file.hashes.sha1}</code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 text-slate-500 hover:text-cyan-400"
                          onClick={() => copyToClipboard(file.hashes.sha1, 'SHA-1')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-16">SHA-256:</span>
                        <code className="text-xs text-emerald-400 flex-1">{file.hashes.sha256}</code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 text-slate-500 hover:text-cyan-400"
                          onClick={() => copyToClipboard(file.hashes.sha256, 'SHA-256')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
