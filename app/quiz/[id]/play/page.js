"use client";

import { useEffect, useReducer, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

const FEEDBACK_DURATION = 2200; // ms before auto-advancing
const ANSWER_LABELS = ["A", "B", "C", "D"];

// ─── Scoring ────────────────────────────────────────────────────────────────

function calcPoints(correct, timeLimit, elapsedMs, streak) {
  if (!correct) return 0;
  const base = 100;
  const speedBonus = Math.round(50 * Math.max(0, 1 - elapsedMs / (timeLimit * 1000)));
  const streakBonus = streak * 10;
  return base + speedBonus + streakBonus;
}

// ─── Reducer ────────────────────────────────────────────────────────────────

const initialState = {
  status: "intro",      // intro | question | feedback | results
  currentIndex: 0,
  timeLeft: 30,
  score: 0,
  streak: 0,
  questionStartTime: null,
  selectedAnswerId: null,
  timedOut: false,
  selfGrade: null,      // for short_answer
  shortAnswerText: "",
  lastPointsEarned: 0,
  answers: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return {
        ...state,
        status: "question",
        currentIndex: 0,
        timeLeft: action.timeLimit,
        questionStartTime: Date.now(),
        selectedAnswerId: null,
        timedOut: false,
        selfGrade: null,
        shortAnswerText: "",
      };

    case "TICK":
      if (state.status !== "question") return state;
      if (state.timeLeft <= 1) return { ...state, timeLeft: 0 };
      return { ...state, timeLeft: state.timeLeft - 1 };

    case "TIMEOUT": {
      return {
        ...state,
        status: "feedback",
        timedOut: true,
        selectedAnswerId: null,
        lastPointsEarned: 0,
        streak: 0,
        answers: [
          ...state.answers,
          { questionId: action.questionId, selectedAnswerId: null, correct: false, pointsEarned: 0 },
        ],
      };
    }

    case "ANSWER": {
      const elapsed = Date.now() - state.questionStartTime;
      const pts = calcPoints(action.correct, action.timeLimit, elapsed, state.streak);
      return {
        ...state,
        status: action.question.type === "short_answer" ? "feedback" : "feedback",
        selectedAnswerId: action.answerId,
        timedOut: false,
        score: state.score + pts,
        streak: action.correct ? state.streak + 1 : 0,
        lastPointsEarned: pts,
        answers: [
          ...state.answers,
          { questionId: action.questionId, selectedAnswerId: action.answerId, correct: action.correct, pointsEarned: pts },
        ],
      };
    }

    case "SELF_GRADE": {
      const pts = action.correct ? calcPoints(true, action.timeLimit, Date.now() - state.questionStartTime, state.streak) : 0;
      return {
        ...state,
        status: "feedback",
        selfGrade: action.correct,
        score: state.score + pts,
        streak: action.correct ? state.streak + 1 : 0,
        lastPointsEarned: pts,
        answers: [
          ...state.answers,
          { questionId: action.questionId, selectedAnswerId: "self_grade", correct: action.correct, pointsEarned: pts },
        ],
      };
    }

    case "NEXT": {
      const isLast = action.currentIndex >= action.totalQuestions - 1;
      if (isLast) return { ...state, status: "results" };
      const nextIndex = action.currentIndex + 1;
      return {
        ...state,
        status: "question",
        currentIndex: nextIndex,
        timeLeft: action.timeLimit,
        questionStartTime: Date.now(),
        selectedAnswerId: null,
        timedOut: false,
        selfGrade: null,
        shortAnswerText: "",
      };
    }

    case "SET_SHORT_ANSWER":
      return { ...state, shortAnswerText: action.text };

    default:
      return state;
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function TopBar({ current, total, score, timeLeft, timeLimit }) {
  const pct = (timeLeft / timeLimit) * 100;
  const urgent = timeLeft <= 5;
  return (
    <div className="fixed left-0 right-0 top-0 z-10 bg-white">
      <div className="flex items-center justify-between px-6 py-3 md:px-12">
        <span className="text-sm font-medium text-gray-500">
          Q {current + 1} <span className="text-gray-300">/</span> {total}
        </span>
        <span className="text-lg font-bold tabular-nums text-gray-900">
          {score} pts
        </span>
        <span className={`text-sm font-semibold tabular-nums ${urgent ? "text-red-500" : "text-gray-500"}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="h-1 w-full bg-gray-100">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${urgent ? "bg-red-400" : "bg-gray-900"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AnswerButton({ label, text, state: btnState, onClick, disabled }) {
  const base = "relative flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-colors";
  const styles = {
    idle: "border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50",
    correct: "border-green-400 bg-green-50 text-green-800",
    wrong: "border-red-300 bg-red-50 text-red-700",
    dimmed: "border-gray-100 bg-gray-50 text-gray-300",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[btnState]}`}
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
        btnState === "correct" ? "bg-green-500 text-white" :
        btnState === "wrong" ? "bg-red-400 text-white" :
        "bg-gray-100 text-gray-500"
      }`}>
        {btnState === "correct" ? "✓" : btnState === "wrong" ? "✗" : label}
      </span>
      {text}
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function PlayPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useReducer((s, a) => a, null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef(null);

  // Load quiz from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("sq_quizzes") || "[]");
    const found = stored.find((q) => q.id === id);
    setQuiz(found || null);
  }, [id]);

  const currentQuestion = quiz?.questions[state.currentIndex];
  const timeLimit = currentQuestion?.timeLimit ?? 30;

  // Timer
  const handleTimeout = useCallback(() => {
    dispatch({ type: "TIMEOUT", questionId: currentQuestion?.id });
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (state.status !== "question") {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [state.status, state.currentIndex]);

  // Auto-timeout when timeLeft hits 0
  useEffect(() => {
    if (state.status === "question" && state.timeLeft === 0) {
      handleTimeout();
    }
  }, [state.timeLeft, state.status, handleTimeout]);

  // Auto-advance after feedback
  useEffect(() => {
    if (state.status !== "feedback") return;
    // Short answer waits for self-grade, not auto-advance
    if (currentQuestion?.type === "short_answer" && state.selfGrade === null) return;

    const t = setTimeout(() => {
      dispatch({ type: "NEXT", currentIndex: state.currentIndex, totalQuestions: quiz.questions.length, timeLimit });
    }, FEEDBACK_DURATION);
    return () => clearTimeout(t);
  }, [state.status, state.selfGrade, state.currentIndex, quiz, timeLimit, currentQuestion?.type]);

  function handleAnswer(answerId, isCorrect) {
    dispatch({ type: "ANSWER", answerId, correct: isCorrect, questionId: currentQuestion.id, timeLimit, question: currentQuestion });
  }

  function getButtonState(answer) {
    if (state.status !== "feedback") return "idle";
    if (answer.isCorrect) return "correct";
    if (answer.id === state.selectedAnswerId) return "wrong";
    return "dimmed";
  }

  // ── Not found ──
  if (quiz === null && typeof window !== "undefined") {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Quiz not found.{" "}
        <a href="/dashboard" className="ml-1 underline">Dashboard</a>
      </div>
    );
  }
  if (!quiz) return null;

  // ── Intro ──
  if (state.status === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <p className="mb-3 text-sm font-medium text-gray-400">Quiz</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          {quiz.title}
        </h1>
        <p className="mb-10 text-gray-400">{quiz.questions.length} questions</p>
        <button
          onClick={() => dispatch({ type: "START", timeLimit })}
          className="rounded-2xl bg-gray-900 px-8 py-4 text-base font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          Start Quiz →
        </button>
        <a href={`/quiz/${id}`} className="mt-4 text-sm text-gray-400 hover:text-gray-600">
          ← Back to preview
        </a>
      </div>
    );
  }

  // ── Results ──
  if (state.status === "results") {
    const correctCount = state.answers.filter((a) => a.correct).length;
    const pct = Math.round((correctCount / quiz.questions.length) * 100);
    return (
      <div className="min-h-screen bg-white px-6 py-12 md:py-20">
        <div className="mx-auto max-w-2xl">
          {/* Score card */}
          <div className="mb-10 rounded-3xl bg-gray-50 px-8 py-10 text-center">
            <p className="mb-1 text-sm font-medium text-gray-400">Final Score</p>
            <p className="text-6xl font-bold tracking-tight text-gray-900">{state.score}</p>
            <p className="mt-2 text-gray-400">pts</p>
            <div className="mt-6 flex justify-center gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{correctCount}/{quiz.questions.length}</p>
                <p className="text-xs text-gray-400">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pct}%</p>
                <p className="text-xs text-gray-400">Score</p>
              </div>
            </div>
          </div>

          {/* Per-question breakdown */}
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">Breakdown</h2>
          <div className="mb-10 space-y-3">
            {quiz.questions.map((q, i) => {
              const attempt = state.answers[i];
              const correct = attempt?.correct;
              const correctAnswer = q.answers?.find((a) => a.isCorrect);
              return (
                <div key={q.id} className={`rounded-2xl border px-5 py-4 ${correct ? "border-green-100 bg-green-50" : "border-red-100 bg-red-50"}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 shrink-0 text-base ${correct ? "text-green-500" : "text-red-400"}`}>
                      {correct ? "✓" : "✗"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">{q.question}</p>
                      {!correct && correctAnswer && (
                        <p className="mt-1 text-xs text-gray-500">
                          Correct: <span className="font-medium text-gray-700">{correctAnswer.text}</span>
                        </p>
                      )}
                      {!correct && q.type === "short_answer" && (
                        <p className="mt-1 text-xs text-gray-500">
                          Model answer: <span className="font-medium text-gray-700">{q.modelAnswer}</span>
                        </p>
                      )}
                    </div>
                    <span className="ml-auto shrink-0 text-sm font-semibold text-gray-500">
                      +{attempt?.pointsEarned ?? 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Play Again
            </button>
            <a
              href="/dashboard"
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Question / Feedback ──
  const isFeedback = state.status === "feedback";
  const isShortAnswer = currentQuestion.type === "short_answer";
  const isTrueFalse = currentQuestion.type === "true_false";

  return (
    <div className="min-h-screen bg-white">
      <TopBar
        current={state.currentIndex}
        total={quiz.questions.length}
        score={state.score}
        timeLeft={state.timeLeft}
        timeLimit={timeLimit}
      />

      <div className="mx-auto max-w-2xl px-6 pb-16 pt-24">
        {/* Points earned flash */}
        {isFeedback && state.lastPointsEarned > 0 && (
          <div className="mb-4 text-center text-sm font-semibold text-green-600">
            +{state.lastPointsEarned} pts
            {state.streak > 1 && <span className="ml-2 text-amber-500">🔥 {state.streak} streak</span>}
          </div>
        )}
        {isFeedback && state.timedOut && (
          <div className="mb-4 text-center text-sm font-semibold text-red-500">Time&apos;s up!</div>
        )}

        {/* Question */}
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
            Question {state.currentIndex + 1}
          </p>
          <h2 className="text-2xl font-bold leading-snug text-gray-900 md:text-3xl">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Short answer */}
        {isShortAnswer && (
          <div className="space-y-4">
            {state.selfGrade === null ? (
              <>
                <textarea
                  value={state.shortAnswerText}
                  onChange={(e) => dispatch({ type: "SET_SHORT_ANSWER", text: e.target.value })}
                  disabled={isFeedback}
                  rows={4}
                  placeholder="Type your answer..."
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50"
                />
                {!isFeedback && (
                  <button
                    onClick={() => dispatch({ type: "ANSWER", answerId: "short_answer", correct: false, questionId: currentQuestion.id, timeLimit, question: currentQuestion })}
                    disabled={!state.shortAnswerText.trim()}
                    className="w-full rounded-2xl bg-gray-900 py-3 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    Submit Answer
                  </button>
                )}
                {isFeedback && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4">
                    <p className="mb-3 text-sm font-semibold text-amber-800">Model answer:</p>
                    <p className="mb-4 text-sm text-amber-700">{currentQuestion.modelAnswer}</p>
                    <p className="mb-3 text-xs font-medium text-gray-500">Did you get it right?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => dispatch({ type: "SELF_GRADE", correct: true, questionId: currentQuestion.id, timeLimit })}
                        className="flex-1 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white"
                      >
                        ✓ Yes
                      </button>
                      <button
                        onClick={() => dispatch({ type: "SELF_GRADE", correct: false, questionId: currentQuestion.id, timeLimit })}
                        className="flex-1 rounded-xl bg-red-400 py-2.5 text-sm font-semibold text-white"
                      >
                        ✗ No
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={`rounded-2xl px-5 py-4 text-center text-sm font-semibold ${state.selfGrade ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {state.selfGrade ? `✓ Marked correct · +${state.lastPointsEarned} pts` : "✗ Marked incorrect"}
              </div>
            )}
            {currentQuestion.explanation && isFeedback && state.selfGrade !== null && (
              <p className="text-center text-xs text-gray-400">{currentQuestion.explanation}</p>
            )}
          </div>
        )}

        {/* True / False */}
        {isTrueFalse && (
          <div className="flex flex-col gap-3 sm:flex-row">
            {currentQuestion.answers.map((answer) => (
              <AnswerButton
                key={answer.id}
                label={answer.text}
                text={answer.text}
                state={getButtonState(answer)}
                disabled={isFeedback}
                onClick={() => handleAnswer(answer.id, answer.isCorrect)}
              />
            ))}
            {isFeedback && currentQuestion.explanation && (
              <p className="mt-2 w-full text-center text-xs text-gray-400">{currentQuestion.explanation}</p>
            )}
          </div>
        )}

        {/* Multiple choice */}
        {!isShortAnswer && !isTrueFalse && (
          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.answers.map((answer, i) => (
              <AnswerButton
                key={answer.id}
                label={ANSWER_LABELS[i]}
                text={answer.text}
                state={getButtonState(answer)}
                disabled={isFeedback}
                onClick={() => handleAnswer(answer.id, answer.isCorrect)}
              />
            ))}
            {isFeedback && currentQuestion.explanation && (
              <p className="col-span-2 mt-1 text-center text-xs text-gray-400">
                {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
