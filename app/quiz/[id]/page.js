"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const TYPE_BADGE = {
  multiple_choice: { label: "Multiple Choice", color: "bg-blue-50 text-blue-600" },
  true_false: { label: "True / False", color: "bg-purple-50 text-purple-600" },
  short_answer: { label: "Short Answer", color: "bg-amber-50 text-amber-600" },
};

function AnswerList({ question }) {
  const [revealed, setRevealed] = useState(false);

  if (question.type === "short_answer") {
    return (
      <div className="mt-3 space-y-2">
        <button
          onClick={() => setRevealed(!revealed)}
          className="text-sm font-medium text-gray-500 underline underline-offset-2 hover:text-gray-900"
        >
          {revealed ? "Hide model answer" : "Show model answer"}
        </button>
        {revealed && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {question.modelAnswer}
          </div>
        )}
        {revealed && question.explanation && (
          <p className="text-xs text-gray-400">{question.explanation}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {question.answers.map((answer) => (
        <div
          key={answer.id}
          className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
            answer.isCorrect
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-gray-100 bg-gray-50 text-gray-500"
          }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              answer.isCorrect
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {answer.isCorrect ? "✓" : answer.id.toUpperCase()}
          </span>
          {answer.text}
        </div>
      ))}
      {question.explanation && (
        <p className="pt-1 text-xs text-gray-400">{question.explanation}</p>
      )}
    </div>
  );
}

export default function QuizPreviewPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("sq_quizzes") || "[]");
    const found = stored.find((q) => q.id === id);
    setQuiz(found || null);
  }, [id]);

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Quiz not found.{" "}
        <a href="/dashboard" className="ml-1 underline">
          Go to dashboard
        </a>
      </div>
    );
  }

  const typeCounts = quiz.questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/90 px-6 py-4 backdrop-blur-sm md:px-12">
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
          ← Dashboard
        </a>
        <span className="text-lg font-semibold tracking-tight">StudyQuest</span>
        <div className="w-20" />
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <span>{quiz.questions.length} questions</span>
            {Object.entries(typeCounts).map(([type, count]) => (
              <span
                key={type}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE[type]?.color ?? "bg-gray-100 text-gray-500"}`}
              >
                {count} {TYPE_BADGE[type]?.label ?? type}
              </span>
            ))}
            {quiz.sourceFileName && <span>{quiz.sourceFileName}</span>}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((question, i) => (
            <div
              key={question.id}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-6"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <p className="text-sm font-semibold leading-relaxed text-gray-900">
                  <span className="mr-2 text-gray-400">{i + 1}.</span>
                  {question.question}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE[question.type]?.color ?? "bg-gray-100 text-gray-500"}`}
                >
                  {TYPE_BADGE[question.type]?.label ?? question.type}
                </span>
              </div>
              <AnswerList question={question} />
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={`/quiz/${quiz.id}/battle`}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Battle! 🍕
          </a>
          <a
            href={`/quiz/${quiz.id}/play`}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Practice Mode
          </a>
          <a
            href="/upload"
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Create another
          </a>
          <a
            href="/dashboard"
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
