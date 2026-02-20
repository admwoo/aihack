"use client";

import { useState, useEffect, useReducer, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

// ─── Sprite Data (from throwing-demo) ────────────────────────────────────────

const SPRITES = {
  spud_right: "data:image/webp;base64,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",
  tomato_left: "data:image/webp;base64,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",
};

// ─── Animation Config ─────────────────────────────────────────────────────────

const THROW_CONFIG = {
  duration: 700,
  arcHeight: 110,
  spinSpeed: 720,
  hitShakeDuration: 400,
  windupDuration: 220,
};

function getArcPosition(progress, sx, sy, ex, ey, arcH, spin) {
  const x = sx + (ex - sx) * progress;
  const baseY = sy + (ey - sy) * progress;
  const arc = -4 * arcH * progress * (progress - 1);
  return { x, y: baseY - arc, rotation: spin * progress };
}

// ─── Splat Effect ─────────────────────────────────────────────────────────────

function SplatEffect({ x, y, onDone }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.(); }, 600);
    return () => clearTimeout(t);
  }, [onDone]);
  if (!visible) return null;
  const colors = ["#ff6b35", "#ffd166", "#ef476f", "#06d6a0", "#f4a261"];
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 20 + Math.random() * 30;
    return {
      angle, dist,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 100 }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: p.color,
          animation: `splatParticle 500ms ease-out forwards`,
          ["--dx"]: `${Math.cos(p.angle) * p.dist}px`,
          ["--dy"]: `${Math.sin(p.angle) * p.dist}px`,
        }} />
      ))}
      <div style={{
        position: "absolute", fontSize: 20,
        transform: "translate(-50%, -50%)",
        animation: "splatFade 400ms ease-out forwards",
      }}>💥</div>
    </div>
  );
}

// ─── Flying Food ──────────────────────────────────────────────────────────────

function FlyingFood({ food, startX, startY, endX, endY, onHit }) {
  const [pos, setPos] = useState({ x: startX, y: startY, rotation: 0 });
  const startTime = useRef(null);
  useEffect(() => {
    let raf;
    const animate = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / THROW_CONFIG.duration, 1);
      const { x, y, rotation } = getArcPosition(
        progress, startX, startY, endX, endY, THROW_CONFIG.arcHeight, THROW_CONFIG.spinSpeed
      );
      setPos({ x, y, rotation });
      if (progress < 1) raf = requestAnimationFrame(animate);
      else onHit?.();
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{
      position: "absolute", left: pos.x, top: pos.y, fontSize: 30,
      transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
      pointerEvents: "none", zIndex: 50,
      filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.3))",
    }}>
      {food}
    </div>
  );
}

// ─── Character ────────────────────────────────────────────────────────────────

function Character({ sprite, side, animState }) {
  const getTransform = () => {
    if (animState === "windup") {
      const pullX = side === "left" ? -12 : 12;
      return `translateX(${pullX}px) rotate(${side === "left" ? -8 : 8}deg) scaleY(0.92) scaleX(1.08)`;
    }
    if (animState === "throw") {
      const lungeX = side === "left" ? 18 : -18;
      return `translateX(${lungeX}px) rotate(${side === "left" ? 5 : -5}deg) scaleY(1.05) scaleX(0.95)`;
    }
    if (animState === "hit") return "scaleX(1.15) scaleY(0.85)";
    return "none";
  };
  return (
    <div style={{
      display: "inline-block",
      transition: animState === "idle" ? "transform 0.3s ease" : "transform 0.15s cubic-bezier(0.17,0.67,0.83,0.67)",
      transform: getTransform(),
      animation: animState === "idle"
        ? "idleBounce 1.5s ease-in-out infinite"
        : animState === "hit"
          ? `hitShake ${THROW_CONFIG.hitShakeDuration}ms ease-out`
          : "none",
    }}>
      <img
        src={sprite}
        alt={side === "left" ? "You" : "Chef Bot"}
        style={{
          width: 90, height: "auto",
          imageRendering: "auto",
          filter: animState === "hit"
            ? "brightness(1.4) saturate(1.3) drop-shadow(3px 6px 8px rgba(0,0,0,0.3))"
            : "drop-shadow(3px 6px 8px rgba(0,0,0,0.25))",
        }}
      />
    </div>
  );
}

// ─── Game Constants ───────────────────────────────────────────────────────────

const QUESTION_TYPE_OPTIONS = [
  { id: "multiple_choice", label: "Multiple Choice" },
  { id: "true_false", label: "True / False" },
  { id: "short_answer", label: "Short Answer" },
];

const FOOD_EMOJIS = ["🍕","🌮","🍔","🍟","🌯","🥪","🍜","🧆","🥚","🍳","🧇","🥞","🫔","🥗","🍱"];
const PLAYER_DAMAGE = 20;
const WRONG_DAMAGE  = 15;
const AI_DAMAGE     = 20;
const STARTING_HP   = 100;
const FEEDBACK_MS   = 2200;
const AI_THINK_MS   = 1800;
const ANSWER_LABELS = ["A", "B", "C", "D"];

const DIFFICULTY = {
  easy:   { label: "Easy",   accuracy: 0.40, color: "text-green-600" },
  normal: { label: "Normal", accuracy: 0.65, color: "text-amber-600" },
  hard:   { label: "Hard",   accuracy: 0.85, color: "text-red-600"   },
};

function randomFood() {
  return FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
}

// ─── Game Reducer ─────────────────────────────────────────────────────────────

const init = (difficulty = "normal") => ({
  status: "setup",
  difficulty,
  currentIndex: 0,
  playerHP: STARTING_HP,
  aiHP: STARTING_HP,
  timeLeft: 30,
  selectedAnswerId: null,
  playerCorrect: null,
  aiCorrect: null,
  foodEmoji: "🍕",
  roundLog: [],
  winner: null,
});

function reducer(state, action) {
  switch (action.type) {
    case "SET_DIFFICULTY":
      return { ...state, difficulty: action.difficulty };
    case "START":
      return { ...state, status: "player_turn", timeLeft: action.timeLimit, selectedAnswerId: null };
    case "TICK":
      if (state.status !== "player_turn" || state.timeLeft <= 1)
        return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };
      return { ...state, timeLeft: state.timeLeft - 1 };
    case "PLAYER_ANSWER": {
      const correct = action.correct;
      return {
        ...state,
        status: "player_feedback",
        selectedAnswerId: action.answerId,
        playerCorrect: correct,
        aiHP: correct ? Math.max(0, state.aiHP - PLAYER_DAMAGE) : state.aiHP,
        playerHP: !correct ? Math.max(0, state.playerHP - WRONG_DAMAGE) : state.playerHP,
        foodEmoji: randomFood(),
        roundLog: [...state.roundLog, { question: action.questionText, playerCorrect: correct, aiCorrect: null }],
      };
    }
    case "PLAYER_TIMEOUT": {
      return {
        ...state,
        status: "player_feedback",
        selectedAnswerId: null,
        playerCorrect: false,
        playerHP: Math.max(0, state.playerHP - WRONG_DAMAGE),
        foodEmoji: randomFood(),
        roundLog: [...state.roundLog, { question: action.questionText, playerCorrect: false, aiCorrect: null }],
      };
    }
    case "AI_ANSWER": {
      const correct = action.correct;
      const newPlayerHP = correct ? Math.max(0, state.playerHP - AI_DAMAGE) : state.playerHP;
      const log = [...state.roundLog];
      log[log.length - 1] = { ...log[log.length - 1], aiCorrect: correct };
      const aiHP = state.aiHP;
      const playerHP = newPlayerHP;
      const lastQuestion = state.currentIndex >= action.totalQuestions - 1;
      if (aiHP <= 0 && playerHP <= 0) return { ...state, status: "game_over", winner: "draw", aiCorrect: correct, playerHP, roundLog: log };
      if (aiHP <= 0) return { ...state, status: "game_over", winner: "player", aiCorrect: correct, playerHP, roundLog: log };
      if (playerHP <= 0) return { ...state, status: "game_over", winner: "ai", aiCorrect: correct, playerHP, roundLog: log };
      if (lastQuestion) {
        const winner = aiHP < playerHP ? "player" : playerHP < aiHP ? "ai" : "draw";
        return { ...state, status: "game_over", winner, aiCorrect: correct, playerHP, roundLog: log };
      }
      return { ...state, status: "ai_feedback", aiCorrect: correct, playerHP, foodEmoji: randomFood(), roundLog: log };
    }
    case "NEXT_ROUND":
      return {
        ...state,
        status: "player_turn",
        currentIndex: state.currentIndex + 1,
        timeLeft: action.timeLimit,
        selectedAnswerId: null,
        playerCorrect: null,
        aiCorrect: null,
      };
    case "GAME_OVER": {
      const winner =
        state.aiHP <= 0 && state.playerHP <= 0 ? "draw"
        : state.aiHP <= 0 ? "player"
        : "ai";
      return { ...state, status: "game_over", winner };
    }
    default:
      return state;
  }
}

// ─── HP Bar ──────────────────────────────────────────────────────────────────

function HPBar({ hp, maxHP = STARTING_HP, label, align = "left" }) {
  const pct = Math.max(0, (hp / maxHP) * 100);
  const barColor = pct > 50 ? "#4caf50" : pct > 25 ? "#f59e0b" : "#ef4444";
  return (
    <div className={`flex flex-1 items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
      <span className="shrink-0 text-sm font-semibold text-amber-100">{label}</span>
      <div className="h-4 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(0,0,0,0.35)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)` }}
        />
      </div>
      <span className="shrink-0 text-base font-bold tabular-nums" style={{ color: "#7dff7d" }}>{hp}</span>
    </div>
  );
}

// ─── Answer Button ────────────────────────────────────────────────────────────

function AnswerBtn({ label, text, btnState, onClick, disabled }) {
  const styles = {
    idle:    "border-amber-200 text-amber-900 hover:border-amber-400 hover:brightness-95",
    correct: "border-green-400 bg-green-50 text-green-800",
    wrong:   "border-red-300 bg-red-50 text-red-700",
    dimmed:  "border-amber-100/60 text-amber-900/40",
  };
  const bgStyle = {
    idle:    { background: "rgba(255,252,248,0.88)", backdropFilter: "blur(4px)" },
    correct: {},
    wrong:   {},
    dimmed:  { background: "rgba(255,252,248,0.4)", backdropFilter: "blur(4px)" },
  };
  const labelStyles = {
    idle:    "text-amber-800",
    correct: "bg-green-500 text-white",
    wrong:   "bg-red-400 text-white",
    dimmed:  "text-amber-900/40",
  };
  const labelBg = {
    idle:   { background: "#e8cdb5" },
    correct: {},
    wrong:   {},
    dimmed:  { background: "rgba(232,205,181,0.4)" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={bgStyle[btnState]}
      className={`flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition-all ${styles[btnState]}`}
    >
      <span
        style={labelBg[btnState]}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${labelStyles[btnState]}`}
      >
        {btnState === "correct" ? "✓" : btnState === "wrong" ? "✗" : label}
      </span>
      {text}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BattlePage() {
  const { id } = useParams();
  const [studySet, setStudySet] = useReducer((_, a) => a, null);
  const [questions, setQuestions] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  // Setup options (picked before generation)
  const [qCount, setQCount] = useState(10);
  const [qTypes, setQTypes] = useState(["multiple_choice", "true_false"]);
  const [state, dispatch] = useReducer(reducer, "normal", init);
  const timerRef = useRef(null);

  // Animation state
  const [charStates, setCharStates] = useState({ spud: "idle", tomato: "idle" });
  const [projectiles, setProjectiles] = useState([]);
  const [splats, setSplats] = useState([]);
  const arenaRef = useRef(null);
  const idCounter = useRef(0);
  const [report, setReport] = useState(null);   // null = not started, string = content (may be streaming)
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("sq_studysets") || "[]");
    setStudySet(stored.find((s) => s.id === id) ?? null);
  }, [id]);

  const q = questions?.[state.currentIndex];
  const timeLimit = q?.timeLimit ?? 30;

  // Timer
  useEffect(() => {
    if (state.status !== "player_turn") { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(timerRef.current);
  }, [state.status, state.currentIndex]);

  useEffect(() => {
    if (state.status === "player_turn" && state.timeLeft === 0) {
      dispatch({ type: "PLAYER_TIMEOUT", questionText: q?.question });
    }
  }, [state.timeLeft, state.status, q?.question]);

  // After player feedback → trigger AI turn (or end game if HP hit 0)
  useEffect(() => {
    if (state.status !== "player_feedback") return;
    if (state.aiHP <= 0 || state.playerHP <= 0) {
      // HP hit 0 from player's answer — let the throw animation play, then end
      const t = setTimeout(() => dispatch({ type: "GAME_OVER" }), FEEDBACK_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const accuracy = DIFFICULTY[state.difficulty]?.accuracy ?? 0.65;
      const aiCorrect = Math.random() < accuracy;
      setTimeout(() => {
        dispatch({ type: "AI_ANSWER", correct: aiCorrect, totalQuestions: questions.length });
      }, AI_THINK_MS);
    }, FEEDBACK_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  // After AI feedback → next round
  useEffect(() => {
    if (state.status !== "ai_feedback") return;
    const t = setTimeout(() => {
      dispatch({ type: "NEXT_ROUND", timeLimit });
    }, FEEDBACK_MS);
    return () => clearTimeout(t);
  }, [state.status, timeLimit]);

  // ── Throw animation trigger ──
  const triggerThrow = useCallback((thrower) => {
    setCharStates((prev) => ({ ...prev, [thrower]: "windup" }));
    setTimeout(() => {
      setCharStates((prev) => ({ ...prev, [thrower]: "throw" }));
      const arena = arenaRef.current;
      if (!arena) return;
      const arenaW = arena.offsetWidth;
      const arenaH = arena.offsetHeight;
      const startX = thrower === "spud" ? 85 : arenaW - 85;
      const startY = arenaH * 0.45;
      const endX = thrower === "spud" ? arenaW - 85 : 85;
      const endY = arenaH * 0.42;
      const foodId = idCounter.current++;
      setProjectiles((prev) => [...prev, { id: foodId, food: randomFood(), startX, startY, endX, endY, thrower }]);
      setTimeout(() => setCharStates((prev) => ({ ...prev, [thrower]: "idle" })), 300);
    }, THROW_CONFIG.windupDuration);
  }, []);

  const handleProjectileHit = useCallback((projectileId, thrower) => {
    setProjectiles((prev) => prev.filter((p) => p.id !== projectileId));
    const target = thrower === "spud" ? "tomato" : "spud";
    const arena = arenaRef.current;
    const arenaW = arena ? arena.offsetWidth : 600;
    const arenaH = arena ? arena.offsetHeight : 200;
    const splatX = thrower === "spud" ? arenaW - 85 : 85;
    const splatY = arenaH * 0.42;
    setCharStates((prev) => ({ ...prev, [target]: "hit" }));
    setTimeout(() => setCharStates((prev) => ({ ...prev, [target]: "idle" })), THROW_CONFIG.hitShakeDuration);
    setSplats((prev) => [...prev, { id: idCounter.current++, x: splatX, y: splatY }]);
  }, []);

  const removeSplat = useCallback((id) => {
    setSplats((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Trigger throw on player feedback
  useEffect(() => {
    if (state.status !== "player_feedback") return;
    triggerThrow(state.playerCorrect ? "spud" : "tomato");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  // Fetch post-game report when battle ends
  useEffect(() => {
    if (state.status !== "game_over" || !questions || !studySet) return;

    const missedQuestions = state.roundLog
      .map((round, i) => {
        const q = questions[i];
        if (!q || round.playerCorrect) return null;
        const correctAnswer =
          q.type === "short_answer"
            ? q.modelAnswer
            : q.answers?.find((a) => a.isCorrect)?.text || "";
        return { question: round.question, correctAnswer, explanation: q.explanation || "" };
      })
      .filter(Boolean);

    const correctCount = state.roundLog.filter((r) => r.playerCorrect).length;

    async function fetchReport() {
      setReportLoading(true);
      setReport("");
      try {
        const res = await fetch("/api/game-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studySetTitle: studySet.title,
            totalQuestions: state.roundLog.length,
            playerCorrect: correctCount,
            missedQuestions,
            winner: state.winner,
            playerHP: state.playerHP,
            aiHP: state.aiHP,
          }),
        });
        if (!res.ok) throw new Error("Report generation failed.");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setReport((prev) => (prev ?? "") + decoder.decode(value, { stream: true }));
        }
      } catch {
        setReport("Could not generate report. Try again later.");
      } finally {
        setReportLoading(false);
      }
    }

    fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  // Trigger throw on AI feedback
  useEffect(() => {
    if (state.status !== "ai_feedback") return;
    if (state.aiCorrect) triggerThrow("tomato");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  function handleAnswer(answerId, isCorrect) {
    dispatch({ type: "PLAYER_ANSWER", answerId, correct: isCorrect, questionText: q?.question });
  }

  function getBtnState(answer) {
    if (state.status === "player_turn") return "idle";
    if (answer.isCorrect) return "correct";
    if (answer.id === state.selectedAnswerId) return "wrong";
    return "dimmed";
  }

  if (studySet === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Study set not found. <a href="/dashboard" className="ml-1 underline">Dashboard</a>
      </div>
    );
  }
  if (!studySet) return null;

  // ── Setup screen ──
  if (state.status === "setup") {
    async function startBattle() {
      if (qTypes.length === 0) return;
      setGenerating(true);
      setGenError(null);
      try {
        const form = new FormData();
        form.append("source", "text");
        form.append("title", studySet.title);
        form.append("count", String(qCount));
        form.append("types", qTypes.join(","));
        form.append("text", studySet.text);
        const res = await fetch("/api/generate-questions", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Generation failed.");
        setQuestions(data.quiz.questions);
        dispatch({ type: "START", timeLimit: 30 });
      } catch (err) {
        setGenError(err.message);
      } finally {
        setGenerating(false);
      }
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ background: "linear-gradient(170deg, #ffecd2 0%, #fcb69f 60%, #ff9a76 100%)" }}>
        <p className="mb-2 text-5xl">🍳</p>
        <h1 className="mb-1 text-4xl font-bold tracking-tight" style={{ color: "#5a2d0c" }}>Ready to get Cooked?</h1>
        <p className="mb-2 font-semibold" style={{ color: "#8b5e3c" }}>{studySet.title}</p>
        <p className="mb-8 text-sm" style={{ color: "#a07050" }}>{STARTING_HP} HP each</p>

        <div className="w-full max-w-xs space-y-6 text-left">
          {/* Question count */}
          <div>
            <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
              <span>Number of Questions</span>
              <span className="text-gray-900">{qCount}</span>
            </label>
            <input
              type="range" min={5} max={20} step={1} value={qCount}
              onChange={(e) => setQCount(Number(e.target.value))}
              className="w-full accent-gray-900"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>5</span><span>20</span>
            </div>
          </div>

          {/* Question types */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Question Types</p>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPE_OPTIONS.map((qt) => (
                <button
                  key={qt.id}
                  type="button"
                  onClick={() => setQTypes((prev) =>
                    prev.includes(qt.id) ? prev.filter((t) => t !== qt.id) : [...prev, qt.id]
                  )}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    qTypes.includes(qt.id)
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Difficulty</p>
            <div className="flex flex-col gap-2">
              {Object.entries(DIFFICULTY).map(([key, { label, accuracy, color }]) => (
                <button
                  key={key}
                  onClick={() => dispatch({ type: "SET_DIFFICULTY", difficulty: key })}
                  className={`rounded-xl border px-5 py-3 text-sm font-medium transition-colors ${
                    state.difficulty === key
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className={state.difficulty === key ? "text-white" : color}>{label}</span>
                  <span className="ml-2 text-xs opacity-60">({Math.round(accuracy * 100)}% AI accuracy)</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {genError && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 max-w-xs w-full text-left">
            {genError}
          </p>
        )}

        <button
          onClick={startBattle}
          disabled={generating || qTypes.length === 0}
          className="mt-8 px-10 py-4 text-lg font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1"
          style={{
            borderRadius: 50,
            background: "linear-gradient(135deg, #e8a849, #e07b30)",
            boxShadow: "0 5px 0 #b86a20, 0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {generating ? "Generating questions…" : "Start Battle 🍕"}
        </button>
        <a href="/dashboard" className="mt-4 text-sm font-semibold" style={{ color: "#8b5e3c" }}>← Back to dashboard</a>
      </div>
    );
  }

  // ── Game Over ──
  if (state.status === "game_over") {
    const won = state.winner === "player";
    const draw = state.winner === "draw";
    return (
      <div className="min-h-screen px-6 py-12 md:py-20" style={{ background: "linear-gradient(170deg, #ffecd2 0%, #fcb69f 60%, #ff9a76 100%)" }}>
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-2 text-6xl">{won ? "🏆" : draw ? "🤝" : "💀"}</p>
          <h1 className="mb-2 text-4xl font-bold tracking-tight" style={{ color: "#5a2d0c" }}>
            {won ? "You won!" : draw ? "It's a draw!" : "You got cooked!"}
          </h1>
          <p className="mb-8 font-semibold" style={{ color: "#8b5e3c" }}>
            {won ? "Chef Bot has been served." : draw ? "Both fighters standing." : "Chef Bot wins this round."}
          </p>
          <div className="mb-10 flex justify-center gap-12">
            <div>
              <p className="text-3xl font-bold" style={{ color: "#5a2d0c" }}>{state.playerHP}</p>
              <p className="text-xs font-semibold" style={{ color: "#a07050" }}>Your HP</p>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#c9a07a" }}>vs</div>
            <div>
              <p className="text-3xl font-bold" style={{ color: "#5a2d0c" }}>{state.aiHP}</p>
              <p className="text-xs font-semibold" style={{ color: "#a07050" }}>Chef Bot HP</p>
            </div>
          </div>
          <div className="mb-10 text-left">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#a07050" }}>Round Breakdown</p>
            <div className="space-y-2">
              {state.roundLog.map((round, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ background: "rgba(255,252,248,0.75)", borderColor: "#e8cdb5" }}>
                  <span className="w-6 shrink-0 text-xs font-bold" style={{ color: "#a07050" }}>R{i + 1}</span>
                  <p className="flex-1 truncate text-xs" style={{ color: "#5a2d0c" }}>{round.question}</p>
                  <span className={`shrink-0 text-xs font-bold ${round.playerCorrect ? "text-green-700" : "text-red-600"}`}>
                    You: {round.playerCorrect ? "✓" : "✗"}
                  </span>
                  {round.aiCorrect !== null && (
                    <span className={`shrink-0 text-xs font-bold ${round.aiCorrect ? "text-amber-700" : "text-amber-400"}`}>
                      AI: {round.aiCorrect ? "✓" : "✗"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* AI Study Report */}
          <div className="mb-10 text-left">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#a07050" }}>
              Study Coach Report
            </p>
            {report === null && reportLoading && (
              <div className="rounded-2xl border px-6 py-8 text-center" style={{ background: "rgba(255,252,248,0.7)", borderColor: "#e8cdb5" }}>
                <p className="text-sm font-semibold" style={{ color: "#a07050" }}>Generating your study report…</p>
              </div>
            )}
            {report !== null && (
              <div className="rounded-2xl border px-6 py-5" style={{ background: "rgba(255,252,248,0.85)", borderColor: "#e8cdb5" }}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "#3d1e08" }}>{report}</p>
                {reportLoading && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-amber-500" />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full border px-6 py-3 text-sm font-bold transition-all hover:brightness-95"
              style={{ background: "rgba(255,252,248,0.85)", borderColor: "#e8cdb5", color: "#5a2d0c" }}
            >
              Rematch
            </button>
            <a
              href="/dashboard"
              className="rounded-full px-6 py-3 text-sm font-bold text-white transition-all active:translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #e8a849, #e07b30)", boxShadow: "0 4px 0 #b86a20" }}
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Battle screen ──
  const isPlayerTurn     = state.status === "player_turn";
  const isPlayerFeedback = state.status === "player_feedback";
  const isAiFeedback     = state.status === "ai_feedback";
  const isFeedback       = isPlayerFeedback || isAiFeedback;
  const isAiThinking     = isPlayerFeedback && state.aiHP > 0 && state.playerHP > 0;
  const timerPct         = (state.timeLeft / timeLimit) * 100;
  const timerUrgent      = state.timeLeft <= 5 && isPlayerTurn;

  let feedbackMsg = null;
  if (isPlayerFeedback) {
    feedbackMsg = state.playerCorrect
      ? `Nice throw! Chef Bot lost ${PLAYER_DAMAGE} HP!`
      : `You fumbled! You lost ${WRONG_DAMAGE} HP!`;
  } else if (isAiFeedback) {
    feedbackMsg = state.aiCorrect
      ? `Chef Bot fires back! You lost ${AI_DAMAGE} HP!`
      : `Chef Bot missed! No damage!`;
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(170deg, #ffecd2 0%, #fcb69f 60%, #ff9a76 100%)" }}>
      {/* Keyframe animations */}
      <style>{`
        @keyframes idleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes hitShake {
          0%   { transform: translateX(0) scaleX(1.15) scaleY(0.85); }
          20%  { transform: translateX(-12px) scaleX(1.05) scaleY(0.95); }
          40%  { transform: translateX(8px) scaleX(1) scaleY(1); }
          60%  { transform: translateX(-5px); }
          80%  { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }
        @keyframes splatParticle {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.3); opacity: 0; }
        }
        @keyframes splatFade {
          0%   { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* HP Bars */}
      <div className="px-4 pt-3 md:px-8">
        <div className="mx-auto flex max-w-2xl items-center gap-4 rounded-2xl px-5 py-3" style={{ background: "rgba(40,30,20,0.88)" }}>
          <HPBar hp={state.aiHP} label="Chef Bot" align="left" />
          <span className="shrink-0 text-lg font-bold" style={{ color: "#ffd166", letterSpacing: 2 }}>VS</span>
          <HPBar hp={state.playerHP} label="You" align="right" />
        </div>
      </div>

      {/* Timer bar */}
      <div className="mt-2 h-1.5 w-full" style={{ background: "rgba(0,0,0,0.15)" }}>
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{ width: isPlayerTurn ? `${timerPct}%` : "0%", background: timerUrgent ? "#ef4444" : "#e8a849" }}
        />
      </div>

      {/* Battle Arena */}
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <div
          ref={arenaRef}
          style={{
            position: "relative",
            height: 220,
            backgroundImage: "url('/KitchenImage.png')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            borderRadius: 20,
            border: "3px solid #c9a07a",
            overflow: "hidden",
            boxShadow: "inset 0 -8px 20px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.15)",
          }}
        >
          {/* Floor tile overlay at bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
            background: "repeating-conic-gradient(#e8d5b7 0% 25%, #dfc9a8 0% 50%) 0 0 / 36px 36px",
            opacity: 0.55,
          }} />
          {/* Slight dark overlay so characters pop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.08)" }} />

          {/* VS label */}
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 28, fontWeight: 700,
            color: "rgba(139,94,60,0.12)",
            fontFamily: "sans-serif",
          }}>VS</div>

          {/* Spud — left (player) */}
          <div style={{
            position: "absolute", left: 18, bottom: 28,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <Character sprite={SPRITES.spud_right} side="left" animState={charStates.spud} />
            <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, letterSpacing: 1, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>YOU</span>
          </div>

          {/* Tomato — right (Chef Bot) */}
          <div style={{
            position: "absolute", right: 18, bottom: 28,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <Character sprite={SPRITES.tomato_left} side="right" animState={charStates.tomato} />
            <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, letterSpacing: 1, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>BOT</span>
          </div>

          {/* Projectiles */}
          {projectiles.map((p) => (
            <FlyingFood
              key={p.id}
              food={p.food}
              startX={p.startX} startY={p.startY}
              endX={p.endX} endY={p.endY}
              onHit={() => handleProjectileHit(p.id, p.thrower)}
            />
          ))}

          {/* Splats */}
          {splats.map((s) => (
            <SplatEffect key={s.id} x={s.x} y={s.y} onDone={() => removeSplat(s.id)} />
          ))}

          {/* Feedback overlay strip */}
          {isFeedback && feedbackMsg && (
            <div style={{
              position: "absolute", top: 10, left: "50%",
              transform: "translateX(-50%)",
              background: isPlayerFeedback && state.playerCorrect ? "rgba(34,197,94,0.9)"
                : isAiFeedback && state.aiCorrect ? "rgba(239,68,68,0.9)"
                : "rgba(107,114,128,0.85)",
              color: "#fff",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: "nowrap",
              zIndex: 60,
            }}>
              {isPlayerFeedback ? (state.playerCorrect ? "🍕 " : "💥 ") : (state.aiCorrect ? "🍅 " : "😅 ")}
              {feedbackMsg}
            </div>
          )}

          {/* AI thinking indicator */}
          {isAiThinking && !isAiFeedback && (
            <div style={{
              position: "absolute", bottom: 8, left: "50%",
              transform: "translateX(-50%)",
              fontSize: 10, color: "#a07850", fontWeight: 600,
            }}>
              🤖 Chef Bot thinking…
            </div>
          )}
        </div>
      </div>

      {/* Question area */}
      <div className="mx-auto max-w-2xl px-6 py-6">
        {/* Turn indicator */}
        <div className="mb-4 text-center">
          {isPlayerTurn && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-white" style={{ background: "#5a2d0c" }}>
              ⚡ Your Turn · {state.timeLeft}s
            </span>
          )}
          {!isPlayerTurn && !isFeedback && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold" style={{ background: "rgba(255,252,248,0.7)", color: "#8b5e3c" }}>
              🤖 Chef Bot is thinking...
            </span>
          )}
        </div>

        {/* Round counter */}
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: "#a07050" }}>
          Round {state.currentIndex + 1} of {questions?.length ?? "?"}
        </p>

        {/* Question */}
        <h2 className="mb-6 text-center text-xl font-bold leading-snug md:text-2xl" style={{ color: "#2a1505" }}>
          {q.question}
        </h2>

        {/* Answers */}
        {q.type === "true_false" ? (
          <div className="flex gap-3">
            {q.answers.map((a) => (
              <AnswerBtn
                key={a.id}
                label={a.text}
                text={a.text}
                btnState={isFeedback ? getBtnState(a) : "idle"}
                disabled={!isPlayerTurn}
                onClick={() => handleAnswer(a.id, a.isCorrect)}
              />
            ))}
          </div>
        ) : q.type === "short_answer" ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-center text-sm text-gray-500">
            <p className="mb-1 font-medium text-gray-700">Short Answer</p>
            <p>{q.question}</p>
            {isFeedback && (
              <p className="mt-3 text-xs text-gray-400">Model answer: <span className="font-medium text-gray-600">{q.modelAnswer}</span></p>
            )}
            {isPlayerTurn && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => dispatch({ type: "PLAYER_ANSWER", answerId: "self_correct", correct: true, questionText: q.question })}
                  className="flex-1 rounded-xl bg-green-500 py-2 text-sm font-semibold text-white">
                  ✓ Got it
                </button>
                <button onClick={() => dispatch({ type: "PLAYER_ANSWER", answerId: "self_wrong", correct: false, questionText: q.question })}
                  className="flex-1 rounded-xl bg-red-400 py-2 text-sm font-semibold text-white">
                  ✗ Missed it
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {q.answers.map((a, i) => (
              <AnswerBtn
                key={a.id}
                label={ANSWER_LABELS[i]}
                text={a.text}
                btnState={isFeedback ? getBtnState(a) : "idle"}
                disabled={!isPlayerTurn}
                onClick={() => handleAnswer(a.id, a.isCorrect)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
