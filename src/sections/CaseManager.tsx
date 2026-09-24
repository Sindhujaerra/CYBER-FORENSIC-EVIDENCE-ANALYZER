import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import type { Case, EvidenceFile } from '@/types/forensics';
import { generateId } from '@/lib/crypto';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface CaseManagerProps {
  cases: Case[];
  evidenceFiles: EvidenceFile[];
  onAddCase: (caseData: any) => Promise<void>;
}

const getStatusColor = (status: Case['status']) => {
  switch (status) {
    case 'open':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'closed':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    case 'pending':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
};

const getStatusIcon = (status: Case['status']) => {
  switch (status) {
    case 'open':
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'closed':
      return <XCircle className="w-4 h-4 text-slate-400" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-amber-400" />;
  }
};

export default function CaseManager({ cases, evidenceFiles, onAddCase }: CaseManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCase, setNewCase] = useState({
    name: '',
    description: '',
    investigator: '',
    status: 'open' as Case['status'],
  });
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);

  const filteredCases = cases.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.investigator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCase = async () => {
    if (!newCase.name.trim() || !newCase.investigator.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const caseData = {
      name: newCase.name,
      description: newCase.description,
      investigator: newCase.investigator,
      status: newCase.status,
      evidenceFiles: evidenceFiles.filter(f => selectedEvidence.includes(f.id)),
    };

    try {
      await onAddCase(caseData);
      setNewCase({ name: '', description: '', investigator: '', status: 'open' });
      setSelectedEvidence([]);
      setIsDialogOpen(false);
      toast.success('Case created successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create case');
    }
  };
  const closeCase = async (id: string) => {
    try {
      const res = await axios.put(`/api/cases/close/${id}`);
      const updatedCase = res.data;

      setCases(prev => 
        prev.map(c => 
          c.id === id || c._id === id
            ? { ...c, ...updatedCase, id: updatedCase._id || updatedCase.id || c.id }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateCaseStatus = async (id: string, status: Case['status']) => {
    try {
      const res = await axios.put(`/api/cases/status/${id}`, { status });
      const updatedCase = res.data;

      setCases(prev => 
        prev.map(c => 
          c.id === id || c._id === id
            ? { ...c, ...updatedCase, id: updatedCase._id || updatedCase.id || c.id }
            : c
        )
      );
      toast.success(`Case status updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update case status');
    }
  };
  const toggleEvidenceSelection = (fileId: string) => {
    setSelectedEvidence(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Create */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cases..."
                className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Case
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    Create New Case
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-slate-400">Case Name *</Label>
                    <Input
                      value={newCase.name}
                      onChange={(e) => setNewCase({ ...newCase, name: e.target.value })}
                      placeholder="Enter case name..."
                      className="bg-slate-800 border-slate-700 text-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Description</Label>
                    <textarea
                      value={newCase.description}
                      onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                      placeholder="Enter case description..."
                      className="w-full h-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Investigator *</Label>
                    <Input
                      value={newCase.investigator}
                      onChange={(e) => setNewCase({ ...newCase, investigator: e.target.value })}
                      placeholder="Enter investigator name..."
                      className="bg-slate-800 border-slate-700 text-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Initial Status</Label>
                    <select
                      value={newCase.status}
                      onChange={(e) => setNewCase({ ...newCase, status: e.target.value as Case['status'] })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  
                  {evidenceFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-slate-400">Link Evidence Files</Label>
                      <ScrollArea className="h-[200px] border border-slate-700 rounded-md">
                        <div className="p-2 space-y-2">
                          {evidenceFiles.map((file) => (
                            <button
                              key={file.id}
                              onClick={() => toggleEvidenceSelection(file.id)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                selectedEvidence.includes(file.id)
                                  ? 'bg-cyan-500/20 border border-cyan-500/50'
                                  : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-200">{file.name}</span>
                                {selectedEvidence.includes(file.id) && (
                                  <CheckCircle className="w-4 h-4 text-cyan-400 ml-auto" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                      <p className="text-xs text-slate-500">
                        {selectedEvidence.length} files selected
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleCreateCase}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    Create Case
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCases.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="text-center py-12">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">No cases found</p>
              <p className="text-sm text-slate-600 mt-1">
                {cases.length === 0 
                  ? 'Create your first case to get started' 
                  : 'Try adjusting your search'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Briefcase className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-slate-200">{caseItem.name}</h3>
                          {caseItem.status === "closed" ? (
                            <span className="text-red-400 text-xs">Closed</span>
                          ) : (
                            <span className="text-green-400 text-xs">Open</span>
                          )}
                          <Badge className={`${getStatusColor(caseItem.status)} capitalize`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(caseItem.status)}
                              {caseItem.status}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{caseItem.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {caseItem.investigator}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created {formatDate(caseItem.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {caseItem.evidenceFiles.length} evidence files
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {caseItem.status !== 'closed' && (
                    <div className="flex gap-2">
                      <select
                        value={caseItem.status}
                        onChange={(e) => updateCaseStatus(caseItem.id || caseItem._id, e.target.value as Case['status'])}
                        className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200"
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </select>
                      <Button className="bg-red-600 hover:bg-red-700" onClick={() => closeCase(caseItem.id || caseItem._id)}>
                        Close Case
                      </Button>
                    </div>
                  )}

                  {caseItem.evidenceFiles.length > 0 && (
                    <div className="lg:w-64">
                      <p className="text-xs text-slate-500 mb-2">Linked Evidence:</p>
                      <div className="flex flex-wrap gap-1">
                        {caseItem.evidenceFiles.slice(0, 3).map((file) => (
                          <Badge key={file.id} variant="outline" className="text-xs border-slate-700 text-slate-400">
                            {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                          </Badge>
                        ))}
                        {caseItem.evidenceFiles.length > 3 && (
                          <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                            +{caseItem.evidenceFiles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      {cases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Cases</p>
                  <p className="text-2xl font-bold text-slate-100">{cases.length}</p>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <Briefcase className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Open Cases</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {cases.filter(c => c.status === 'open').length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pending</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {cases.filter(c => c.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Closed</p>
                  <p className="text-2xl font-bold text-slate-400">
                    {cases.filter(c => c.status === 'closed').length}
                  </p>
                </div>
                <div className="p-3 bg-slate-500/10 rounded-lg">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
