import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ThreatPanel from '@/components/ThreatPanel';
import FileChart from '@/components/FileChart';
import Terminal from '@/components/Terminal';
import { 
  FileText, 
  Briefcase, 
  Clock, 
  Shield, 
  TrendingUp, 
  Activity,
  FileSearch,
  ArrowRight
} from 'lucide-react';
import type { EvidenceFile, Case, TimelineEvent } from '@/types/forensics';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  evidenceFiles: EvidenceFile[];
  cases: Case[];
  timelineEvents: TimelineEvent[];
  onTabChange: (tab: string) => void;
}

export default function Dashboard({ evidenceFiles, cases, timelineEvents, onTabChange }: DashboardProps) {
  const totalEvidence = evidenceFiles?.length || 0;
  const totalCases = cases?.length || 0;
  const openCases = cases?.filter(c => c.status === 'open').length || 0;
  const recentEvents = (timelineEvents || []).slice(-5).reverse();

  const getFileTypeStats = () => {
    const stats: Record<string, number> = {};
    evidenceFiles.forEach(file => {
      if (!file || !file.metadata) return;
      const ext = file.metadata?.extension || 'unknown';
      stats[ext] = (stats[ext] || 0) + 1;
    });
    return Object.entries(stats).slice(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ background: 'linear-gradient(135deg, rgba(9,10,34,0.9), rgba(29,31,62,0.8), rgba(14,16,40,0.85))' }}>
        <Card className="bg-gradient-to-br from-[#13132a]/80 to-[#1f1f3f]/70 border border-cyan-500/20 rounded-2xl shadow-xl p-6 backdrop-blur-sm transition duration-300 hover:shadow-cyan-500/40 hover:scale-105 hover:border-cyan-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Evidence</CardTitle>
            <FileText className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{totalEvidence}</div>
            <p className="text-xs text-slate-500 mt-1">Files analyzed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#13132a]/80 to-[#1f1f3f]/70 border border-cyan-500/20 rounded-2xl shadow-xl p-6 backdrop-blur-sm transition duration-300 hover:shadow-cyan-500/40 hover:scale-105 hover:border-cyan-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Cases</CardTitle>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{openCases}</div>
            <p className="text-xs text-slate-500 mt-1">of {totalCases} total cases</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#13132a]/80 to-[#1f1f3f]/70 border border-cyan-500/20 rounded-2xl shadow-xl p-6 backdrop-blur-sm transition duration-300 hover:shadow-cyan-500/40 hover:scale-105 hover:border-cyan-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Timeline Events</CardTitle>
            <Clock className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{timelineEvents.length}</div>
            <p className="text-xs text-slate-500 mt-1">Tracked activities</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#13132a]/80 to-[#1f1f3f]/70 border border-cyan-500/20 rounded-2xl shadow-xl p-6 backdrop-blur-sm transition duration-300 hover:shadow-cyan-500/40 hover:scale-105 hover:border-cyan-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Security Status</CardTitle>
            <Shield className="w-4 h-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">
              {timelineEvents.some(e => e.type === "VERIFIED") ? "System Integrity Verified" : "Monitoring..."}
            </div>
            <p className="text-xs text-slate-500 mt-1">All hashes verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Threat + Charts + Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ThreatPanel timeline={timelineEvents} />
        <FileChart files={evidenceFiles} />
        <Terminal timeline={timelineEvents} />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-purple-950 to-black border border-fuchsia-500/20 rounded-2xl shadow-xl p-6 hover:shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:border-fuchsia-400 hover:shadow-fuchsia-500/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                className="flex items-center justify-between bg-purple-900/60 border border-fuchsia-500/20 rounded-xl p-5 text-cyan-200 hover:border-fuchsia-400 hover:bg-purple-800/70 transition shadow-xl"
                onClick={() => onTabChange('evidence')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <FileSearch className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-slate-100 font-semibold">Upload Evidence</div>
                    <div className="text-slate-400 text-sm">Add new files for analysis</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button 
                className="flex items-center justify-between bg-purple-900/60 border border-fuchsia-500/20 rounded-xl p-5 text-cyan-200 hover:border-fuchsia-400 hover:bg-purple-800/70 transition shadow-xl"
                onClick={() => onTabChange('cases')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-slate-100 font-semibold">Create Case</div>
                    <div className="text-slate-400 text-sm">Start new investigation</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button 
                className="flex items-center justify-between bg-purple-900/60 border border-fuchsia-500/20 rounded-xl p-5 text-cyan-200 hover:border-fuchsia-400 hover:bg-purple-800/70 transition shadow-xl"
                onClick={() => onTabChange('hashes')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-slate-100 font-semibold">Verify Hashes</div>
                    <div className="text-slate-400 text-sm">Check file integrity</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button 
                className="flex items-center justify-between bg-purple-900/60 border border-fuchsia-500/20 rounded-xl p-5 text-cyan-200 hover:border-fuchsia-400 hover:bg-purple-800/70 transition shadow-xl"
                onClick={() => onTabChange('reports')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose-500/10 rounded-lg">
                    <FileText className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-slate-100 font-semibold">Generate Report</div>
                    <div className="text-slate-400 text-sm">Export investigation findings</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-purple-950 to-black border border-fuchsia-500/20 rounded-2xl shadow-xl p-6 hover:shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:border-fuchsia-400 hover:shadow-fuchsia-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timelineEvents.length === 0 ? (
                <p className="text-slate-500">No recent activity</p>
              ) : (
                timelineEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="p-3 bg-slate-800 rounded-lg mb-2">
                    <p className="text-sm text-cyan-400">{event.type}</p>
                    <p className="text-xs text-slate-400">{event.description}</p>
                    <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Type Distribution */}
      {getFileTypeStats().length > 0 && (
        <Card className="bg-gradient-to-br from-purple-950 to-black border border-fuchsia-500/20 rounded-2xl shadow-xl p-6 hover:shadow-fuchsia-500/20 transition duration-300 hover:scale-105 hover:border-fuchsia-400 hover:shadow-fuchsia-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              File Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {getFileTypeStats().map(([ext, count]) => (
                <div 
                  key={ext}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700"
                >
                  <span className="text-sm font-medium text-cyan-400 uppercase">.{ext}</span>
                  <span className="text-sm text-slate-400">{count} files</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
