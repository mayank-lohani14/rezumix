"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ResumeForm from "@/components/(user-resume)/ResumeForm";
import ResumePreview from "@/components/(user-resume)/ResumePreview";
import BuilderHeader from "@/components/(user-resume)/BuilderHeader";

const defaultResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    summary: "",
  },
  experience: [],
  education: [],
  skills: {
    technical: [],
    soft: [],
  },
  projects: [],
  certifications: [],
};

export default function BuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [activeTemplate, setActiveTemplate] = useState("modern");
  const [mobileView, setMobileView] = useState("form");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [suggesting, setSuggesting] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("resumeBuilderData");
    if (saved) {
      setResumeData(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("resumeBuilderData", JSON.stringify(resumeData));
  }, [resumeData]);

  const updateResumeData = useCallback((section, value) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: value,
    }));
  }, []);

  const handleSave = async () => {
    const userEmail = session?.user?.email;
    if (!userEmail) {
      setSaveMsg("❌ Please login to save your resume");
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }

    setSaving(true);
    setSaveMsg("");

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          template: activeTemplate,
          title: resumeData.personalInfo.fullName
            ? `${resumeData.personalInfo.fullName}'s Resume`
            : "Untitled Resume",
          personalInfo: resumeData.personalInfo,
          experience: resumeData.experience,
          education: resumeData.education,
          skills: resumeData.skills,
          projects: resumeData.projects,
          certifications: resumeData.certifications,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSaveMsg("✅ Resume saved!");
      } else {
        setSaveMsg("❌ Failed to save. Try again.");
      }
    } catch (err) {
      setSaveMsg("❌ Something went wrong.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const handleGetSuggestions = async () => {
    setSuggesting(true);
    setSuggestions(null);
    try {
      const res = await fetch("/api/resume/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <p className="text-white/50 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <BuilderHeader
        resumeData={resumeData}
        activeTemplate={activeTemplate}
        setActiveTemplate={setActiveTemplate}
        mobileView={mobileView}
        setMobileView={setMobileView}
        onSave={handleSave}
        saving={saving}
        saveMsg={saveMsg}
        onGetSuggestions={handleGetSuggestions}
        suggesting={suggesting}
      />

      <main className="flex h-[calc(100vh-64px)]">
        {/* Form Panel */}
        <div
          className={`
            w-full md:w-1/2 overflow-y-auto border-r border-white/10
            ${mobileView === "preview" ? "hidden md:block" : "block"}
          `}
        >
          <ResumeForm
            resumeData={resumeData}
            updateResumeData={updateResumeData}
          />
          {suggestions && (
            <div className="p-4 border-t border-white/10 space-y-3">
              <h3 className="text-sm font-semibold text-blue-400">
                ✨ AI Suggestions
              </h3>
              {Object.entries(suggestions).map(([key, value]) => (
                <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-300 uppercase mb-1">
                    {key}
                  </p>
                  <p className="text-xs text-white/70">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div
          className={`
            w-full md:w-1/2 overflow-y-auto bg-[#050505]
            ${mobileView === "form" ? "hidden md:block" : "block"}
          `}
        >
          <ResumePreview
            resumeData={resumeData}
            activeTemplate={activeTemplate}
          />
        </div>
      </main>
    </div>
  );
}