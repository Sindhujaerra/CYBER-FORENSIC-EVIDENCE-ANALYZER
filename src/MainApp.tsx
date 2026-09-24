import { useState, useEffect } from "react"
import axios from "axios"

import ParticlesBackground from "./components/ParticlesBackground"
import Dashboard from "./sections/Dashboard"
import EvidenceUpload from "./sections/EvidenceUpload"
import HashAnalyzer from "./sections/HashAnalyzer"
import TimelineAnalysis from "./sections/TimelineAnalysis"
import CaseManager from "./sections/CaseManager"
import ReportGenerator from "./sections/ReportGenerator"
import Sidebar from "./components/Sidebar"
import { Toaster } from "sonner"

import type { EvidenceFile, Case, TimelineEvent } from "@/types/forensics"

interface MainAppProps {
  onLogout: () => void;
}

export default function MainApp({ onLogout }: MainAppProps) {
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [theme, setTheme] = useState<"cyber" | "graphite">("cyber")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const themeStyles: Record<typeof theme, React.CSSProperties> = {
    cyber: {
      background: "radial-gradient(circle at 20% 20%, #a855f7 0%, transparent 40%), radial-gradient(circle at 80% 0%, #7c3aed 0%, transparent 40%), #020617",
      color: "#ffffff"
    },
    graphite: {
      background: "radial-gradient(circle at 30% 20%, #4b5563 0%, transparent 40%), radial-gradient(circle at 70% 15%, #9ca3af 0%, transparent 40%), #111827",
      color: "#d1d5db"
    }
  }

  useEffect(() => {
    document.body.style.background = themeStyles[theme].background || "";
    document.body.style.color = themeStyles[theme].color || "";
  }, [theme])

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [evidenceRes, caseRes, timelineRes] = await Promise.all([
          axios.get("/api/evidence"),
          axios.get("/api/cases"),
          axios.get("/api/evidence/timeline"),
        ]);

        setEvidenceFiles(Array.isArray(evidenceRes.data) ? evidenceRes.data : []);
        const normalizedCases = Array.isArray(caseRes.data) ? caseRes.data.map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
          description: c.description,
          investigator: c.investigator,
          status: c.status,
          evidenceFiles: c.evidenceFiles || [],
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
          closedAt: c.closedAt ? new Date(c.closedAt) : undefined,
        })) : [];
        setCases(normalizedCases);
        setTimelineEvents(Array.isArray(timelineRes.data) ? timelineRes.data : []);
      } catch (err) {
        console.error("Load error:", err);
      }
    };
    loadAll();
  }, [])

  const addEvidenceFile = (file: EvidenceFile) => {
    setEvidenceFiles((prev) => [...prev, file])
  }

  const deleteEvidence = (id: string) => {
    setEvidenceFiles((prev) => prev.filter((f) => f.id !== id))
    setTimelineEvents((prev) => prev.filter((e) => e.fileId !== id))
  }

  const updateEvidence = (updatedFile: EvidenceFile) => {
    setEvidenceFiles((prev) =>
      prev.map((f) => (f.id === updatedFile.id ? updatedFile : f))
    )
  }

  const addCase = async (caseData: Case) => {
    try {
      const res = await axios.post("/api/cases", caseData);
      const created = res.data;
      const normalized = {
        id: created._id || created.id || caseData.id,
        name: created.name || created.title || caseData.name,
        description: created.description || caseData.description,
        investigator: created.investigator || caseData.investigator || "",
        status: created.status || caseData.status || "open",
        evidenceFiles: created.evidenceFiles || caseData.evidenceFiles || [],
        createdAt: created.createdAt ? new Date(created.createdAt) : new Date(),
      };
      setCases((prev) => [...prev, normalized]);
    } catch (err) {
      console.error(err);
    }
  }

  const renderSection = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            evidenceFiles={evidenceFiles}
            cases={cases}
            timelineEvents={timelineEvents}
            onTabChange={setActiveTab}
          />
        )

      case "evidence":
        return (
          <EvidenceUpload
  evidenceFiles={evidenceFiles}
  onAddEvidence={addEvidenceFile}
  onUpdateEvidence={updateEvidence}
  onDeleteEvidence={deleteEvidence}
/>
        )

      case "hashes":
        return <HashAnalyzer evidenceFiles={evidenceFiles} />

      case "timeline":
        return (
          <TimelineAnalysis
            timelineEvents={timelineEvents}
            evidenceFiles={evidenceFiles}
          />
        )

      case "cases":
        return (
          <CaseManager
            cases={cases}
            evidenceFiles={evidenceFiles}
            onAddCase={addCase}
          />
        )

      case "reports":
        return (
          <ReportGenerator
            evidenceFiles={evidenceFiles}
            cases={cases}
            timelineEvents={timelineEvents}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      {/* <ParticlesBackground /> */}
      <div className="relative flex min-h-screen" style={themeStyles[theme]}>

      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} isOpen={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} onLogout={onLogout} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-16 md:ml-20'}`}>

        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl px-8 py-5 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            Cyber Forensics Analyzer
          </h1>
          <div className="flex gap-2">
            <button className={`px-3 py-1 rounded ${theme === "cyber" ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-200"}`} onClick={() => setTheme("cyber")}>Cyber</button>
            <button className={`px-3 py-1 rounded ${theme === "graphite" ? "bg-slate-500 text-white" : "bg-slate-800 text-slate-200"}`} onClick={() => setTheme("graphite")}>Graphite</button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {renderSection()}
        </main>
      </div>

      <Toaster />
    </div>
  </>
  )
}