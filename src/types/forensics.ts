export interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  hashes: {
    md5: string;
    sha1: string;
    sha256: string;
  };
  metadata: FileMetadata;
  fileUrl?: string;
  content?: string;
  status?: "not tampered" | "modified" | "unknown";
  lastVerified?: Date;
}

export interface FileMetadata {
  lastModified: Date;
  created?: Date;
  accessed?: Date;
  permissions?: string;
  owner?: string;
  group?: string;
  mimeType: string;
  extension: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'created' | 'modified' | 'accessed' | 'uploaded' | 'analyzed';
  description: string;
  fileId?: string;
  fileName?: string;
}

export interface AnalysisReport {
  id: string;
  caseName: string;
  investigator: string;
  createdAt: Date;
  evidenceCount: number;
  findings: string[];
  timeline: TimelineEvent[];
  fileHashes: Record<string, string>;
}

export interface Case {
  id: string;
  name: string;
  description: string;
  investigator: string;
  createdAt: Date;
  status: 'open' | 'closed' | 'pending';
  closedAt?: Date;
  evidenceFiles: EvidenceFile[];
}
