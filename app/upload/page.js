"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const [tab, setTab] = useState("pdf"); // "pdf" | "text"
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function handleFileDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
      if (!title) setTitle(dropped.name.replace(/\.pdf$/i, ""));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (tab === "pdf" && !file) {
      setError("Please select a PDF file.");
      return;
    }
    if (tab === "text" && !pastedText.trim()) {
      setError("Please paste some study material.");
      return;
    }

    setLoading(true);
    try {
      let text = "";
      let sourceFileName;

      if (tab === "pdf") {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/extract-text", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Text extraction failed.");
        text = data.text;
        sourceFileName = data.sourceFileName;
      } else {
        text = pastedText.trim();
      }

      const setTitle = title.trim() || (tab === "pdf" ? file.name.replace(/\.pdf$/i, "") : "My Study Set");

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error: insertError } = await supabase.from("study_sets").insert({
          user_id: user.id,
          title: setTitle,
          text,
          source_file_name: sourceFileName || null,
        });
        if (insertError) throw new Error(insertError.message);
      } else {
        const studySet = {
          id: crypto.randomUUID(),
          title: setTitle,
          text,
          createdAt: new Date().toISOString(),
          ...(sourceFileName && { sourceFileName }),
        };
        const existing = JSON.parse(localStorage.getItem("sq_studysets") || "[]");
        localStorage.setItem("sq_studysets", JSON.stringify([studySet, ...existing]));
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "rgba(255,252,248,0.85)",
    border: "2px solid #e8cdb5",
    borderRadius: 14,
    color: "#3d1e08",
    outline: "none",
    width: "100%",
    padding: "12px 16px",
    fontSize: 15,
    fontFamily: "inherit",
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fff8f0 0%, #feecd2 50%, #fde0b8 100%)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 backdrop-blur-sm md:px-12" style={{ background: "rgba(255,248,240,0.88)", borderBottom: "1px solid #e8cdb5" }}>
        <a href="/" className="text-xl font-bold" style={{ color: "#5a2d0c" }}>
          Cooked 🍳
        </a>
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-sm font-semibold" style={{ color: "#8b5e3c" }}>
            Dashboard
          </a>
          <button
            onClick={handleSignOut}
            className="rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
            style={{ borderColor: "#e8cdb5", color: "#5a2d0c", background: "rgba(255,252,248,0.8)" }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-12 md:py-20">
        <h1 className="mb-2 text-4xl font-bold tracking-tight" style={{ color: "#5a2d0c" }}>Add Study Material</h1>
        <p className="mb-10 font-semibold" style={{ color: "#8b5e3c" }}>
          Upload a PDF or paste your notes. You&apos;ll pick question settings when you start a battle.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-bold" style={{ color: "#5a2d0c" }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Biology Chapter 5"
              style={inputStyle}
            />
          </div>

          {/* Source tabs */}
          <div>
            <div className="mb-4 flex rounded-2xl border p-1" style={{ borderColor: "#e8cdb5", background: "rgba(255,252,248,0.6)" }}>
              {["pdf", "text"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all"
                  style={
                    tab === t
                      ? { background: "linear-gradient(135deg, #e8a849, #e07b30)", color: "#fff", boxShadow: "0 3px 0 #b86a20" }
                      : { color: "#8b5e3c" }
                  }
                >
                  {t === "pdf" ? "Upload PDF" : "Paste Text"}
                </button>
              ))}
            </div>

            {tab === "pdf" ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all"
                style={{
                  borderColor: dragging ? "#e8a849" : "#e8cdb5",
                  background: dragging ? "rgba(232,168,73,0.08)" : "rgba(255,252,248,0.6)",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
                    }
                  }}
                />
                <div className="mb-3 text-5xl">📄</div>
                {file ? (
                  <>
                    <p className="text-sm font-bold" style={{ color: "#5a2d0c" }}>{file.name}</p>
                    <p className="text-xs" style={{ color: "#a07050" }}>
                      {(file.size / 1024).toFixed(0)} KB — click to change
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold" style={{ color: "#5a2d0c" }}>
                      Drop a PDF here or click to browse
                    </p>
                    <p className="text-xs" style={{ color: "#a07050" }}>PDF files only</p>
                  </>
                )}
              </div>
            ) : (
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your notes, textbook excerpt, lecture slides content..."
                rows={10}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-base font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-0.5"
            style={{
              borderRadius: 50,
              background: "linear-gradient(135deg, #e8a849, #e07b30)",
              boxShadow: "0 5px 0 #b86a20, 0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            {loading ? (tab === "pdf" ? "Extracting text..." : "Saving...") : "Save Study Set →"}
          </button>
        </form>
      </main>
    </div>
  );
}
