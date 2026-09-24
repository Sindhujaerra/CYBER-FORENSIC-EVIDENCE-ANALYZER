import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  Upload, 
  Search, 
  Edit3, 
  Eye,
  Filter,
  Calendar,
  Download
} from 'lucide-react';
import type { TimelineEvent, EvidenceFile } from '@/types/forensics';
import { format, isWithinInterval, subDays, startOfDay } from 'date-fns';
import { toast } from 'sonner';

interface TimelineAnalysisProps {
  timelineEvents: TimelineEvent[];
  evidenceFiles: EvidenceFile[];
}

const getEventIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'uploaded':
      return <Upload className="w-4 h-4 text-cyan-400" />;
    case 'analyzed':
      return <Search className="w-4 h-4 text-emerald-400" />;
    case 'modified':
      return <Edit3 className="w-4 h-4 text-amber-400" />;
    case 'accessed':
      return <Eye className="w-4 h-4 text-blue-400" />;
    case 'created':
      return <Calendar className="w-4 h-4 text-purple-400" />;
    default:
      return <Clock className="w-4 h-4 text-slate-400" />;
  }
};

const getEventColor = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'uploaded':
      return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
    case 'analyzed':
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    case 'modified':
      return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    case 'accessed':
      return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    case 'created':
      return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
    default:
      return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
  }
};

export default function TimelineAnalysis({ timelineEvents, evidenceFiles }: TimelineAnalysisProps) {
  const [filterType, setFilterType] = useState<TimelineEvent['type'] | 'all'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredEvents = useMemo(() => {
    let events = [...timelineEvents];

    // Filter by type
    if (filterType !== 'all') {
      events = events.filter(e => e.type === filterType);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'today':
          startDate = startOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7);
          break;
        case 'month':
          startDate = subDays(now, 30);
          break;
        default:
          startDate = new Date(0);
      }
      
      events = events.filter(e => 
        isWithinInterval(new Date(e.timestamp), { start: startDate, end: now })
      );
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [timelineEvents, filterType, dateRange]);

  const exportTimeline = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalEvents: filteredEvents.length,
      events: filteredEvents.map(e => ({
        ...e,
        timestamp: new Date(e.timestamp).toISOString(),
      })),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Timeline exported successfully');
  };

  // Generate timeline from evidence files if no events exist
  const generatedEvents = useMemo(() => {
    if (timelineEvents.length > 0) return filteredEvents;
    
    const events: TimelineEvent[] = [];
    
    evidenceFiles.forEach(file => {
      events.push({
        id: `upload-${file.id}`,
        timestamp: file.uploadDate,
        type: 'uploaded',
        description: `Evidence uploaded: ${file.name}`,
        fileId: file.id,
        fileName: file.name,
      });
      
      if (file.metadata.lastModified) {
        events.push({
          id: `modified-${file.id}`,
          timestamp: file.metadata.lastModified,
          type: 'modified',
          description: `File last modified: ${file.name}`,
          fileId: file.id,
          fileName: file.name,
        });
      }
    });
    
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [evidenceFiles, timelineEvents.length, filteredEvents]);

  const displayEvents = generatedEvents;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            Timeline Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Event Type</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'uploaded', 'analyzed', 'modified', 'accessed', 'created'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className={filterType === type 
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                      : 'border-slate-700 text-slate-400 hover:text-slate-200'
                    }
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Date Range</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'today', 'week', 'month'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange(range)}
                    className={dateRange === range 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'border-slate-700 text-slate-400 hover:text-slate-200'
                    }
                  >
                    {range === 'all' ? 'All Time' : 
                     range === 'today' ? 'Today' : 
                     range === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Event Timeline ({displayEvents.length} events)
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportTimeline}
            className="border-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {displayEvents.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">No timeline events found</p>
              <p className="text-sm text-slate-600 mt-1">
                Upload evidence files to generate timeline events
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-700" />
                
                <div className="space-y-4">
                  {displayEvents.map((event) => (
                    <div key={event.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-4 top-4 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        event.type === 'uploaded' ? 'bg-cyan-400' :
                        event.type === 'analyzed' ? 'bg-emerald-400' :
                        event.type === 'modified' ? 'bg-amber-400' :
                        event.type === 'accessed' ? 'bg-blue-400' :
                        event.type === 'created' ? 'bg-purple-400' :
                        'bg-slate-400'
                      }`} />
                      
                      <div className={`p-4 rounded-lg border ${getEventColor(event.type)}`}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-900/50 rounded-lg">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{event.description}</span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {event.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(event.timestamp), 'MMM dd, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(event.timestamp), 'HH:mm:ss')}
                              </span>
                            </div>
                            {event.fileName && (
                              <div className="mt-2 text-xs text-slate-500">
                                File: {event.fileName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Events</p>
                <p className="text-2xl font-bold text-slate-100">{displayEvents.length}</p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Uploads</p>
                <p className="text-2xl font-bold text-slate-100">
                  {displayEvents.filter(e => e.type === 'uploaded').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Upload className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Modifications</p>
                <p className="text-2xl font-bold text-slate-100">
                  {displayEvents.filter(e => e.type === 'modified').length}
                </p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Edit3 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
