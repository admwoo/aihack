import { createServerSupabaseClient } from "@/lib/supabase-server";
import SignOutButton from "@/app/components/SignOutButton";

export default async function Home() {
  let user = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // No session or error — treat as logged out
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fff8f0 0%, #feecd2 50%, #fde0b8 100%)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 backdrop-blur-sm md:px-12" style={{ background: "rgba(255,248,240,0.88)", borderBottom: "1px solid #e8cdb5" }}>
        <span className="text-xl font-bold" style={{ color: "#5a2d0c" }}>Cooked 🍳</span>
        {user ? (
          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
              style={{ borderColor: "#e8cdb5", color: "#5a2d0c", background: "rgba(255,252,248,0.8)" }}
            >
              Dashboard
            </a>
            <SignOutButton />
          </div>
        ) : (
          <a
            href="/login"
            className="rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
            style={{ borderColor: "#e8cdb5", color: "#5a2d0c", background: "rgba(255,252,248,0.8)" }}
          >
            Sign In
          </a>
        )}
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center md:px-12 md:pt-28">
        <div className="mb-5 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold" style={{ borderColor: "#e8cdb5", color: "#8b5e3c", background: "rgba(255,252,248,0.7)" }}>
          🍕 AI-powered food fight quiz
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl" style={{ color: "#5a2d0c" }}>
          Study hard.
          <br />
          <span style={{ color: "#e07b30" }}>Or you&apos;re cooked.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed" style={{ color: "#8b5e3c" }}>
          Upload your notes or a PDF, let AI build the quiz, then battle Chef Bot in a
          turn-based food fight. Answer correctly to throw food — answer wrong and you&apos;re getting hit.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {user ? (
            <a
              href="/dashboard"
              className="w-full rounded-full px-8 py-4 text-base font-bold text-white transition-all active:translate-y-0.5 sm:w-auto"
              style={{ background: "linear-gradient(135deg, #e8a849, #e07b30)", boxShadow: "0 5px 0 #b86a20, 0 8px 24px rgba(0,0,0,0.15)" }}
            >
              Go to Dashboard →
            </a>
          ) : (
            <>
              <a
                href="/register"
                className="w-full rounded-full px-8 py-4 text-base font-bold text-white transition-all active:translate-y-0.5 sm:w-auto"
                style={{ background: "linear-gradient(135deg, #e8a849, #e07b30)", boxShadow: "0 5px 0 #b86a20, 0 8px 24px rgba(0,0,0,0.15)" }}
              >
                Start Cooking →
              </a>
              <a
                href="/login"
                className="w-full rounded-full border px-8 py-4 text-base font-bold transition-all hover:brightness-95 sm:w-auto"
                style={{ borderColor: "#e8cdb5", color: "#5a2d0c", background: "rgba(255,252,248,0.85)" }}
              >
                Sign In
              </a>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-28 md:px-12">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border p-8" style={{ background: "rgba(255,252,248,0.75)", borderColor: "#e8cdb5" }}>
            <div className="mb-4 text-4xl">📄</div>
            <h3 className="mb-2 text-lg font-bold" style={{ color: "#5a2d0c" }}>
              Upload Study Material
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#8b5e3c" }}>
              Drop in a PDF or paste your notes. We extract the content and feed it to the AI.
            </p>
          </div>
          <div className="rounded-2xl border p-8" style={{ background: "rgba(255,252,248,0.75)", borderColor: "#e8cdb5" }}>
            <div className="mb-4 text-4xl">🤖</div>
            <h3 className="mb-2 text-lg font-bold" style={{ color: "#5a2d0c" }}>
              AI Builds the Quiz
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#8b5e3c" }}>
              Claude reads your material and generates multiple choice, true/false,
              and short answer questions automatically.
            </p>
          </div>
          <div className="rounded-2xl border p-8" style={{ background: "rgba(255,252,248,0.75)", borderColor: "#e8cdb5" }}>
            <div className="mb-4 text-4xl">🍕</div>
            <h3 className="mb-2 text-lg font-bold" style={{ color: "#5a2d0c" }}>
              Battle to the Last HP
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#8b5e3c" }}>
              Take turns answering questions. Correct answers launch food at your
              opponent. Wrong answers? You&apos;re getting hit. Last one standing wins.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm font-semibold" style={{ borderColor: "#e8cdb5", color: "#a07050" }}>
        Cooked &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
