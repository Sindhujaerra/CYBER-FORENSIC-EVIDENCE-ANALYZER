import axios from "axios";
import { useState, useCallback, useRef, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Upload,
  FileText,
  Image,
  Music,
  Video,
  Archive,
  Code,
  X,
  CheckCircle,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

import type { EvidenceFile } from "@/types/forensics";
import { toast } from "sonner";
import { formatBytes, formatDate } from "@/lib/utils";

interface EvidenceUploadProps {
  evidenceFiles: EvidenceFile[];
  onAddEvidence: (file: EvidenceFile) => void;
  onUpdateEvidence: (file: EvidenceFile) => void;
  onDeleteEvidence: (id: string) => void;
}

/* ---------------- FILE ICON ---------------- */

const getFileIcon = (type?: string) => {
  if (!type) return <FileText className="w-5 h-5 text-blue-400" />;

  if (type.startsWith("image/"))
    return <Image className="w-5 h-5 text-purple-400" />;

  if (type.startsWith("video/"))
    return <Video className="w-5 h-5 text-rose-400" />;

  if (type.startsWith("audio/"))
    return <Music className="w-5 h-5 text-amber-400" />;

  if (type.includes("zip") || type.includes("archive"))
    return <Archive className="w-5 h-5 text-emerald-400" />;

  if (type.includes("code"))
    return <Code className="w-5 h-5 text-cyan-400" />;

  return <FileText className="w-5 h-5 text-blue-400" />;
};

/* ---------------- COMPONENT ---------------- */

export default function EvidenceUpload({
  evidenceFiles,
  onAddEvidence,
  onUpdateEvidence,
  onDeleteEvidence,
}: EvidenceUploadProps) {

  const [localEvidenceFiles, setLocalEvidenceFiles] = useState<EvidenceFile[]>(
    evidenceFiles
  );

  useEffect(() => {
    setLocalEvidenceFiles(evidenceFiles);
  }, [evidenceFiles]);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);



  /* ---------------- OPEN FILE LIBRARY ---------------- */

  const openFileLibrary = () => {
    fileInputRef.current?.click();
  };

  /* ---------------- UPLOAD FILE ---------------- */

  const uploadEvidence = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/evidence/upload", formData);

      const backend = res.data;

      const evidenceFile: EvidenceFile = {
        id: backend.id,
        name: backend.name,
        size: backend.size,
        type: backend.type,
        uploadDate: new Date(backend.uploadDate),
        fileUrl: backend.fileUrl,
        hashes: backend.hashes,
        metadata: {
          ...backend.metadata,
          lastModified: new Date(backend.metadata.lastModified),
        },
        status: backend.status || "unknown",
      };

      onAddEvidence(evidenceFile);
      toast.success("Uploaded successfully");

    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  const handleUpload = async (file: File) => {

    const formData = new FormData();

    formData.append("file", file);

    try {

      const res = await axios.post("/api/evidence/upload", formData);

      onAddEvidence(res.data);

      toast.success("File uploaded successfully");

    } catch (err) {

      console.error(err);

      toast.error("Upload failed");

    }

  };

  const tamperEvidence = async (file: any) => {
    if (!file.id) {
      toast.error("Invalid file ID");
      return;
    }

    try {
      await axios.post(`/api/evidence/tamper/${file.id}`);
      toast.success("File tampered for testing - now click Verify Evidence");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to tamper file";
      toast.error(`Failed to tamper file: ${errorMessage}`);
    }
  };

  const verifyEvidence = async (file: any) => {
    if (!file.id) {
      toast.error("Invalid file ID");
      return;
    }

    console.log("Verifying file:", file.name, "ID:", file.id);

    try {
      const res = await axios.get(`/api/evidence/verify/${file.id}`);
      console.log("Verification response:", res.data);

      const updatedFile = {
        ...file,
        status: res.data.status,
      };

      onUpdateEvidence(updatedFile);
      
      if (res.data.status === 'not tampered') {
        toast.success(`File is not tampered - hashes match`);
      } else if (res.data.status === 'modified') {
        toast.warning(`File has been modified - hashes don't match!`);
      } else {
        toast.error(`Verification: ${res.data.message || res.data.status}`);
      }

    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || "Verification failed";
      toast.error(`Verification failed: ${errorMessage}`);
    }
  };

  /* ---------------- INPUT UPLOAD ---------------- */

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (!e.target.files) return;

    setIsProcessing(true);

    const files = Array.from(e.target.files);

    for (const file of files) {

      await uploadEvidence(file);

    }

    setIsProcessing(false);

  };

  /* ---------------- DRAG DROP ---------------- */

  const handleDragOver = useCallback((e: React.DragEvent) => {

    e.preventDefault();

    setIsDragging(true);

  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {

    e.preventDefault();

    setIsDragging(false);

  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {

    e.preventDefault();

    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);

    setIsProcessing(true);

    for (const file of files) {

      await uploadEvidence(file);

    }

    setIsProcessing(false);

  }, []);

  /* ---------------- UI ---------------- */

  return (

    <div className="space-y-6">

      {/* Upload Panel */}

      <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">

        <CardHeader>

          <CardTitle className="flex items-center gap-2 text-cyan-400">

            <Upload className="w-5 h-5" />

            Upload Digital Evidence

          </CardTitle>

        </CardHeader>

        <CardContent>

          <div

            onDragOver={handleDragOver}

            onDragLeave={handleDragLeave}

            onDrop={handleDrop}

            className={`border-2 border-dashed rounded-xl p-12 text-center transition
            ${
              isDragging
                ? "border-cyan-400 bg-cyan-500/10"
                : "border-slate-700 hover:border-slate-500"
            }`}

          >

            <FolderOpen className="mx-auto mb-4 w-10 h-10 text-cyan-400" />

            <Button

              onClick={openFileLibrary}

              disabled={isProcessing}

              className="bg-cyan-600 hover:bg-cyan-700"

            >

              {isProcessing ? "Uploading..." : "Open Evidence Library"}

            </Button>

            <p className="text-xs text-slate-400 mt-4">

              Upload files, images, videos, audio or entire folders

            </p>

            {/* Hidden Input */}

            <Input
              ref={fileInputRef}
              type="file"
              multiple
              //@ts-ignore
              webkitdirectory="true"
              className="hidden"
              onChange={handleInputChange}
            />

          </div>

        </CardContent>

      </Card>

      {/* Evidence List */}

      <Card className="bg-slate-900/60 border-slate-800">

        <CardHeader>

          <CardTitle>

            Evidence Files ({localEvidenceFiles.length})

          </CardTitle>

        </CardHeader>

        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Click "Verify Evidence" to check file integrity. Use "Test Tamper" to simulate tampering for testing, then verify again.
          </p>
          {localEvidenceFiles.length === 0 ? (

            <p className="text-slate-500 text-center py-10">

              No evidence uploaded

            </p>

          ) : (

            <ScrollArea className="h-[400px]">

              <div className="space-y-3">

                {localEvidenceFiles.map((file) => (

                  <div

                    key={file.id}

                    className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-cyan-500 transition"

                  >

                    <div className="flex items-center gap-3">

                      {getFileIcon(file.type)}

                      <div className="flex-1">

                        <div className="flex items-center gap-2">
                          <p
                            className="text-slate-200 font-medium cursor-pointer hover:text-cyan-400"
                            onClick={() => {
                              if (file.fileUrl) {
                                window.open(file.fileUrl, "_blank");
                              } else {
                                toast.error("File not available");
                              }
                            }}
                          >
                            {file.name}
                          </p>
                          {file.status === "not tampered" && (
                            <Badge className="bg-green-600">Not Tampered</Badge>
                          )}
                          {file.status === "modified" && (
                            <Badge className="bg-orange-600">Modified</Badge>
                          )}
                          {file.status === "unknown" && (
                            <Badge className="bg-yellow-600">Not Verified</Badge>
                          )}
                        </div>

                        <p className="text-xs text-slate-500">
                          {formatBytes(file.size)} • Uploaded {formatDate(file.uploadDate || new Date())}
                          {file.lastVerified && (
                            <> • Verified {formatDate(file.lastVerified)}</>
                          )}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            onClick={() => {
                              if (file.fileUrl) {
                                window.open(file.fileUrl);
                              } else {
                                toast.error("File not available");
                              }
                            }}
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            View Evidence
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => verifyEvidence(file)}
                          >
                            Verify Evidence
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                            onClick={() => tamperEvidence(file)}
                          >
                            Test Tamper
                          </Button>
                        </div>

                      </div>

                      <Button

                        variant="ghost"

                        size="icon"

                        onClick={() => onDeleteEvidence(file.id)}

                      >

                        <X className="w-4 h-4 text-red-400" />

                      </Button>

                    </div>

                    {/* Metadata */}

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-3 pl-7">

                      <p>Type: {file.metadata?.mimeType || "Unknown"}</p>

                      <p>Extension: {file.metadata?.extension || "N/A"}</p>

                      <p>

                        Last Modified:{" "}

                        {formatDate(file.metadata?.lastModified || new Date())}

                      </p>

                      <div className="col-span-2 space-y-1">
                        <p>MD5: {file.hashes?.md5 || "N/A"}</p>
                        <p>SHA1: {file.hashes?.sha1 || "N/A"}</p>
                        <p>SHA256: {file.hashes?.sha256 || "N/A"}</p>
                      </div>

                    </div>

                    <Badge className="mt-3 bg-emerald-600">

                      <CheckCircle className="w-3 h-3 mr-1" />

                      Evidence Verified

                    </Badge>

                  </div>

                ))}

              </div>

            </ScrollArea>

          )}

        </CardContent>

      </Card>

      {/* Notice */}

      <Card className="bg-amber-500/5 border-amber-500/20">

        <CardContent className="flex gap-2 py-4">

          <AlertCircle className="w-5 h-5 text-amber-400" />

          <p className="text-sm text-amber-400">

            All uploaded evidence is hashed and stored securely to maintain
            forensic chain-of-custody integrity.

          </p>

        </CardContent>

      </Card>

    </div>

  );

}