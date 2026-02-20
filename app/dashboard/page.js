"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function wordCount(text) {
  return text?.trim().split(/\s+/).filter(Boolean).length ?? 0;
}

export default function Dashboard() {
  const router = useRouter();
  const [studySets, setStudySets] = useState(null); // null = loading

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    const stored = localStorage.getItem("sq_studysets");
    setStudySets(stored ? JSON.parse(stored) : []);
  }, []);

  function deleteStudySet(id) {
    const updated = studySets.filter((s) => s.id !== id);
    setStudySets(updated);
    localStorage.setItem("sq_studysets", JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/90 px-6 py-4 backdrop-blur-sm md:px-12">
        <a href="/" className="text-lg font-semibold tracking-tight">
          Cooked 🍳
        </a>
        <div className="flex items-center gap-3">
          <a
            href="/upload"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            + Add Material
          </a>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">My Study Sets</h1>
        <p className="mb-10 text-gray-500">
          Pick a set and start a battle — questions are generated fresh each time.
        </p>

        {/* Loading */}
        {studySets === null && (
          <p className="text-sm text-gray-400">Loading...</p>
        )}

        {/* Empty state */}
        {studySets !== null && studySets.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
            <div className="mb-4 text-5xl">📚</div>
            <p className="mb-1 font-medium text-gray-700">No study sets yet</p>
            <p className="mb-6 text-sm text-gray-400">
              Upload a PDF or paste your notes to get started.
            </p>
            <a
              href="/upload"
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Add Study Material
            </a>
          </div>
        )}

        {/* Study set list */}
        {studySets !== null && studySets.length > 0 && (
          <div className="space-y-4">
            {studySets.map((set) => (
              <div
                key={set.id}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5 transition-shadow hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold text-gray-900">
                    {set.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-400">
                    {wordCount(set.text).toLocaleString()} words · {formatDate(set.createdAt)}
                  </p>
                  {set.sourceFileName && (
                    <p className="mt-0.5 text-xs text-gray-300">{set.sourceFileName}</p>
                  )}
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <a
                    href={`/quiz/${set.id}/battle`}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                  >
                    Battle 🍕
                  </a>
                  <button
                    onClick={() => deleteStudySet(set.id)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400 transition-colors hover:border-red-200 hover:text-red-500"
                    title="Delete study set"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
